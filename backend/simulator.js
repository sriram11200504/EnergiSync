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

            dynamicDevices.forEach(device => {
                // Determine if device is ON based on DB status
                // We could randomize, but reflecting DB actual status is more accurate
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
                    timestamp: new Date().toISOString()
                };

                // Add temperature logic for specific devices
                if (device.name.toLowerCase().includes('ac')) {
                    payload.temperature = isON ? (22 + (Math.random() * 2)) : 26;
                    payload.temperature = Number(payload.temperature.toFixed(1));
                } else if (device.name.toLowerCase().includes('refrigerator')) {
                    payload.temperature = isON ? (2 + (Math.random() * 2)) : 5;
                    payload.temperature = Number(payload.temperature.toFixed(1));
                } else if (device.name.toLowerCase().includes('water heater')) {
                    payload.temperature = isON ? (55 + (Math.random() * 5)) : 40;
                    payload.temperature = Number(payload.temperature.toFixed(1));
                }

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
            });
        } catch (err) {
            console.error('Error fetching devices from DB:', err);
        }
    }, 5000);
});

client.on('error', (err) => {
    console.error('MQTT connection error:', err);
});
