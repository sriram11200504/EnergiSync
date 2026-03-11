const express = require('express');
const router = express.Router();
const Device = require('../models/Device');

// Get all dynamic IoT devices
router.get('/', async (req, res) => {
    try {
        const devices = await Device.find().sort({ lastSeen: -1 });
        res.json(devices);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch devices' });
    }
});

module.exports = router;
