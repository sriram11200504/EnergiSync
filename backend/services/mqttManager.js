const mqtt = require('mqtt');
// const tbService = require('./thingsboardService');
const Device = require('../models/Device');

class MQTTManager {
    constructor() {
        this.brokerUrl = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
        this.client = null;
    }

    connect() {
        this.client = mqtt.connect(this.brokerUrl);

        this.client.on('connect', () => {
            console.log(`📡 Connected to MQTT Broker: ${this.brokerUrl}`);
            // Subscribe to EnergiSync discovery topic
            this.client.subscribe('energysync/appliances/#', (err) => {
                if (!err) console.log('✅ Subscribed to energysync/appliances/#');
            });
        });

        this.client.on('message', async (topic, message) => {
            try {
                const payload = JSON.parse(message.toString());
                const topicParts = topic.split('/');
                const deviceName = topicParts[2]; // energysync/appliances/{deviceName}

                if (deviceName) {
                    await this.handleDeviceMessage(deviceName, payload);
                }
            } catch (error) {
                console.error('❌ MQTT Message Error:', error.message);
            }
        });
    }

    async handleDeviceMessage(deviceName, data) {
        try {
            // 1. Check if device exists in Mongo
            let device = await Device.findOne({ name: deviceName });

            if (!device) {
                console.log(`🆕 New device detected: ${deviceName}. Provisioning...`);

                // 2. Create in ThingsBoard
                const tbDevice = await tbService.createDevice(deviceName, data.type || 'Sensor');

                // 3. Get TB Credentials (Access Token)
                const credentials = await tbService.getDeviceCredentials(tbDevice.id.id);
                const accessToken = credentials.credentialsId;

                // 4. Store in MongoDB
                device = new Device({
                    name: deviceName,
                    type: data.type || 'Sensor',
                    tbId: tbDevice.id.id,
                    accessToken: accessToken,
                    status: data.status || 'OFF',
                    lastPower: data.power || 0
                });
                await device.save();
                console.log(`✅ Device ${deviceName} provisioned with token: ${accessToken}`);
            }

            // 5. Bridge telemetry to ThingsBoard
            if (device.accessToken) {
                await tbService.saveTelemetry(device.accessToken, {
                    power: data.power || 0,
                    status: data.status || 'OFF',
                    active: true
                });

                // 6. Update local Mongo cache for dashboard speed
                device.lastPower = data.power || 0;
                device.status = data.status || 'OFF';
                device.lastSeen = new Date();
                await device.save();
            }

        } catch (error) {
            console.error(`❌ Provisioning/Telemetry Error for ${deviceName}:`, error.message);

            // If the token is invalid (401), remove the device from Mongo 
            // This will force a re-provision on the next message
            if (error.response && error.response.status === 401) {
                console.log(`🔄 Invalid token detected for ${deviceName}. Clearing cache for re-provision...`);
                await Device.deleteOne({ name: deviceName });
            }
        }
    }
}

module.exports = new MQTTManager();
