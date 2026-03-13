import mongoose from 'mongoose';

const equipmentUsageSchema = new mongoose.Schema({
    equipmentId: {
        type: Number,
        required: true,
        ref: 'Equipment' // Keeping number ref to match the Equipment custom id logic
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

module.exports = mongoose.model('EquipmentUsage', equipmentUsageSchema);
