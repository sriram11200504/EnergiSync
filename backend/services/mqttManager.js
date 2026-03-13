const mqtt = require('mqtt');

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
            // Log incoming telemetry (Device model not available; extend later if needed)
            console.log(`📊 MQTT telemetry from ${deviceName}:`, {
                power : data.power  || 0,
                status: data.status || 'OFF'
            });
        } catch (error) {
            console.error(`❌ MQTT Handler Error for ${deviceName}:`, error.message);
        }
    }
}

module.exports = new MQTTManager();
