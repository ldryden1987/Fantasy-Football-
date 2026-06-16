const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Team = require('../models/Team');

//Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/avatars';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|lpg|png|gif|webp/;
        const valid = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                      allowed.test(file.minetype);
        if (valid) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// POST /api/avatar/team/:teamId
const uploadTeamAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const team = await Team.findOne({
            _id: req.params.teamId,
            owner: req.user._id
        });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        team.avatar = avatarUrl;
        await team.save();

        res.json({ avatarUrl, message: 'Avatar updated!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { upload, uploadTeamAvatar };