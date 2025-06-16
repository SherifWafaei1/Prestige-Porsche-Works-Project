const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Discount = require('../models/Discount');
const { adminAuth } = require('../middleware/auth');

// Route to get all discount codes (Admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        console.error('Error fetching discount codes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to add a new discount code (Admin only)
router.post('/', adminAuth, [
    body('code').notEmpty().withMessage('Discount code is required').trim().toUpperCase(),
    body('percentage').isInt({ min: 1, max: 100 }).withMessage('Percentage must be a number between 1 and 100'),
    body('description').notEmpty().withMessage('Description is required').trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { code, percentage, description, active } = req.body;

    try {
        console.log('Received request to add new discount:', { code, percentage, description, active });
        let discount = await Discount.findOne({ code });
        if (discount) {
            console.log('Discount code already exists:', code);
            return res.status(400).json({ message: 'Discount code already exists' });
        }

        discount = new Discount({
            code,
            percentage,
            description,
            active: active !== undefined ? active : true // Default to true if not provided
        });

        await discount.save();
        console.log('Discount code added successfully:', discount);
        res.status(201).json({ message: 'Discount code added successfully', discount });
    } catch (error) {
        console.error('Error adding discount code in try block:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to update a discount code (Admin only)
router.put('/:id', adminAuth, [
    body('percentage').optional().isInt({ min: 1, max: 100 }).withMessage('Percentage must be a number between 1 and 100'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty').trim(),
    body('active').optional().isBoolean().withMessage('Active must be a boolean')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { percentage, description, active } = req.body;

    try {
        const updatedFields = {};
        if (percentage !== undefined) updatedFields.percentage = percentage;
        if (description !== undefined) updatedFields.description = description;
        if (active !== undefined) updatedFields.active = active;

        const discount = await Discount.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true, runValidators: true }
        );

        if (!discount) {
            return res.status(404).json({ message: 'Discount code not found' });
        }

        res.json({ message: 'Discount code updated successfully', discount });
    } catch (error) {
        console.error('Error updating discount code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to delete a discount code (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const discount = await Discount.findByIdAndDelete(id);

        if (!discount) {
            return res.status(404).json({ message: 'Discount code not found' });
        }

        res.json({ message: 'Discount code deleted successfully' });
    } catch (error) {
        console.error('Error deleting discount code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Public endpoint to verify a discount code
router.get('/verify', async (req, res) => {
    const code = req.query.code ? req.query.code.toUpperCase().trim() : null;
    if (!code) {
        return res.status(400).json({ message: 'Discount code is required' });
    }
    try {
        const discount = await Discount.findOne({ code });
        if (!discount || !discount.active) {
            return res.status(404).json({ message: 'Invalid or inactive discount code' });
        }
        res.json({ percentage: discount.percentage, description: discount.description });
    } catch (error) {
        console.error('Error verifying discount code:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 