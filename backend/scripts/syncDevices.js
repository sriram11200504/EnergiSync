require('dotenv').config();
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const Device = require('../models/Device');
const tbService = require('../services/thingsboardService');

async function sync() {
    try {
        console.log('🔄 Starting Database to ThingsBoard Synchronization...');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Fetch all legacy Equipment
        const equipmentList = await Equipment.find();
        console.log(`📋 Found ${equipmentList.length} legacy equipment items.`);

        for (const eq of equipmentList) {
            // Check if Device already exists
            let device = await Device.findOne({ name: eq.name });

            if (!device) {
                console.log(`🆕 Provisioning legacy equipment: ${eq.name}`);
                try {
                    const tbDevice = await tbService.createDevice(eq.name, eq.type);
                    const credentials = await tbService.getDeviceCredentials(tbDevice.id.id);
                    const accessToken = credentials.credentialsId;

                    device = new Device({
                        name: eq.name,
                        type: eq.type,
                        tbId: tbDevice.id.id,
                        accessToken: accessToken,
                        status: eq.status ? 'ON' : 'OFF',
                        lastPower: eq.power
                    });
                    await device.save();
                    console.log(`✅ ${eq.name} synced to ThingsBoard and registered in Device collection.`);
                } catch (err) {
                    console.error(`❌ Failed to sync ${eq.name}:`, err.message);
                }
            } else {
                console.log(`⏭️ ${eq.name} already exists in Device collection.`);
            }
        }

        console.log('🏁 Synchronization Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync Failed:', error);
        process.exit(1);
    }
}

sync();
