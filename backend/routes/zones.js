const express = require('express');
const router = express.Router();
const { getZones, addZone, deleteZone } = require('../controllers/zoneController');

router.get('/', getZones);
router.post('/', addZone);
router.delete('/:id', deleteZone);

module.exports = router;
