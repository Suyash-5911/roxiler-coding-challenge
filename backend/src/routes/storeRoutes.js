const express = require('express');
const router = express.Router();
const { getStoresForUser, submitOrUpdateRating } = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Stores list accessible to authenticated users
router.get('/', authenticateToken, getStoresForUser);

// Rating submission restricted to NORMAL_USER
router.post('/rating', authenticateToken, authorizeRoles('NORMAL_USER'), submitOrUpdateRating);

module.exports = router;
