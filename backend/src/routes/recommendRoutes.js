const express = require('express');
const router = express.Router();
const recommendController = require('../controllers/recommendController');

// POST /api/recommend - Get recommendations
router.post('/', recommendController.getRecommendations);

module.exports = router; 