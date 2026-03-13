import dotenv from 'dotenv';
dotenv.config(); // Load variables from backend/.env (or root if configured)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// The user should supply this URI in the .env file
const mongoURI = process.env.MONGO_URI;

const connectWithRetry = () => {
    mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 30000, // 30s for Atlas cold-start
        socketTimeoutMS: 45000,
    })
        .then(() => console.log('✅ Connected to MongoDB Backend Database'))
        .catch((err) => {
            console.error('❌ MongoDB connection error:', err.message);
            console.log('🔄 Retrying connection in 5 seconds...');
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();


// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', message: 'EnergiSync Backend is running' });
});

// Import Routes
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));

// Initialize IoT MQTT Manager
const mqttManager = require('./services/mqttManager');
mqttManager.connect();



app.listen(PORT, () => {
    console.log(`🚀 EnergiSync Backend API Server running on port ${PORT}`);
});
