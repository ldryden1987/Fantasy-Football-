const express = require('express');
const router =  express.Router();
const { createLeague, joinLeague, getMyLeagues, getLeague} = require('../controllers/leagueController');
const { protect } = require('../middleware/auth');

router.post('/create', protect, createLeague);
router.post('/join', protect, joinLeague);
router.get('/my', protect, getMyLeagues);
router.get('/:id', protect, getLeague);

module.exports = router;