const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PorscheModel = require('../models/PorscheModel');
const { auth, adminAuth } = require('../middleware/auth');

// Get all Porsche models
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const limit = parseInt(req.query.limit) || 10; // Items per page, default to 10
        const skip = (page - 1) * limit;

        const models = await PorscheModel.find().skip(skip).limit(limit);
        const totalModels = await PorscheModel.countDocuments();

        res.json({
            models,
            currentPage: page,
            totalPages: Math.ceil(totalModels / limit),
            totalModels
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single Porsche model by ID
router.get('/:id', async (req, res) => {
    try {
        const model = await PorscheModel.findById(req.params.id);
        if (!model) {
            return res.status(404).json({ message: 'Porsche model not found' });
        }
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new Porsche model (admin only)
router.post('/', adminAuth, [
    body('name').notEmpty().withMessage('Model name is required').trim(),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 5 }).withMessage('Valid year is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('imageUrl').optional().isURL().withMessage('Valid image URL is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, year, price, imageUrl, description, features, specifications } = req.body;

    try {
        let model = await PorscheModel.findOne({ name, year });
        if (model) {
            return res.status(400).json({ message: 'Porsche model with this name and year already exists' });
        }

        model = new PorscheModel({
            name,
            year,
            price,
            imageUrl,
            description,
            features,
            specifications
        });

        await model.save();
        res.status(201).json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a Porsche model (admin only)
router.put('/:id', adminAuth, [
    body('name').optional().notEmpty().withMessage('Model name cannot be empty').trim(),
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 5 }).withMessage('Valid year is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('imageUrl').optional().isURL().withMessage('Valid image URL is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, year, price, imageUrl, description, features, specifications } = req.body;

    try {
        const updateFields = {};
        if (name) updateFields.name = name;
        if (year) updateFields.year = year;
        if (price) updateFields.price = price;
        if (imageUrl) updateFields.imageUrl = imageUrl;
        if (description) updateFields.description = description;
        if (features) updateFields.features = features;
        if (specifications) updateFields.specifications = specifications;

        const model = await PorscheModel.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!model) {
            return res.status(404).json({ message: 'Porsche model not found' });
        }

        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a Porsche model (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const model = await PorscheModel.findByIdAndDelete(req.params.id);
        if (!model) {
            return res.status(404).json({ message: 'Porsche model not found' });
        }
        res.json({ message: 'Porsche model deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update stock for a Porsche model (admin only)
router.patch('/:id/stock', adminAuth, [
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { stock } = req.body;
        const model = await PorscheModel.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true, runValidators: true }
        );

        if (!model) {
            return res.status(404).json({ message: 'Porsche model not found' });
        }
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 