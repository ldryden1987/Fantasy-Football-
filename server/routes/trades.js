const express = require('express');
const router = express.Router();
const { sendTrade, acceptTrade, rejectTrade, cancelTrade, getTrades } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

router.post('/:leagueId/send', protect, sendTrade);
router.post('/:tradeId/accept', protect, acceptTrade);
router.post('/:tradeId/reject', protect, rejectTrade);
router.post('/:tradeId/cancel', protect, cancelTrade);
router.get('/:leagueId', protect, getTrades);

module.exports = router;
