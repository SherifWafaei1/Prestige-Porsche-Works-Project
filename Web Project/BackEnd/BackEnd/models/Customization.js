const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: ['Performance', 'Exterior', 'Interior', 'Wheels', 'Audio', 'Technology']
    },
    compatibleModels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PorscheModel'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
customizationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Customization', customizationSchema); 