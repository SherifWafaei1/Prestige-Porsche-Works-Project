const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    authPin: String,
    authPinExpires: Date,
    isVerified: {
        type: Boolean,
        default: false
    },
    cart: {
        type: Array,
        default: []
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    console.log('User pre-save hook triggered.');
    if (this.isModified('password')) {
        console.log('Password field is modified. Hashing password...');
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
            console.log('Password hashed successfully.');
            next();
        } catch (error) {
            console.error('Error hashing password:', error);
            next(error);
        }
    } else {
        console.log('Password field not modified, skipping hashing.');
        return next();
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 