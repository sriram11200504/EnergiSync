const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    zone: { type: String, required: true },
    status: { type: Boolean, default: false },
    power: { type: Number, required: true }, // Power consumption in kW when ON
    type: { type: String, required: true },
    schedule: {
        enabled: { type: Boolean, default: false },
        time: { type: String, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', equipmentSchema);
