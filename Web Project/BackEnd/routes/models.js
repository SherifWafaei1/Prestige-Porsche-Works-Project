const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PorscheModel = require('../models/PorscheModel');
const { auth, adminAuth } = require('../middleware/auth');

// Get all Porsche models
router.get('/', async (req, res) => {
    try {
        const models = await PorscheModel.find({ isActive: true });
        res.json(models);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single Porsche model
router.get('/:id', async (req, res) => {
    try {
        const model = await PorscheModel.findById(req.params.id);
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new Porsche model (admin only)
router.post('/', adminAuth, [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('basePrice').isNumeric().withMessage('Base price must be a number'),
    body('imageUrl').notEmpty().withMessage('Image URL is required'),
    body('specifications').isObject().withMessage('Specifications must be an object'),
    body('stock').isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const model = new PorscheModel(req.body);
        await model.save();
        res.status(201).json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Porsche model (admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const model = await PorscheModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Porsche model (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const model = await PorscheModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        
        res.json({ message: 'Model deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update stock (admin only)
router.patch('/:id/stock', adminAuth, [
    body('stock').isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const model = await PorscheModel.findByIdAndUpdate(
            req.params.id,
            { stock: req.body.stock },
            { new: true }
        );
        
        if (!model) {
            return res.status(404).json({ message: 'Model not found' });
        }
        
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 