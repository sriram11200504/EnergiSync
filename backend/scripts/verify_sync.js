require('dotenv').config();
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');
const Device = require('../models/Device');
const tbService = require('../services/thingsboardService');

async function verifyAndRepair() {
    try {
        console.log('🔍 Starting Sync Audit...');
        await mongoose.connect(process.env.MONGO_URI);

        const equipmentList = await Equipment.find();
        console.log(`📋 Total Equipment in DB: ${equipmentList.length}`);

        for (const eq of equipmentList) {
            let device = await Device.findOne({ name: eq.name });

            if (!device) {
                console.log(`⚠️  Unsynced: ${eq.name}. Repairing...`);
                try {
                    const tbDevice = await tbService.createDevice(eq.name, eq.type);
                    const credentials = await tbService.getDeviceCredentials(tbDevice.id.id);

                    device = new Device({
                        name: eq.name,
                        type: eq.type,
                        tbId: tbDevice.id.id,
                        accessToken: credentials.credentialsId,
                        status: eq.status ? 'ON' : 'OFF',
                        lastPower: eq.power
                    });
                    await device.save();
                    console.log(`✅ Fixed: ${eq.name} synchronized.`);
                } catch (err) {
                    console.error(`❌ Repair Failed for ${eq.name}:`, err.message);
                }
            } else {
                console.log(`✅ Synced: ${eq.name} (TB ID: ${device.tbId})`);
            }
        }

        console.log('🏁 Audit Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Audit Crashed:', err);
        process.exit(1);
    }
}

verifyAndRepair();
