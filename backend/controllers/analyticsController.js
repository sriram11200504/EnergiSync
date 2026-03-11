const EquipmentUsage = require('../models/EquipmentUsage');
const Equipment = require('../models/Equipment');

const EMISSION_FACTOR = 0.4; // kg CO2 per kWh

// Distinct chart colours (one per device, cycling)
const CHART_COLORS = [
    'hsl(210, 100%, 56%)',
    'hsl(142, 71%, 45%)',
    'hsl(25, 95%, 53%)',
    'hsl(45, 93%, 58%)',
    'hsl(271, 76%, 53%)',
    'hsl(340, 82%, 52%)',
];

/**
 * GET /api/analytics/carbon-stats
 * Returns current-month totals + per-device breakdown for the Carbon Footprint page.
 */
const getCarbonStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // ── 1. Aggregate closed sessions this month ─────────────────────────
        const closedAgg = await EquipmentUsage.aggregate([
            {
                $match: {
                    startTime: { $gte: startOfMonth },
                    endTime: { $ne: null }
                }
            },
            {
                $group: {
                    _id: '$equipmentId',
                    totalEnergy: { $sum: '$energyConsumed' }
                }
            }
        ]);

        // Build a map: equipmentId → totalEnergy (from closed sessions)
        const closedMap = {};
        closedAgg.forEach(row => { closedMap[row._id] = row.totalEnergy; });

        // ── 2. Factor in currently open (live) sessions ──────────────────────
        const activeSessions = await EquipmentUsage.find({ endTime: null });
        const equipmentList  = await Equipment.find();

        const deviceMap = {};  // equipmentId → { name, totalEnergy }

        equipmentList.forEach(eq => {
            let totalEnergy = closedMap[eq.id] || 0;

            const liveSession = activeSessions.find(s => s.equipmentId === eq.id);
            if (liveSession) {
                const liveHours  = (now - liveSession.startTime) / (1000 * 60 * 60);
                totalEnergy     += liveHours * eq.power;
            }

            deviceMap[eq.id] = { name: eq.name, totalEnergy };
        });

        // ── 3. Compute totals ────────────────────────────────────────────────
        let totalEnergy = 0;
        Object.values(deviceMap).forEach(d => { totalEnergy += d.totalEnergy; });

        const totalEmissions = totalEnergy * EMISSION_FACTOR;
        const co2Saved       = totalEmissions * 0.3;   // assumed 30% reduction vs baseline
        const treesEquivalent = co2Saved / 10;          // ~10 kg CO2 per tree

        // ── 4. Build per-device breakdown for the PieChart ───────────────────
        const byDevice = Object.values(deviceMap)
            .filter(d => d.totalEnergy > 0)
            .map((d, i) => ({
                name           : d.name,
                totalEnergy    : parseFloat(d.totalEnergy.toFixed(4)),
                totalEmissions : parseFloat((d.totalEnergy * EMISSION_FACTOR).toFixed(4)),
                value          : parseFloat(d.totalEnergy.toFixed(4)), // recharts uses `value`
                color          : CHART_COLORS[i % CHART_COLORS.length]
            }));

        res.json({
            totalEnergy    : parseFloat(totalEnergy.toFixed(4)),
            totalEmissions : parseFloat(totalEmissions.toFixed(4)),
            co2Saved       : parseFloat(co2Saved.toFixed(4)),
            treesEquivalent: parseFloat(treesEquivalent.toFixed(2)),
            byDevice
        });

    } catch (err) {
        console.error('Error in getCarbonStats:', err);
        res.status(500).json({ message: err.message });
    }
};

/**
 * GET /api/analytics/monthly-trend
 * Returns last 6 calendar months of emissions + saved data for the AreaChart.
 */
const getMonthlyTrend = async (req, res) => {
    try {
        const now        = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const pipeline = await EquipmentUsage.aggregate([
            {
                $match: {
                    startTime: { $gte: sixMonthsAgo },
                    endTime  : { $ne: null }          // only closed sessions
                }
            },
            {
                $group: {
                    _id : {
                        year : { $year : '$startTime' },
                        month: { $month: '$startTime' }
                    },
                    totalEnergy: { $sum: '$energyConsumed' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Build a full 6-month calendar (fill gaps with 0)
        const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const result = [];

        for (let i = 5; i >= 0; i--) {
            const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year  = d.getFullYear();
            const month = d.getMonth() + 1; // 1-indexed

            const found = pipeline.find(r => r._id.year === year && r._id.month === month);
            const totalEnergy   = found ? found.totalEnergy : 0;
            const emissions     = parseFloat((totalEnergy * EMISSION_FACTOR).toFixed(2));
            const saved         = parseFloat((emissions * 0.3).toFixed(2));

            result.push({
                month    : MONTH_NAMES[month - 1],
                year,
                emissions,
                saved
            });
        }

        res.json(result);

    } catch (err) {
        console.error('Error in getMonthlyTrend:', err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getCarbonStats, getMonthlyTrend };
