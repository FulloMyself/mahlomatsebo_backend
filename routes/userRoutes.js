const express = require('express');
const { getUsers, getUserProfile, updateUser, getDashboardData } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/', protect, authorize('admin', 'staff'), getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUser);

module.exports = router;
