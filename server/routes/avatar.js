const express = require('express');
const router = express.Router();
const { upload, uploadTeamAvatar } = require('../controllers/avatarController');
const { protect } = require('../middleware/auth');

router.post('/team/:teamId', protect, upload.single('avatar'), uploadTeamAvatar);

module.exports = router;