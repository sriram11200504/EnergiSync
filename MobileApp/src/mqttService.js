import mqtt from 'mqtt';

// Default configuration
let BROKER_URL = import.meta.env.VITE_BROKER_URL;
let options = {
    keepalive: 60,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
};

// Try to load custom configuration from localStorage
const savedConfig = localStorage.getItem('mqtt_config');
if (savedConfig) {
    try {
        const config = JSON.parse(savedConfig);
        if (config.brokerUrl) BROKER_URL = config.brokerUrl;
        if (config.username) options.username = config.username;
        if (config.password) options.password = config.password;
        if (config.clientId) options.clientId = config.clientId;
        console.log('📡 Using custom MQTT configuration:', BROKER_URL);
    } catch (e) {
        console.error('Failed to parse saved MQTT config', e);
    }
}

console.log('Connecting to MQTT broker...');
const client = mqtt.connect(BROKER_URL, options);

// Expose client globally so all components can check connection status easily
window.mqttClient = client;

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
