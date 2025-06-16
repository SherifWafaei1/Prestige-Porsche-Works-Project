const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const PendingVerification = require('../models/PendingVerification');
const mongoose = require('mongoose');
const fs = require('fs').promises; // Import fs.promises for async file operations
const path = require('path'); // Import path module

// Utility function to get email HTML
async function getEmailHtml(subject, bodyContent) {
    const templatePath = path.join(__dirname, '..', 'utils', 'emailTemplate.html');
    let htmlTemplate = await fs.readFile(templatePath, 'utf8');
    htmlTemplate = htmlTemplate.replace('{{SUBJECT}}', subject);
    htmlTemplate = htmlTemplate.replace('{{EMAIL_SUBJECT}}', subject);
    htmlTemplate = htmlTemplate.replace('{{EMAIL_BODY}}', bodyContent);
    return htmlTemplate;
}

// Register route
router.post('/register', [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('address').notEmpty().withMessage('Address is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, phoneNumber, address } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Check if a pending verification already exists
        let pending = await PendingVerification.findOne({ email });
        if (pending) {
            return res.status(400).json({ message: 'A verification is already pending for this email. Please check your email for the PIN or wait for it to expire.' });
        }

        // Generate a 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store registration info in PendingVerification
        const pendingVerification = new PendingVerification({
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            address,
            role: req.body.role || 'user',
            pin,
            pinExpires
        });
        await pendingVerification.save();

        // Send PIN to user's email using HTML template
        const pinEmailSubject = 'Your Verification PIN';
        const pinEmailBody = `<p>Dear ${firstName},</p>
                              <p>Thank you for registering at Prestige Porsche Works. Please use the following PIN to verify your email address:</p>
                              <div class="discount-code">${pin}</div>
                              <p>This PIN is valid for 10 minutes.</p>
                              <p>If you did not request this, please ignore this email.</p>`;
        const pinEmailHtml = await getEmailHtml(pinEmailSubject, pinEmailBody);
        await sendEmail(email, pinEmailSubject, `Your verification PIN is: ${pin}`, pinEmailHtml);

        res.status(201).json({
            message: 'Registration successful! A verification PIN has been sent to your email. Please verify to complete registration.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', [
    body('email').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PIN verification endpoint
router.post('/verify-pin', async (req, res) => {
    const { email, pin } = req.body;
    try {
        // Find pending verification
        const pending = await PendingVerification.findOne({ email });
        if (!pending) {
            return res.status(400).json({ message: 'No pending verification found for this email.' });
        }
        if (pending.pin !== pin || pending.pinExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired PIN' });
        }
        // Check if user already exists (should not happen, but just in case)
        let user = await User.findOne({ email });
        if (user) {
            await PendingVerification.deleteOne({ email }); // Clean up
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create user (do NOT hash password here, let pre-save hook do it)
        user = new User({
            firstName: pending.firstName,
            lastName: pending.lastName,
            email: pending.email,
            password: pending.password, // plain password, will be hashed by pre-save hook
            phoneNumber: pending.phoneNumber,
            address: pending.address,
            role: pending.role,
            isVerified: true
        });
        await user.save();
        // Delete pending verification
        await PendingVerification.deleteOne({ email });
        // Send welcome email with discount code
        const welcomeSubject = 'Welcome to Prestige Porsche Works!';
        const welcomeBody = `<p>Dear ${user.firstName},</p>
                             <p>Thank you for registering at Prestige Porsche Works! We are thrilled to welcome you to our community of Porsche enthusiasts.</p>
                             <p>As a token of our appreciation for trusting us, here is your exclusive discount code for new customers:</p>
                             <div class="discount-code">NEWCUSTOMER</div>
                             <p>Use this code during your next booking to enjoy a special discount.</p>
                             <p>If you have any questions or need assistance, our team is always here to help.</p>
                             <p>Thank you for choosing us to customize your dream Porsche!</p>
                             <p>Best regards,<br/>Prestige Porsche Works Team</p>`;
        const welcomeHtml = await getEmailHtml(welcomeSubject, welcomeBody);
        try {
            console.log('Sending welcome email to', user.email);
            await sendEmail(user.email, welcomeSubject, welcomeBody, welcomeHtml);
            console.log('Welcome email sent successfully to', user.email);
        } catch (emailErr) {
            console.error('Failed to send welcome email to', user.email, emailErr);
        }
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Resend PIN endpoint
router.post('/resend-pin', async (req, res) => {
    const { email } = req.body;
    try {
        const pending = await PendingVerification.findOne({ email });
        if (!pending) {
            return res.status(400).json({ message: 'No pending verification found for this email.' });
        }
        // Generate a new 6-digit PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
        pending.pin = pin;
        pending.pinExpires = pinExpires;
        await pending.save();

        const resendPinSubject = 'Your New Verification PIN';
        const resendPinBody = `<p>Dear ${pending.firstName},</p>
                               <p>You requested a new verification PIN. Please use the following PIN to verify your email address:</p>
                               <div class="discount-code">${pin}</div>
                               <p>This PIN is valid for 10 minutes.</p>
                               <p>If you did not request this, please ignore this email.</p>`;
        const resendPinHtml = await getEmailHtml(resendPinSubject, resendPinBody);

        await sendEmail(email, resendPinSubject, `Your new verification PIN is: ${pin}`, resendPinHtml);
        res.json({ message: 'A new verification PIN has been sent to your email.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user's cart
router.get('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ cart: user.cart || [] });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update current user's cart
router.post('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.cart = req.body.cart || [];
        await user.save();
        res.json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Clear current user's cart
router.delete('/cart', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.cart = [];
        await user.save();
        res.json({ cart: user.cart });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel registration endpoint
router.post('/cancel-registration', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    try {
        const pending = await PendingVerification.findOne({ email });
        if (pending) {
            await PendingVerification.deleteOne({ email });
            return res.json({ message: 'Registration canceled' });
        }
        res.status(400).json({ message: 'No pending registration found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Password Reset Logic ---
const resetPinSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    pin: { type: String, required: true },
    pinExpires: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
const ResetPin = mongoose.models.ResetPin || mongoose.model('ResetPin', resetPinSchema);

// 1. Send reset PIN
router.post('/send-reset-pin', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'No user found with this email.' });
        // Generate PIN
        const pin = Math.floor(100000 + Math.random() * 900000).toString();
        const pinExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        // Upsert ResetPin
        await ResetPin.findOneAndUpdate(
            { email },
            { pin, pinExpires, createdAt: new Date() },
            { upsert: true, new: true }
        );

        const resetPinSubject = 'Your Password Reset PIN';
        const resetPinBody = `<p>Dear ${user.firstName},</p>
                              <p>You have requested to reset your password. Please use the following PIN to proceed:</p>
                              <div class="discount-code">${pin}</div>
                              <p>This PIN is valid for 10 minutes.</p>
                              <p>If you did not request this, please ignore this email.</p>`;
        const resetPinHtml = await getEmailHtml(resetPinSubject, resetPinBody);

        await sendEmail(email, resetPinSubject, `Your password reset PIN is: ${pin}`, resetPinHtml);
        res.json({ message: 'Reset PIN sent to your email.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 2. Verify reset PIN
router.post('/verify-reset-pin', async (req, res) => {
    const { email, pin } = req.body;
    if (!email || !pin) return res.status(400).json({ message: 'Email and PIN required' });
    try {
        const reset = await ResetPin.findOne({ email });
        if (!reset || reset.pin !== pin || reset.pinExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired PIN.' });
        }
        res.json({ message: 'PIN verified.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// 3. Change password
router.post('/change-password', async (req, res) => {
    const { email, pin, newPassword } = req.body;
    if (!email || !pin || !newPassword) return res.status(400).json({ message: 'All fields required.' });
    try {
        const reset = await ResetPin.findOne({ email });
        if (!reset || reset.pin !== pin || reset.pinExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired PIN.' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'No user found.' });
        user.password = newPassword; // Will be hashed by pre-save hook
        await user.save();
        await ResetPin.deleteOne({ email });
        // Send security alert email after password reset
        const alertSubject = 'Security Alert: Your Password Was Changed';
        const alertBody = `<p>Dear ${user.firstName},</p>
                           <p>Your password for Prestige Porsche Works was recently changed using the password reset feature.</p>
                           <p>If you did NOT request this change, your account may be at risk. Please contact us immediately at +20 1026011230.</p>
                           <p>If you did request this change, you can safely ignore this message.</p>
                           <p>Thank you for helping us keep your account secure.</p>
                           <p>Prestige Porsche Works Security Team</p>`;
        const alertHtml = await getEmailHtml(alertSubject, alertBody);
        try {
            console.log('Sending password reset alert email to', user.email);
            await sendEmail(user.email, alertSubject, alertBody, alertHtml);
            console.log('Password reset alert email sent successfully to', user.email);
        } catch (emailErr) {
            console.error('Failed to send password reset alert email to', user.email, emailErr);
        }
        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 