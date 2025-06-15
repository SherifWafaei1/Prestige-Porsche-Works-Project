const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customization = require('../models/Customization');
const { auth, adminAuth } = require('../middleware/auth');

// Get all customizations
router.get('/', async (req, res) => {
    try {
        const customizations = await Customization.find();
        res.json(customizations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customization by ID
router.get('/:id', async (req, res) => {
    try {
        const customization = await Customization.findById(req.params.id);
        if (!customization) {
            return res.status(404).json({ message: 'Customization not found' });
        }
        res.json(customization);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new customization (admin only)
router.post('/', adminAuth, [
    body('name').notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('compatibleModels').isArray().withMessage('Compatible models must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description, price, category, compatibleModels } = req.body;
        const customization = new Customization({
            name,
            description,
            price,
            category,
            compatibleModels
        });

        await customization.save();
        res.status(201).json(customization);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update customization (admin only)
router.put('/:id', adminAuth, [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('compatibleModels').optional().isArray().withMessage('Compatible models must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const customization = await Customization.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!customization) {
            return res.status(404).json({ message: 'Customization not found' });
        }

        res.json(customization);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete customization (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const customization = await Customization.findByIdAndDelete(req.params.id);
        if (!customization) {
            return res.status(404).json({ message: 'Customization not found' });
        }
        res.json({ message: 'Customization deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customizations by category
router.get('/category/:category', async (req, res) => {
    try {
        const customizations = await Customization.find({ category: req.params.category });
        res.json(customizations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get customizations compatible with a specific model
router.get('/model/:modelId', async (req, res) => {
    try {
        const customizations = await Customization.find({
            compatibleModels: req.params.modelId
        });
        res.json(customizations);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 