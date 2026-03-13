import express from 'express';
const router = express.Router();
const { chat, insight, advice } = require('../controllers/aiController');

router.post('/chat', chat);
router.post('/advice', advice);
router.get('/insight', insight);

export default router;
