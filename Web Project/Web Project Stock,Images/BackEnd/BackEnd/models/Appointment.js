const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        enum: ['consultation', 'test-drive', 'customization', 'maintenance'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    notes: {
        type: String
    },
    porscheModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PorscheModel'
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
appointmentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 