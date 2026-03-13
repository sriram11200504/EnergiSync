require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

const seedData = [
    { id: 1, name: 'Main Office AC', zone: 'Block A, Level 3', power: 2500, type: 'Cooling', status: true, value: 22, minScale: 16, maxScale: 30, unit: '°C' },
    { id: 2, name: 'Library AC', zone: 'Central Library', power: 4500, type: 'Cooling', status: false, value: 24, minScale: 16, maxScale: 30, unit: '°C' },
    { id: 3, name: 'Conference Room Fan', zone: 'Block B, 102', power: 75, type: 'Ventilation', status: true, value: 3, minScale: 1, maxScale: 5, unit: 'Level' },
    { id: 4, name: 'Corridor Lights', zone: 'Block A, All Levels', power: 1200, type: 'Lighting', status: true, value: 80, minScale: 0, maxScale: 100, unit: '%' },
    { id: 5, name: 'Auditorium AC', zone: 'Main Hall', power: 12000, type: 'Cooling', status: false, value: 26, minScale: 16, maxScale: 30, unit: '°C' },
    { id: 6, name: 'Lab Exhaust Fan', zone: 'Chem Lab', power: 200, type: 'Ventilation', status: true, value: 5, minScale: 1, maxScale: 5, unit: 'Level' },
    { id: 7, name: 'Study Hall Lights', zone: 'Central Library', power: 800, type: 'Lighting', status: true, value: 100, minScale: 0, maxScale: 100, unit: '%' },
    { id: 8, name: 'Server Rack 1 Cooling', zone: 'Data Center', power: 5000, type: 'Cooling', status: true, value: 18, minScale: 10, maxScale: 25, unit: '°C' },
    { id: 9, name: 'Main Lobby Projector', zone: 'Reception', power: 350, type: 'Appliance', status: false, value: 0, minScale: null, maxScale: null, unit: '' },
    { id: 10, name: 'Gymnasium AC', zone: 'Sports Complex', power: 8000, type: 'Cooling', status: false, value: 25, minScale: 16, maxScale: 30, unit: '°C' },
    { id: 11, name: 'Street Lights South', zone: 'Campus Perimeter', power: 2000, type: 'Lighting', status: false, value: 0, minScale: 0, maxScale: 100, unit: '%' },
    { id: 12, name: 'Cafeteria Fridge', zone: 'Dining Hall', power: 400, type: 'Cooling', status: true, value: 4, minScale: 1, maxScale: 10, unit: '°C' }
];

const seed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/energisync';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing equipment to start fresh with new schema
        await Equipment.deleteMany({});
        console.log('Cleared existing equipment.');

        for (const item of seedData) {
            await Equipment.create(item);
            console.log(`Seeded: ${item.name}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seed();
