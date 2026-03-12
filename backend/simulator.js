require('dotenv').config();
const mqtt = require('mqtt');

// Connect to the MQTT broker (e.g., local Mosquitto or HiveMQ)
const brokerUrl = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

const mongoose = require('mongoose');
const Equipment = require('./models/Equipment');

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/energisync';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB for Simulator'))
    .catch(err => console.error('MongoDB connection error:', err));

client.on('connect', () => {
    console.log(`Connected to MQTT Broker at ${brokerUrl}`);
    console.log('Starting device simulation...');

    // Simulate telemetry every 5 seconds for all devices
    setInterval(async () => {
        try {
            const dynamicDevices = await Equipment.find();

            for (const device of dynamicDevices) {
                // Determine if device is ON based on DB status
                const isON = device.status === true;

                // Base power from DB
                const basePower = device.power || 100;
                const maxFluctuation = basePower * 0.1; // 10% fluctuation

                // Generate power usage based on state
                let currentPower = 0;
                if (isON) {
                    const fluctuation = (Math.random() - 0.5) * 2 * maxFluctuation;
                    currentPower = Math.max(0, basePower + fluctuation);
                }

                // Construct telemetry payload
                const payload = {
                    device: device.name,
                    state: isON ? 'ON' : 'OFF',
                    power: Math.round(currentPower),
                    value: device.value, // Start with current DB value
                    timestamp: new Date().toISOString()
                };

                // Dynamic value logic
                if (isON) {
                    if (device.type === 'Cooling' && device.maxScale) {
                        // Fluctuating temperature around the set point
                        let newValue = device.value + (Math.random() - 0.5) * 1;
                        payload.value = Number(Math.min(device.maxScale, Math.max(device.minScale, newValue)).toFixed(1));
                    } else if (device.type === 'Lighting' && device.maxScale) {
                        // Lights fluctuate slightly or stay steady
                        let newValue = device.value + Math.round((Math.random() - 0.5) * 5);
                        payload.value = Math.min(device.maxScale, Math.max(device.minScale, newValue));
                    } else if (device.type === 'Ventilation' && device.maxScale) {
                        // Fans fluctuate speeds slightly
                        if (Math.random() > 0.8) {
                            let newValue = device.value + (Math.random() > 0.5 ? 1 : -1);
                            payload.value = Math.min(device.maxScale, Math.max(device.minScale, newValue));
                        }
                    }
                } else {
                    // Turn values off or to standby
                    if (device.type === 'Lighting') payload.value = 0;
                }

                // Update the database with the new simulated value so UI can show it
                await Equipment.findByIdAndUpdate(device._id, { $set: { value: payload.value } });

                // Publish to dynamic topic
                const topic = `energysync/devices/${device.name}`;
                const message = JSON.stringify(payload);

                client.publish(topic, message, { qos: 1 }, (err) => {
                    if (err) {
                        console.error(`Failed to publish for ${device.name}:`, err);
                    } else {
                        console.log(`[${topic}] published: ${message}`);
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching devices from DB:', err);
        }
    }, 5000);
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});
