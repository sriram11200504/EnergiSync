const mongoose = require('mongoose');
const mongoUri = 'mongodb://localhost:27017/energisync';

const debug = async () => {
    await mongoose.connect(mongoUri);
    const Equipment = require('../models/Equipment');
    const EquipmentUsage = require('../models/EquipmentUsage');

    const usageData = await EquipmentUsage.find();
    const equipment = await Equipment.find();
    const ENERGY_RATE_PER_KWH = 0.65;

    console.log(`Found ${equipment.length} equipment and ${usageData.length} usage records.`);

    const peakHours = [9, 10, 11, 12, 18, 19, 20, 21];
    const recommendations = [];
    const shiftableAppliances = ['Washing Machine', 'Dishwasher', 'EV Charger', 'Water Heater'];

    equipment.forEach(eq => {
        const eqId = Number(eq.id);
        const isShiftable = shiftableAppliances.includes(eq.name);
        console.log(`Checking ${eq.name} (ID: ${eqId}). isShiftable: ${isShiftable}, status: ${eq.status}`);

        const eqUsage = usageData.filter(u => Number(u.equipmentId) === eqId);
        console.log(`  Usage for ${eqId}: ${eqUsage.length} records.`);

        const peakUsage = eqUsage.filter(u => {
            const date = new Date(u.startTime);
            const hour = date.getHours();
            return peakHours.includes(hour);
        });
        console.log(`  Peak usage for ${eqId}: ${peakUsage.length} records.`);

        if (peakUsage.length > 0) {
            console.log(`  Entering peak session block for ${eq.name}`);
            const avgHours = peakUsage.reduce((sum, u) => sum + (u.durationHours || 0), 0) / peakUsage.length;
            const peakRate = 8.5;
            const offPeakRate = 4.0;
            const currentCostPerSession = (eq.power / 1000) * avgHours * peakRate;
            const optimizedCostPerSession = (eq.power / 1000) * avgHours * offPeakRate;
            const savings = currentCostPerSession - optimizedCostPerSession;
            const totalSavings = savings * peakUsage.length;
            console.log(`    Savings: ${totalSavings}`);

            if (totalSavings > 1) {
                recommendations.push({ id: eqId, appliance: eq.name, savings: totalSavings });
            }
        } else if (isShiftable && eq.status === false) {
            console.log(`  Entering predictive block for ${eq.name}`);
            const hypotheticalDuration = 1.5;
            const peakRate = 8.5;
            const offPeakRate = 4.0;
            const currentCost = (eq.power / 1000) * hypotheticalDuration * peakRate;
            const optimizedCost = (eq.power / 1000) * hypotheticalDuration * offPeakRate;
            const savings = currentCost - optimizedCost;
            console.log(`    Hypothetical Savings: ${savings}`);

            if (savings > 2) {
                recommendations.push({ id: eqId, appliance: eq.name, savings: savings });
            }
        }
    });

    console.log('Final recommendations count:', recommendations.length);
    process.exit(0);
};

debug();
