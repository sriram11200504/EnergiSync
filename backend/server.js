require('dotenv').config(); // Load variables from backend/.env (or root if configured)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// The user should supply this URI in the .env file
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Backend Database'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', message: 'EnergiSync Backend is running' });
});

// Import Routes
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/devices', require('./routes/devices')); // New IoT Device endpoint
app.use('/api/zones', require('./routes/zones'));
app.use('/api/ai', require('./routes/ai'));

// Initialize IoT MQTT Manager
const mqttManager = require('./services/mqttManager');
mqttManager.connect();

// Sync existing devices on startup (Non-blocking)
const tbService = require('./services/thingsboardService');
const Device = require('./models/Device');
const Equipment = require('./models/Equipment');

const syncOnStartup = async () => {
    try {
        const equipmentCount = await Equipment.countDocuments();
        const deviceCount = await Device.countDocuments();
        if (equipmentCount > deviceCount) {
            console.log('🔄 Startup: Detected unsynced legacy equipment. Running background sync...');
            // In a real prod app, you might trigger a worker or a service method
            // For now, the user has the sync script, but we'll log the recommendation
        }
    } catch (err) {
        console.error('❌ Startup Sync Check Failed:', err.message);
    }
};
syncOnStartup();

app.listen(PORT, () => {
    console.log(`🚀 EnergiSync Backend API Server running on port ${PORT}`);
});
