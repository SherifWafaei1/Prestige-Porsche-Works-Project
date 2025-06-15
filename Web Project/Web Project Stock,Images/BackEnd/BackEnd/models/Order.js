const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/, 'Please fill a valid email address']
    },
    modelName: {
        type: String,
        required: true,
        trim: true
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    // In a real application, you might link to User and PorscheModel models
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'PorscheModel' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema); 