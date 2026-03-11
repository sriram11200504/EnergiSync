require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/Device');
const axios = require('axios');

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/energysync');
        const devices = await Device.find();
        const baseUrl = process.env.THINGSBOARD_URL || 'http://localhost:9090';

        console.log(`🔍 Diagnosing ${devices.length} devices...`);

        for (const device of devices) {
            console.log(`\nTesting Device: ${device.name}`);
            console.log(`Token: ${device.accessToken}`);

            if (!device.accessToken) {
                console.log('❌ Error: No access token found for this device');
                continue;
            }

            try {
                const url = `${baseUrl}/api/v1/${device.accessToken}/telemetry`;
                const res = await axios.post(url, { test: true, timestamp: Date.now() });
                console.log(`✅ Success! Status: ${res.status}`);
            } catch (err) {
                console.log(`❌ Failed! Status: ${err.response?.status || 'No Response'}`);
                if (err.response?.status === 401) {
                    console.log('👉 Tip: This token is invalid in ThingsBoard.');
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Audit Failed:', err);
        process.exit(1);
    }
}

diagnose();
