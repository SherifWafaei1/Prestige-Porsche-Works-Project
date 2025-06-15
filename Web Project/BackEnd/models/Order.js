const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    userEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    items: [
        {
            modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'PorscheModel', required: true },
            modelName: { type: String, required: true },
            color: { type: String, required: true },
            modifications: { type: Object, default: {} },
            price: { type: Number, required: true }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Object,
        default: null
    },
    discountedTotal: {
        type: Number
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Shipped', 'Delivered'],
        default: 'Pending'
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purchasePin: { type: String },
    purchasePinExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema); 