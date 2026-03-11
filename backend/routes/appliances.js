import express from 'express';
const router = express.Router();
import { getAppliances, updateAppliance, getMonthlyUsage } from '../controllers/applianceController.js';

router.get('/usage/monthly', getMonthlyUsage);
router.get('/', getAppliances);
router.put('/:id', updateAppliance);

export default router;
