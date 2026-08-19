const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require('../controllers/scheduleController');

// Public-ish: protected routes but allow filtering
router.get('/', protect, getSchedules);
router.get('/:id', protect, getScheduleById);

// Create: staff or admin
router.post('/', protect, authorize('admin', 'staff'), createSchedule);

// Update / Delete: staff (owner) or admin
router.put('/:id', protect, authorize('admin', 'staff'), updateSchedule);
router.delete('/:id', protect, authorize('admin', 'staff'), deleteSchedule);

module.exports = router;
