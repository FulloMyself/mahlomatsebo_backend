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
} = require('../controllers/bookingController');

router.get('/my-bookings', protect, getMyBookings);
router.post('/', protect, authorize('student'), createBooking);
router.get('/', protect, authorize('admin', 'staff'), getBookings);
router.put('/:id', protect, updateBooking);
router.delete('/:id', protect, cancelBooking);

module.exports = router;