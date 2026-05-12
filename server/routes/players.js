const express = require('express');
const router = express.Router();
const { getPlayers, getPlayer } = require('../controllers/playerController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPlayers);
router.get('/:id', protect, getPlayer);

module.exports = router