import mqtt from 'mqtt';

// Connection config
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC = 'energysync/appliances/simulator';

console.log('🔌 Virtual Appliance Simulator starting...');
console.log(`📡 Connecting to ${BROKER_URL}...`);

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');
    console.log('🚀 Starting data stream (sending Pulse every 2 seconds)...');
    console.log('Press Ctrl+C to stop.');

    setInterval(() => {
        // Simulate fluctuating power usage (fluctuates between 3.5kW and 9.5kW)
        const randomPower = (Math.random() * 6 + 3.5).toFixed(2);

        const payload = JSON.stringify({
            appliance: "Virtual Lab Simulator",
            power: randomPower,
            timestamp: new Date().toISOString()
        });

        client.publish(TOPIC, payload);
        console.log(`📤 Sent: ${randomPower} kW`);
    }, 2000);
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
    client.end();
});
