const Equipment = require('../models/Equipment');
const EquipmentUsage = require('../models/EquipmentUsage');

// Static rate for demonstration (e.g. per kWh)
// Matches UI Normal rate around 6.5
const ENERGY_RATE_PER_KWH = 0.65;

// Get all equipment
const getEquipment = async (req, res) => {
    try {
        const equipmentList = await Equipment.find();
        res.status(200).json(equipmentList);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ message: 'Failed to fetch equipment' });
    }
};

// Update an equipment AND track usage
const updateEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Fetch original to compare status
        const originalEquipment = await Equipment.findOne({ id: Number(id) });
        if (!originalEquipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const updatedEquipment = await Equipment.findOneAndUpdate(
            { id: Number(id) },
            { $set: updates },
            { returnDocument: 'after' }
        );

        // Usage Tracking Logic
        if (updates.status !== undefined && originalEquipment.status !== updates.status) {
            if (updates.status === true) {
                // Equipment turned ON -> Create a new session document
                const newSession = new EquipmentUsage({
                    equipmentId: updatedEquipment.id,
                    startTime: new Date()
                });
                await newSession.save();
            } else {
                // Equipment turned OFF -> Find the single open session and close it
                const activeSession = await EquipmentUsage.findOne({
                    equipmentId: updatedEquipment.id,
                    endTime: null
                }).sort({ startTime: -1 });

                if (activeSession) {
                    const now = new Date();
                    const durationMs = now - activeSession.startTime;
                    const durationHours = durationMs / (1000 * 60 * 60);
                    const energyConsumed = durationHours * updatedEquipment.power;
                    const cost = energyConsumed * ENERGY_RATE_PER_KWH;

                    await EquipmentUsage.findByIdAndUpdate(activeSession._id, {
                        endTime: now,
                        durationHours,
                        energyConsumed,
                        cost
                    });
                }
            }
        }

        res.status(200).json(updatedEquipment);
    } catch (error) {
        console.error(`Error updating equipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to update equipment' });
    }
};

// GET /api/equipment/usage/monthly
const getMonthlyUsage = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate closed sessions over the month
        const usageData = await EquipmentUsage.aggregate([
            {
                $match: {
                    startTime: { $gte: startOfMonth },
                    endTime: { $ne: null }
                }
            },
            {
                $group: {
                    _id: "$equipmentId",
                    totalHours: { $sum: "$durationHours" },
                    totalEnergy: { $sum: "$energyConsumed" },
                    totalCost: { $sum: "$cost" }
                }
            }
        ]);

        // Add currently active open sessions to the estimate
        const activeSessions = await EquipmentUsage.find({ endTime: null });
        const equipmentList = await Equipment.find();

        let grandTotalEnergy = 0;
        let grandTotalCost = 0;

        // Merge finished session numbers
        const summaryByEquipment = equipmentList.map(eq => {
            const usage = usageData.find(u => Number(u._id) === Number(eq.id)) || { totalHours: 0, totalEnergy: 0, totalCost: 0 };

            // Factor in live running sessions since the last time they were turned on
            const activeSession = activeSessions.find(s => s.equipmentId === eq.id);
            if (activeSession) {
                const liveHours = (now - activeSession.startTime) / (1000 * 60 * 60);
                const liveEnergy = liveHours * eq.power;
                const liveCost = liveEnergy * ENERGY_RATE_PER_KWH;

                usage.totalHours += liveHours;
                usage.totalEnergy += liveEnergy;
                usage.totalCost += liveCost;
            }

            grandTotalEnergy += usage.totalEnergy;
            grandTotalCost += usage.totalCost;

            return {
                id: eq.id,
                name: eq.name,
                power: eq.power,
                totalHours: usage.totalHours,
                totalEnergy: usage.totalEnergy,
                totalCost: usage.totalCost
            };
        });

        res.status(200).json({
            month: now.toLocaleString('default', { month: 'long', year: 'numeric' }),
            grandTotalEnergy,
            grandTotalCost,
            summaryByEquipment
        });

    } catch (error) {
        console.error('Error calculating monthly usage:', error);
        res.status(500).json({ message: 'Failed to calculate monthly usage' });
    }
};



// Add new equipment
const addEquipment = async (req, res) => {
    try {
        const { name, zone, power, type, schedule } = req.body;

        // Find the maximum id to increment
        const lastEmployee = await Equipment.findOne().sort({ id: -1 });
        const nextId = lastEmployee ? lastEmployee.id + 1 : 1;

        const newEquipment = new Equipment({
            id: nextId,
            name,
            zone,
            power: Number(power),
            type,
            status: false, // Default to OFF
            schedule: schedule || { enabled: false }
        });

        await newEquipment.save();


        res.status(201).json(newEquipment);
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({ message: 'Failed to add equipment' });
    }
};

// Delete equipment and its TB counterpart
const deleteEquipment = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findOne({ id: Number(id) });

        if (!equipment) {
            return res.status(404).json({ message: 'Equipment not found' });
        }

        const name = equipment.name;



        // 2. Delete usage history
        await EquipmentUsage.deleteMany({ equipmentId: Number(id) });

        // 3. Delete main equipment doc
        await Equipment.deleteOne({ id: Number(id) });

        console.log(`🗑️ Equipment ${name} (ID: ${id}) deleted successfully.`);
        res.status(200).json({ message: 'Equipment deleted successfully' });
    } catch (error) {
        console.error(`Error deleting equipment ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to delete equipment' });
    }
};

