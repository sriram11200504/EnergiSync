const express = require('express');
const router = express.Router();
const { getEquipment, updateEquipment, addEquipment, getMonthlyUsage, deleteEquipment } = require('../controllers/equipmentController');

router.get('/usage/monthly', getMonthlyUsage);
router.get('/', getEquipment);
router.post('/', addEquipment);
router.put('/:id', updateEquipment);
router.delete('/:id', deleteEquipment);

module.exports = router;
