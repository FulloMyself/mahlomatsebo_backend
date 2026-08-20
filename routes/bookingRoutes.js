const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getMyBookings,
  createBooking,
  getBookings,
  updateBooking,
  cancelBooking,
  getPendingBookings,
  getBookingStats,
} = require('../controllers/bookingController');

// Student routes
router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, authorize('student'), createBooking);

// Admin routes
router.get('/pending', protect, authorize('admin'), getPendingBookings);
router.get('/stats', protect, authorize('admin'), getBookingStats);
router.get('/', protect, authorize('admin', 'staff'), getBookings);

// Update/cancel routes
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;