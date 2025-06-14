const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, phoneNumber, address, email, password } = req.body;
        
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;
        if (email) user.email = email;
        
        // If a new password is provided, hash and update it
        if (password) {
            user.password = password; // The pre-save hook in User model will hash this
        }

        await user.save(); // Save the user to trigger pre-save middleware (for password hashing)

        // Return the updated user (without password)
        const updatedUser = await User.findById(req.user._id).select('-password');
        res.json(updatedUser);

    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Change password
router.put('/change-password', auth, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user account
router.delete('/profile', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: 'User account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user role (admin only)
router.put('/:id/role', adminAuth, [
    body('role').isIn(['user', 'admin']).withMessage("Role must be 'user' or 'admin'")
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single user by ID (admin only)
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching single user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user by ID (admin only) - for general fields
router.put('/:id', adminAuth, [
    body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phoneNumber').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('password').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, phoneNumber, address, password } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (address) user.address = address;

        // If a new password is provided, hash and update it
        if (password) {
            user.password = password; // The pre-save hook in User model will hash this
        }

        await user.save(); // Save the user to trigger pre-save middleware (for password hashing)

        // Return the updated user (without password)
        const updatedUser = await User.findById(req.params.id).select('-password');
        res.json(updatedUser);

    } catch (error) {
        console.error('Error updating user by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user by ID (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user by ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 