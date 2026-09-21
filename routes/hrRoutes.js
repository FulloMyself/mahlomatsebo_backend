const express = require('express');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getHrOverview,
  createLeaveRequest,
  reviewLeaveRequest,
  createPayrollRecord,
  reviewPayrollRecord,
} = require('../controllers/hrController');

const router = express.Router();

router.get('/overview', protect, authorize('admin', 'hr'), getHrOverview);
router.post('/leave', protect, authorize('hr'), createLeaveRequest);
router.put('/leave/:id/review', protect, authorize('admin'), reviewLeaveRequest);
router.post('/payroll', protect, authorize('hr'), createPayrollRecord);
router.put('/payroll/:id/review', protect, authorize('admin'), reviewPayrollRecord);

module.exports = router;
