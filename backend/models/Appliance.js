const mongoose = require('mongoose');

const applianceSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    room: { type: String, required: true },
    status: { type: Boolean, default: false },
    power: { type: Number, required: true }, // Power consumption in kW when ON
    type: { type: String, required: true },
    schedule: {
        enabled: { type: Boolean, default: false },
        time: { type: String, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Appliance', applianceSchema);
