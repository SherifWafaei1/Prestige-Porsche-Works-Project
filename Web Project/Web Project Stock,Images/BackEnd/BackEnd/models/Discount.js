const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    percentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100 // Assuming percentage can be up to 100%
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Check if discount is valid
DiscountSchema.methods.isValid = function() {
    const now = new Date();
    return (
        this.active &&
        now >= this.startDate &&
        now <= this.endDate &&
        (!this.maxUses || this.currentUses < this.maxUses)
    );
};

const Discount = mongoose.model('Discount', DiscountSchema);

module.exports = Discount; 