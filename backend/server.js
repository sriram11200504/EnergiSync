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
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
    .then(() => console.log('✅ Connected to MongoDB Backend Database'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.json({ status: 'active', message: 'EnergiSync Backend is running' });
});

// Import Routes
import applianceRoutes from './routes/appliances.js';
import aiRoutes from './routes/ai.js';
app.use('/api/appliances', applianceRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`🚀 EnergiSync Backend API Server running on port ${PORT}`);
});
