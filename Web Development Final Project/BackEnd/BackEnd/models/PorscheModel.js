const mongoose = require('mongoose');

const porscheModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 5
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    imageUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    features: [{
        type: String
    }],
    specifications: {
        engine: String,
        horsepower: Number,
        "0-60mph": String,
        topSpeed: String
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
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
porscheModelSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const PorscheModel = mongoose.model('PorscheModel', porscheModelSchema);

module.exports = PorscheModel; 