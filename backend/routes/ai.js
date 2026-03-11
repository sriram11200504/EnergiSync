import express from 'express';
const router = express.Router();
import { chat, insight } from '../controllers/aiController.js';

router.post('/chat', chat);
router.get('/insight', insight);

export default router;
