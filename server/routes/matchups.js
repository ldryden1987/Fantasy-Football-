const express = require('express');
const router = express.Router();
const {
  generateMatchups,
  getMatchups,
  updateScores,
  completeWeek,
  getStandings
} = require('../controllers/matchupController');
const { protect } = require('../middleware/auth');

router.post('/:leagueId/generate', protect, generateMatchups);
router.get('/:leagueId/week/:week', protect, getMatchups);
router.post('/:leagueId/score', protect, updateScores);
router.post('/:leagueId/complete', protect, completeWeek);
router.get('/:leagueId/standings', protect, getStandings);

module.exports = router;
