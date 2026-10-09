const express = require('express');
const router = express.Router();
const { getOwnerDashboard } = require('../controllers/ownerController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, authorizeRoles('STORE_OWNER'), getOwnerDashboard);

module.exports = router;
