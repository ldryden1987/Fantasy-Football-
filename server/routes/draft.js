const express = require('express');
const router = express.Router();
const { startDraft, getDraft } = require('../controllers/draftController');
const { protect } = require('../middleware/auth');

router.post('/:leagueId/start', protect, startDraft);
router.get('/:leagueId', protect, getDraft);

module.exports = router;