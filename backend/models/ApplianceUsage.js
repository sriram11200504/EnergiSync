const mongoose = require('mongoose');

const applianceUsageSchema = new mongoose.Schema({
    applianceId: {
        type: Number,
        required: true,
        ref: 'Appliance' // Keeping number ref to match the Appliance custom id logic
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: null
    },
    durationHours: {
        type: Number,
        default: 0
    },
    energyConsumed: {
        type: Number,
        default: 0 // In kWh
    },
    cost: {
        type: Number,
        default: 0 // In currency
    }
}, { timestamps: true });

module.exports = mongoose.model('ApplianceUsage', applianceUsageSchema);
