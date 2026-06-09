const express = require('express');
const router = express.Router();
const { getNews, refreshInjuries, getTrending } = require('../controllers/newsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNews);
router.get('/refresh', protect, refreshInjuries);
router.get('/trending', protect, getTrending);

module.exports = router;