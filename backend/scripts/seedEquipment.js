require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Equipment = require('../models/Equipment');

const seedData = [
    { id: 2, name: 'Washing Machine', zone: 'Laundry Room', power: 500, type: 'Appliance', status: false },
    { id: 3, name: 'Dishwasher', zone: 'Kitchen', power: 1200, type: 'Appliance', status: false },
    { id: 4, name: 'EV Charger', zone: 'Garage', power: 7000, type: 'EV', status: false },
    { id: 5, name: 'Water Heater', zone: 'Utility Room', power: 3000, type: 'Heating', status: false },
    { id: 6, name: 'Refrigerator', zone: 'Kitchen', power: 150, type: 'Cooling', status: true }
];

const seed = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/energisync';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB for seeding...');

        for (const item of seedData) {
            await Equipment.findOneAndUpdate(
                { id: item.id },
                { $set: item },
                { upsert: true, new: true }
            );
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
