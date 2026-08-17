const express = require('express');
const { getDashboardReport, getTrainingReport, exportReport } = require('../controllers/reportController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/dashboard', protect, authorize('admin', 'manager'), getDashboardReport);
router.get('/training', protect, authorize('admin', 'manager', 'trainer'), getTrainingReport);
router.get('/export', protect, authorize('admin', 'manager'), exportReport);

module.exports = router;
