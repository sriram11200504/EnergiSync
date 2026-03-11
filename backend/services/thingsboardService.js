const axios = require('axios');

class ThingsBoardService {
    constructor() {
        this.baseUrl = process.env.THINGSBOARD_URL || 'http://localhost:9090';
        this.username = process.env.THINGSBOARD_USERNAME || 'tenant@thingsboard.org';
        this.password = process.env.THINGSBOARD_PASSWORD || 'tenant';
        this.token = null;
    }

    async login() {
        try {
            const response = await axios.post(`${this.baseUrl}/api/auth/login`, {
                username: this.username,
                password: this.password
            });
            this.token = response.data.token;
            console.log('✅ Logged into ThingsBoard');
            return this.token;
        } catch (error) {
            console.error('❌ ThingsBoard Login Failed:', error.message);
            throw error;
        }
    }

    async getHeaders() {
        if (!this.token) await this.login();
        return {
            headers: {
                'X-Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        };
    }

    async createDevice(deviceName, deviceType = 'default') {
        try {
            const headers = await this.getHeaders();
            const response = await axios.post(`${this.baseUrl}/api/device`, {
                name: deviceName,
                type: deviceType,
                label: deviceName
            }, headers);

            console.log(`✅ Device created in TB: ${deviceName}`);
            return response.data;
        } catch (error) {
            console.error(`❌ Failed to create device ${deviceName}:`, error.message);
            throw error;
        }
    }

    async getDeviceCredentials(deviceId) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseUrl}/api/device/${deviceId}/credentials`, headers);
            return response.data;
        } catch (error) {
            console.error(`❌ Failed to get credentials for ${deviceId}:`, error.message);
            throw error;
        }
    }

    async getDeviceByName(deviceName) {
        try {
            const headers = await this.getHeaders();
            const response = await axios.get(`${this.baseUrl}/api/tenant/devices?deviceName=${deviceName}`, headers);
            return response.data;
        } catch (error) {
            // If 404, device doesn't exist
            if (error.response && error.response.status === 404) return null;
            console.error(`❌ Failed to search for device ${deviceName}:`, error.message);
            return null;
        }
    }

    async saveTelemetry(accessToken, telemetry) {
        try {
            // Using ThingsBoard REST API for telemetry
            await axios.post(`${this.baseUrl}/api/v1/${accessToken}/telemetry`, telemetry);
        } catch (error) {
            // Re-throw to allow the manager to handle 401/404 specifically
            throw error;
        }
    }

    async deleteDevice(tbDeviceId) {
        try {
            const headers = await this.getHeaders();
            await axios.delete(`${this.baseUrl}/api/device/${tbDeviceId}`, headers);
            console.log(`✅ Device deleted in TB: ${tbDeviceId}`);
        } catch (error) {
            console.error(`❌ Failed to delete device ${tbDeviceId} in TB:`, error.message);
            // Don't throw if already gone
            if (error.response && error.response.status !== 404) throw error;
        }
    }
}

module.exports = new ThingsBoardService();
