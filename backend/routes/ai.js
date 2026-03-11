const express = require('express');
const router = express.Router();
const { chat, insight } = require('../controllers/aiController');

router.post('/chat', chat);
router.get('/insight', insight);

module.exports = router;
