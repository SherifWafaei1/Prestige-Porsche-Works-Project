const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const { auth, adminAuth } = require('../middleware/auth');

// Get all appointments (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('user', 'firstName lastName email')
            .populate('porscheModel', 'name')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's appointments
router.get('/my-appointments', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ user: req.user._id })
            .populate('porscheModel', 'name')
            .sort({ date: 1, time: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'firstName lastName email')
            .populate('porscheModel', 'name');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user is admin or the appointment owner
        if (req.user.role !== 'admin' && appointment.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new appointment
router.post('/', auth, [
    body('date').isDate().withMessage('Valid date is required'),
    body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required'),
    body('serviceType').isIn(['consultation', 'test-drive', 'customization', 'maintenance'])
        .withMessage('Invalid service type'),
    body('porscheModel').optional().isMongoId().withMessage('Invalid Porsche model ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { date, time, serviceType, porscheModel, notes } = req.body;

        // Check if the time slot is available
        const existingAppointment = await Appointment.findOne({
            date,
            time,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }

        const appointment = new Appointment({
            user: req.user._id,
            date,
            time,
            serviceType,
            porscheModel,
            notes,
            status: 'pending'
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update appointment status (admin only)
router.patch('/:id/status', adminAuth, [
    body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel appointment
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user is admin or the appointment owner
        if (req.user.role !== 'admin' && appointment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 