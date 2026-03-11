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
app.use('/api/zones', require('./routes/zones'));
app.use('/api/ai', require('./routes/ai'));



app.listen(PORT, () => {
    console.log(`🚀 EnergiSync Backend API Server running on port ${PORT}`);
});
