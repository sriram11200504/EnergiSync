const express = require('express');
const router = express.Router();
const { getAppliances, updateAppliance, getMonthlyUsage } = require('../controllers/applianceController');

router.get('/usage/monthly', getMonthlyUsage);
router.get('/', getAppliances);
router.put('/:id', updateAppliance);

module.exports = router;
