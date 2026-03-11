const Zone = require('../models/Zone');

// Get all zones
const getZones = async (req, res) => {
    try {
        const zones = await Zone.find();
        res.status(200).json(zones);
    } catch (error) {
        console.error('Error fetching zones:', error);
        res.status(500).json({ message: 'Failed to fetch zones' });
    }
};

// Add a new zone
const addZone = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Zone name is required' });
        }

        const newZone = new Zone({ name, description });
        await newZone.save();
        res.status(201).json(newZone);
    } catch (error) {
        console.error('Error adding zone:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Zone name must be unique' });
        }
        res.status(500).json({ message: 'Failed to add zone' });
    }
};

// Delete a zone
const deleteZone = async (req, res) => {
    try {
        const { id } = req.params;
        await Zone.findByIdAndDelete(id);
        res.status(200).json({ message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Error deleting zone:', error);
        res.status(500).json({ message: 'Failed to delete zone' });
    }
};

module.exports = {
    getZones,
    addZone,
    deleteZone
};
