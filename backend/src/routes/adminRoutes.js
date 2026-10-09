const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores,
  getUserDetails,
} = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require SYSTEM_ADMIN role
router.use(authenticateToken, authorizeRoles('SYSTEM_ADMIN'));

router.get('/stats', getDashboardStats);
router.post('/add-user', addUser);
router.post('/add-store', addStore);
router.get('/users', getUsers);
router.get('/stores', getStores);
router.get('/users/:userId', getUserDetails);

module.exports = router;
