const express = require('express');
const router = express.Router();
const { generatePlayoffs, getBracket } = require('../controllers/playoffController');
const { protect } = require('../middleware/auth');

router.post('/:leagueId/generate', protect, generatePlayoffs);
router.get('/:leagueId/bracket', protect, getBracket);

module.exports = router;