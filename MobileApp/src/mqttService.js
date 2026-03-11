import mqtt from 'mqtt';

// Using the public HiveMQ broker for testing. 
// For production, you would use a secure, private broker.
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt'; 

const options = {
    keepalive: 60,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
};

console.log('Connecting to MQTT broker...');
const client = mqtt.connect(BROKER_URL, options);

client.on('connect', () => {
    console.log('Connected to MQTT Broker');
    // Subscribe to all appliance updates
    client.subscribe('energysync/appliances/+', (err) => {
        if (!err) {
            console.log('Subscribed to appliance updates');
        }
    });
});

client.on('error', (err) => {
    console.error('MQTT Connection Error:', err);
    client.end();
});

export default client;