const getTariffRecommendations = async (req, res) => {
    try {
        const usageData = await EquipmentUsage.find();
        const equipment = await Equipment.find();

        const peakHours = [9, 10, 11, 12, 18, 19, 20, 21];
        const recommendations = [];

        // Define which appliances are "Load Shiftable"
        const shiftableAppliances = ['Washing Machine', 'Dishwasher', 'EV Charger', 'Water Heater'];

        equipment.forEach(eq => {
            const eqId = Number(eq.id);
            const isShiftable = shiftableAppliances.includes(eq.name);

            // Filter usage for this specific equipment
            const eqUsage = usageData.filter(u => Number(u.equipmentId) === eqId);

            const peakUsage = eqUsage.filter(u => {
                const hour = new Date(u.startTime).getHours();
                return peakHours.includes(hour);
            });

            if (peakUsage.length > 0) {
                // Real usage-based recommendation
                const avgHours = peakUsage.reduce((sum, u) => sum + (u.durationHours || 0), 0) / peakUsage.length;
                const peakRate = 8.5; // Use standard peak rate
                const offPeakRate = 4.0;

                const currentCostPerSession = (eq.power / 1000) * avgHours * peakRate;
                const optimizedCostPerSession = (eq.power / 1000) * avgHours * offPeakRate;
                const savingsPerSession = currentCostPerSession - optimizedCostPerSession;
                const totalSavings = savingsPerSession * peakUsage.length;

                if (totalSavings > 1) {
                    recommendations.push({
                        id: eqId,
                        appliance: eq.name,
                        currentTime: "Peak Window",
                        suggestedTime: "22:00 - 05:00",
                        recommendedTime: "22:00",
                        currentCost: parseFloat(currentCostPerSession.toFixed(2)),
                        optimizedCost: parseFloat(optimizedCostPerSession.toFixed(2)),
                        savings: parseFloat(totalSavings.toFixed(2)),
                        priority: totalSavings > 15 ? 'high' : 'medium'
                    });
                }
            } else if (isShiftable && eq.status === false) {
                // Predictive recommendation for high power devices not yet used in peak
                const hypotheticalDuration = 1.5; // Assume 1.5h use
                const peakRate = 8.5;
                const offPeakRate = 4.0;
                const currentCost = (eq.power / 1000) * hypotheticalDuration * peakRate;
                const optimizedCost = (eq.power / 1000) * hypotheticalDuration * offPeakRate;
                const savings = currentCost - optimizedCost;

                if (savings > 2) {
                    recommendations.push({
                        id: eqId,
                        appliance: eq.name,
                        currentTime: "Peak Window (Suggested)",
                        suggestedTime: "Off-Peak Window",
                        recommendedTime: "23:30",
                        currentCost: parseFloat(currentCost.toFixed(2)),
                        optimizedCost: parseFloat(optimizedCost.toFixed(2)),
                        savings: parseFloat(savings.toFixed(2)),
                        priority: savings > 20 ? 'high' : 'medium'
                    });
                }
            }
        });

        // Sort by savings descending
        recommendations.sort((a, b) => b.savings - a.savings);
        res.status(200).json(recommendations);
    } catch (error) {
        console.error('Error fetching tariff recommendations:', error);
        res.status(500).json({ message: 'Failed to fetch recommendations' });
    }
};

// GET /api/equipment/optimization/savings
const getSavingsHistory = async (req, res) => {
    try {
        // Mocking savings history based on actual usage for trend visualization
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const history = months.map((month, idx) => {
            const base = 2000 + (Math.random() * 1000);
            return {
                month,
                current: Math.round(base),
                optimized: Math.round(base * 0.85)
            };
        });

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching savings history:', error);
        res.status(500).json({ message: 'Failed to fetch savings history' });
    }
};

module.exports = {
    getEquipment,
    updateEquipment,
    addEquipment,
    getMonthlyUsage,
    deleteEquipment,
    getTariffRecommendations,
    getSavingsHistory
};
