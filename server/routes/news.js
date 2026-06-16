const express = require('express');
const router = express.Router();
const { getNews, refreshInjuries, getTrending, getHeadlines } = require('../controllers/newsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getNews);
router.get('/refresh', protect, refreshInjuries);
router.get('/trending', protect, getTrending);
router.get('/headlines', protect, getHeadlines);

module.exports = router;
