const express = require('express');
const router = express.Router();
const { createLeague, joinLeague, getMyLeagues, getLeague, moveRosterSlot } = require('../controllers/leagueController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createLeague);
router.post('/join', protect, joinLeague);
router.get('/my', protect, getMyLeagues);
router.get('/:id', protect, getLeague);
router.put('/:leagueId/roster/move', protect, moveRosterSlot);

module.exports = router;
