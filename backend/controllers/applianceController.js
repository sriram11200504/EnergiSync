const Appliance = require('../models/Appliance');
const ApplianceUsage = require('../models/ApplianceUsage');

// Static rate for demonstration
const ENERGY_RATE_PER_KWH = 0.15;

const initialAppliances = [
    { id: 1, name: 'Air Conditioner', room: 'Living Room', status: false, power: 1.5, type: 'AC', schedule: { enabled: false, time: '22:00' } },
    { id: 2, name: 'Refrigerator', room: 'Kitchen', status: true, power: 0.3, type: 'Refrigerator', schedule: { enabled: false } },
    { id: 3, name: 'Washing Machine', room: 'Utility Room', status: false, power: 0.8, type: 'Washing Machine', schedule: { enabled: true, time: '22:00' } },
    { id: 4, name: 'Smart Lights', room: 'Bedroom', status: false, power: 0.05, type: 'Lighting', schedule: { enabled: true, time: '18:00' } },
    { id: 5, name: 'Television', room: 'Living Room', status: false, power: 0.2, type: 'TV', schedule: { enabled: false } }
];

// Get all appliances and seed if empty
const getAppliances = async (req, res) => {
    try {
        let appliances = await Appliance.find();

        if (appliances.length === 0) {
            console.log('No appliances found in DB. Seeding initial data...');
            await Appliance.insertMany(initialAppliances);
            appliances = await Appliance.find();

            // Auto-start usage sessions for initially ON appliances (e.g., Refrigerator)
            for (const app of appliances) {
                if (app.status) {
                    await ApplianceUsage.create({ applianceId: app.id, startTime: new Date() });
                }
            }
        }

        res.status(200).json(appliances);
    } catch (error) {
        console.error('Error fetching appliances:', error);
        res.status(500).json({ message: 'Failed to fetch appliances' });
    }
};

// Update an appliance AND track usage
const updateAppliance = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Fetch original to compare status
        const originalAppliance = await Appliance.findOne({ id: Number(id) });
        if (!originalAppliance) {
            return res.status(404).json({ message: 'Appliance not found' });
        }

        const updatedAppliance = await Appliance.findOneAndUpdate(
            { id: Number(id) },
            { $set: updates },
            { new: true }
        );

        // Usage Tracking Logic
        if (updates.status !== undefined && originalAppliance.status !== updates.status) {
            if (updates.status === true) {
                // Appliance turned ON -> Upsert: update existing open session or create a new one
                // This prevents duplicate documents if toggled rapidly or after a server restart
                await ApplianceUsage.findOneAndUpdate(
                    { applianceId: updatedAppliance.id, endTime: null }, // find an existing open session
                    {
                        $set: { startTime: new Date() },       // reset the start time
                        $setOnInsert: { applianceId: updatedAppliance.id } // only set on insert
                    },
                    { upsert: true, new: true }               // create if not found
                );
            } else {
                // Appliance turned OFF -> Find the single open session and close it
                const activeSession = await ApplianceUsage.findOne({
                    applianceId: updatedAppliance.id,
                    endTime: null
                }).sort({ startTime: -1 });

                if (activeSession) {
                    const now = new Date();
                    const durationMs = now - activeSession.startTime;
                    const durationHours = durationMs / (1000 * 60 * 60);
                    const energyConsumed = durationHours * updatedAppliance.power;
                    const cost = energyConsumed * ENERGY_RATE_PER_KWH;

                    await ApplianceUsage.findByIdAndUpdate(activeSession._id, {
                        endTime: now,
                        durationHours,
                        energyConsumed,
                        cost
                    });
                }
            }
        }

        res.status(200).json(updatedAppliance);
    } catch (error) {
        console.error(`Error updating appliance ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to update appliance' });
    }
};

// GET /api/appliances/usage/monthly
const getMonthlyUsage = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate closed sessions over the month
        const usageData = await ApplianceUsage.aggregate([
            {
                $match: {
                    startTime: { $gte: startOfMonth },
                    endTime: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$applianceId",
                    totalHours: { $sum: "$durationHours" },
                    totalEnergy: { $sum: "$energyConsumed" },
                    totalCost: { $sum: "$cost" }
                }
            }
        ]);

        // Add currently active open sessions to the estimate
        const activeSessions = await ApplianceUsage.find({ endTime: null });
        const appliances = await Appliance.find();

        let grandTotalEnergy = 0;
        let grandTotalCost = 0;

        // Merge finished session numbers
        const summaryByAppliance = appliances.map(app => {
            const usage = usageData.find(u => Number(u._id) === Number(app.id)) || { totalHours: 0, totalEnergy: 0, totalCost: 0 };

            // Factor in live running sessions since the last time they were turned on
            const activeSession = activeSessions.find(s => s.applianceId === app.id);
            if (activeSession) {
                const liveHours = (now - activeSession.startTime) / (1000 * 60 * 60);
                const liveEnergy = liveHours * app.power;
                const liveCost = liveEnergy * ENERGY_RATE_PER_KWH;

                usage.totalHours += liveHours;
                usage.totalEnergy += liveEnergy;
                usage.totalCost += liveCost;
            }

            grandTotalEnergy += usage.totalEnergy;
            grandTotalCost += usage.totalCost;

            return {
                id: app.id,
                name: app.name,
                power: app.power,
                totalHours: usage.totalHours,
                totalEnergy: usage.totalEnergy,
                totalCost: usage.totalCost
            };
        });

        res.status(200).json({
            month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
            grandTotalEnergy,
            grandTotalCost,
            summaryByAppliance
        });

    } catch (error) {
        console.error('Error calculating monthly usage:', error);
        res.status(500).json({ message: 'Failed to calculate monthly usage' });
    }
};

module.exports = {
    getAppliances,
    updateAppliance,
    getMonthlyUsage
};
