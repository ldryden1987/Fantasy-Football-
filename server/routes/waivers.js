const express = require('express');
const router = express.Router();
const {claimPlayer, processWaivers, getWaivers } = require('../controllers/waiverController');
const { protect } = require('../middleware/auth');

router.post('/:leagueId/claim', protect, claimPlayer);
router.post('/:leagueId/process', protect, processWaivers);
router.get('/:leagueId', protect, getWaivers);

module.exports = router;