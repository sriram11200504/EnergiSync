import mqtt from 'mqtt';

// Connection config
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
// const URL = import.meta.env.VITE_BROKER_URL;
// const BROKER_URL = `${URL}/mqtt`
const PULSE_TOPIC = 'energysync/appliances/simulator';
const CONTROL_TOPIC = 'energysync/control/#'; // Listen to ALL control commands

console.log('🔌 Virtual Device Hub starting...');
console.log(`📡 Connecting to ${BROKER_URL}...`);

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
    console.log('✅ Connected to MQTT Broker!');

    // Subscribe to control topics
    client.subscribe(CONTROL_TOPIC, (err) => {
        if (!err) {
            console.log(`👂 Listening for commands on: ${CONTROL_TOPIC}`);
        }
    });

    // Also simulate data stream (optional, kept from previous step)
    setInterval(() => {
        const randomPower = (Math.random() * 6 + 3.5).toFixed(2);
        client.publish(PULSE_TOPIC, JSON.stringify({
            appliance: "Virtual Lab Simulator",
            power: randomPower
        }));
    }, 5000); // Slowed down to 5s to reduce noise
});

client.on('message', (topic, message) => {
    // Check if it's a control command
    if (topic.includes('control')) {
        const payload = JSON.parse(message.toString());
        const deviceName = topic.split('/').pop().replace('_', ' ').toUpperCase();

        console.log('\n----------------------------------------');
        console.log(`🔔 COMMAND RECEIVED for ${deviceName}`);
        console.log(`   Action: ${payload.command}`);
        console.log(`   Time:   ${payload.timestamp}`);
        console.log('   Status: ✅ Executed successfully');
        console.log('----------------------------------------\n');
    }
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err);
    client.end();
});
