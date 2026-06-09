const express = require('express');
const router = express.Router();
const {
    getDashboard,
    updateSettings,
    vetoTrade,
    resetWaiverOrder,
    removeTeam
} = require('../controllers/commissionerController');
const { protect } = require('../middleware/auth');

router.get('/:leagueId/dashboard', protect, getDashboard);
router.put('/:leagueId/settings', protect, updateSettings);
router.post('/:tradeId/veto', protect, vetoTrade);
router.post('/:leagueId/reset-waivers', protect, resetWaiverOrder);
router.delete('/:leagueId/remove-team/:teamId', protect, removeTeam);

module.exports = router;