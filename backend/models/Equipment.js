const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    zone: { type: String, required: true },
    status: { type: Boolean, default: false },
    power: { type: Number, required: true }, // Power consumption in W when ON
    type: { type: String, required: true },
    value: { type: Number, default: 0 }, // Real-time telemetry (Temp, Speed, Intensity)
    minScale: { type: Number, default: null }, // e.g., 16 for AC
    maxScale: { type: Number, default: null }, // e.g., 30 for AC
    unit: { type: String, default: '' }, // e.g., '°C', '%', 'Level'
    schedule: {
        enabled: { type: Boolean, default: false },
        time: { type: String, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
