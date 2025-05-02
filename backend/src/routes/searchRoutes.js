const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// GET /api/search?q=query&sortBy=field&order=asc|desc&limit=10&page=1
// router.get('/', (req, res, next) => { // Temporarily wrap the controller call
//   console.log('>>> SEARCH ROUTE HIT <<<'); // Add this log
//   searchController.searchLibraries(req, res, next); // Call the original controller
// });
router.get('/', searchController.searchLibraries); // Restore original controller call

module.exports = router;