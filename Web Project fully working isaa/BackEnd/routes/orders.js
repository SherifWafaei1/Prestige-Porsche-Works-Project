const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const PorscheModel = require('../models/PorscheModel');
const Discount = require('../models/Discount');
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const fs = require('fs').promises;
const path = require('path');

const pendingOrders = {};

// Get all orders (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'firstName lastName email')
            // .populate('model', 'name basePrice') // REMOVED: no top-level model field
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('model', 'name basePrice imageUrl')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'firstName lastName email')

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is admin or the order owner
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new order
router.post('/', [
    body('items').isArray({ min: 1 }).withMessage('Order must include at least one car'),
    body('items.*.modelId').isMongoId().withMessage('Each item must have a valid modelId'),
    body('items.*.modelName').notEmpty().withMessage('Each item must have a modelName'),
    body('items.*.color').notEmpty().withMessage('Each item must have a color'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Each item must have a valid price'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be a non-negative number'),
    body('status').isIn(['Pending', 'Confirmed', 'Cancelled', 'Shipped', 'Delivered']).withMessage('Invalid order status').optional(),
    body('user').isMongoId().withMessage('Valid user ID is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { user, items, discount, status } = req.body;
    try {
        const foundUser = await User.findById(user);
        if (!foundUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Always calculate totalAmount from items
        let calcTotal = items.reduce((sum, item) => sum + Number(item.price), 0);
        let discountedTotal = calcTotal;
        if (discount && discount.percentage) {
            discountedTotal = Math.round(calcTotal * (1 - discount.percentage / 100));
        }
        const newOrder = new Order({
            user,
            userName: `${foundUser.firstName} ${foundUser.lastName}`,
            userEmail: foundUser.email,
            items,
            totalAmount: calcTotal,
            discount,
            discountedTotal,
            status: status || 'Pending'
        });
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update order status (admin only)
router.put('/:id', adminAuth, [
    body('status').isIn(['Pending', 'Confirmed', 'Cancelled', 'Shipped', 'Delivered']).withMessage('Invalid order status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update payment status (admin only)
router.patch('/:id/payment', adminAuth, [
    body('paymentStatus').isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage('Invalid payment status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { paymentStatus: req.body.paymentStatus },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Utility function to get email HTML (duplicate from auth.js for now, consider a shared util if more needed)
async function getEmailHtml(subject, bodyContent) {
    const templatePath = path.join(__dirname, '..', 'utils', 'emailTemplate.html');
    let htmlTemplate = await fs.readFile(templatePath, 'utf8');
    htmlTemplate = htmlTemplate.replace('{{SUBJECT}}', subject);
    htmlTemplate = htmlTemplate.replace('{{EMAIL_SUBJECT}}', subject);
    htmlTemplate = htmlTemplate.replace('{{EMAIL_BODY}}', bodyContent);
    return htmlTemplate;
}

// Request a purchase PIN (before confirming payment)
router.post('/request-pin', auth, async (req, res) => {
    try {
        // Generate PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        // Store order data and PIN in memory (keyed by user ID)
        pendingOrders[req.user._id] = {
            orderData: req.body,
            pin,
            pinExpires
        };
        // Build summary for email
        const items = req.body.items || [];
        let itemsSummaryHtml = items.map((item, idx) => {
            let mods = item.modifications && Object.values(item.modifications).length
                ? Object.values(item.modifications).join(', ')
                : 'None';
            return `<p><strong>Car #${idx + 1}:</strong><br/>
                    Model: ${item.modelName}<br/>
                    Color: ${item.color}<br/>
                    Modifications: ${mods}<br/>
                    Price: $${item.price}</p>`;
        }).join('');
        
        let summaryHtml = `
            <p>Dear ${req.user.firstName},</p>
            <p>Thank you for requesting a purchase PIN. Please use the following PIN to confirm your order:</p>
            <div class="discount-code">${pin}</div>
            <p>This PIN is valid for 10 minutes.</p>
            <p><strong>Order Summary:</strong></p>
            <div class="receipt-summary">
                ${itemsSummaryHtml}
                <p><strong>Cart Total: $${req.body.totalAmount}</strong></p>
        `;
        if (req.body.discount && req.body.discount.percentage) {
            let discountedTotal = Math.round(req.body.totalAmount * (1 - req.body.discount.percentage / 100));
            summaryHtml += `<p>Discount: -${req.body.discount.percentage}% (${req.body.discount.description})</p>`;
            summaryHtml += `<p><strong>Total After Discount: $${discountedTotal}</strong></p>`;
        }
        summaryHtml += `<p>If this was not you, please ignore this email and do not share this PIN.</p>
                        </div>`;

        // Email PIN and order summary with HTML template
        const user = await User.findById(req.user._id);
        const emailSubject = 'Confirm Your Porsche Purchase';
        const emailHtml = await getEmailHtml(emailSubject, summaryHtml);

        await sendEmail(user.email, emailSubject, `Your confirmation PIN is: ${pin}`, emailHtml);
        res.json({ success: true, message: 'A confirmation PIN has been sent to your email.' });
    } catch (err) {
        console.error('Error in /api/orders/request-pin:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify purchase PIN
router.post('/verify-pin', auth, async (req, res) => {
    try {
        const { pin } = req.body;
        const pending = pendingOrders[req.user._id];
        if (!pending) return res.status(400).json({ message: 'No pending order found. Please start again.' });
        if (!pending.pin || !pending.pinExpires || pending.pin !== pin || pending.pinExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired PIN.' });
        }
        // Create the order in DB
        const orderData = pending.orderData;
        const foundUser = await User.findById(req.user._id);
        let calcTotal = orderData.items.reduce((sum, item) => sum + Number(item.price), 0);
        let discountedTotal = calcTotal;
        if (orderData.discount && orderData.discount.percentage) {
            discountedTotal = Math.round(calcTotal * (1 - orderData.discount.percentage / 100));
        }
        const newOrder = new Order({
            user: req.user._id,
            userName: `${foundUser.firstName} ${foundUser.lastName}`,
            userEmail: foundUser.email,
            items: orderData.items,
            totalAmount: calcTotal,
            discount: orderData.discount,
            discountedTotal,
            status: orderData.status || 'Pending'
        });
        await newOrder.save();
        // Decrement stock for each purchased model
        for (const item of orderData.items) {
            await PorscheModel.findByIdAndUpdate(
                item.modelId,
                { $inc: { stock: -1 } }
            );
        }
        // Clear pending order
        delete pendingOrders[req.user._id];

        // Send thank you email with receipt and discount code using HTML template
        let itemsSummaryHtml = orderData.items.map((item, idx) => {
            let mods = item.modifications && Object.values(item.modifications).length
                ? Object.values(item.modifications).join(', ')
                : 'None';
            return `<p><strong>Car #${idx + 1}:</strong><br/>
                    Model: ${item.modelName}<br/>
                    Color: ${item.color}<br/>
                    Modifications: ${mods}<br/>
                    Price: $${item.price}</p>`;
        }).join('');
        
        let receiptHtml = `
            <p>Dear ${foundUser.firstName},</p>
            <p>Your order has been confirmed! Thank you for your purchase. Here is your order summary:</p>
            <div class="receipt-summary">
                ${itemsSummaryHtml}
                <p><strong>Total Paid: $${discountedTotal}</strong></p>
        `;
        if (orderData.discount && orderData.discount.percentage) {
            receiptHtml += `<p>Discount applied: -${orderData.discount.percentage}% (${orderData.discount.description})</p>`;
        }
        receiptHtml += `
            </div>
            <p>We will contact you soon to confirm your order and arrange delivery. If you have any questions, please contact us.</p>
            <p>Thank you for choosing Prestige Porsche Works! We will do our best to satisfy your needs and look forward to future purchases. As a token of appreciation, here is a discount code for your next order:</p>
            <div class="discount-code">THANKYOU (2% off)</div>
            <p>Best regards,<br/>Prestige Porsche Works Team</p>
        `;
        const receiptSubject = 'Your Porsche Order Receipt & Thank You!';
        const finalReceiptHtml = await getEmailHtml(receiptSubject, receiptHtml);

        await sendEmail(foundUser.email, receiptSubject, `Your order has been confirmed! Total: $${discountedTotal}`, finalReceiptHtml);

        res.json({ message: 'Order confirmed and payment completed.', discountedTotal });
    } catch (err) {
        console.error('Error in /api/orders/verify-pin:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get orders by user email (for order history)
router.get('/user/:email', async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 