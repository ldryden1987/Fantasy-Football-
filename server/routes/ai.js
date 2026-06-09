const express = require('express');
const router = express.Router();
const { analyzeTrade, getRosterAdvice } = require('../controllers/aiContoller');
const { protect } = require('../middleware/auth');

router.post('/analyze-trade', protect, analyzeTrade);
router.post('router-advice', protect, getRosterAdvice);

module.exports = router;