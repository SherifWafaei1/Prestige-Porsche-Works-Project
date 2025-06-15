const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');
const { adminAuth } = require('../middleware/auth');

// Route to submit a new contact message
router.post('/', [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('message').notEmpty().withMessage('Message is required').trim()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    try {
        const newContactMessage = new ContactMessage({
            name,
            email,
            message
        });

        await newContactMessage.save();
        res.status(201).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending contact message:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to get all contact messages (Admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 