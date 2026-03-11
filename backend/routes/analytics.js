const express = require('express');
const router  = express.Router();
const { getCarbonStats, getMonthlyTrend } = require('../controllers/analyticsController');

// GET /api/analytics/carbon-stats  — current-month totals + per-device breakdown
router.get('/carbon-stats', getCarbonStats);

// GET /api/analytics/monthly-trend — last 6 months aggregate for the AreaChart
router.get('/monthly-trend', getMonthlyTrend);

module.exports = router;
