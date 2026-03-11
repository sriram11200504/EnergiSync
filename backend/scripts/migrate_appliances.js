require('dotenv').config();
const mongoose = require('mongoose');
const tbService = require('../services/thingsboardService');

// This script migrates 'appliances' to 'equipment' and 'devices' in 'energisync'
async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;

        console.log(`🚀 Starting migration to ${process.env.MONGO_URI}...`);

        const appliances = await db.collection('appliances').find().toArray();
        if (appliances.length === 0) {
            console.log('⚠️ No appliances found to migrate.');
            process.exit(0);
        }

        console.log(`📋 Found ${appliances.length} appliances.`);

        for (const app of appliances) {
            // 1. Move to equipment collection
            const existingEq = await db.collection('equipment').findOne({ name: app.name });
            if (!existingEq) {
                console.log(`📦 Converting ${app.name} to equipment...`);
                await db.collection('equipment').insertOne({
                    id: app.id,
                    name: app.name,
                    zone: app.room || 'General',
                    status: app.status || false,
                    power: app.power || 0,
                    type: app.type || 'Generic',
                    schedule: app.schedule || { enabled: false },
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt
                });
            }

            // 2. Provision in ThingsBoard if not already in devices
            const existingDev = await db.collection('devices').findOne({ name: app.name });
            if (!existingDev) {
                console.log(`📡 Provisioning ${app.name} in ThingsBoard...`);
                try {
                    const tbDevice = await tbService.createDevice(app.name, app.type || 'Generic');
                    const credentials = await tbService.getDeviceCredentials(tbDevice.id.id);

                    await db.collection('devices').insertOne({
                        name: app.name,
                        type: app.type || 'Generic',
                        tbId: tbDevice.id.id,
                        accessToken: credentials.credentialsId,
                        status: app.status ? 'ON' : 'OFF',
                        lastPower: app.power,
                        lastSeen: new Date(),
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    console.log(`✅ ${app.name} fully migrated and provisioned.`);
                } catch (err) {
                    console.error(`❌ TB Provisioning failed for ${app.name}:`, err.message);
                }
            } else {
                console.log(`⏭️ ${app.name} already provisioned.`);
            }
        }

        console.log('🏁 Migration finished successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Crashed:', err);
        process.exit(1);
    }
}

migrate();
