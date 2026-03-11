const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, default: 'Sensor' },
    tbId: { type: String }, // ThingsBoard Device ID
    accessToken: { type: String }, // ThingsBoard Access Token
    status: { type: String, enum: ['ON', 'OFF', 'ONLINE', 'OFFLINE'], default: 'OFF' },
    lastPower: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now },
    metadata: { type: Map, of: String }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
