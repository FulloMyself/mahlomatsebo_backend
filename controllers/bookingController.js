const Booking = require('../models/Booking');
const Cubicle = require('../models/Cubicle');

// GET /api/bookings/my-bookings (student)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('cubicle', 'name type location')
      .sort({ date: -1, startTime: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/bookings (student)
const createBooking = async (req, res) => {
  try {
    const { cubicleId, date, startTime, endTime, purpose } = req.body;

    if (!cubicleId || !date || !startTime || !endTime || !purpose) {
      return res.status(400).json({ message: 'All booking fields are required.' });
    }

    // Check if cubicle exists
    const cubicle = await Cubicle.findById(cubicleId);
    if (!cubicle) {
      return res.status(404).json({ message: 'Cubicle not found.' });
    }

    // Check if cubicle is available
    if (cubicle.status === 'maintenance') {
      return res.status(400).json({ message: 'This cubicle is under maintenance.' });
    }

    // Check for overlapping bookings
    const bookingDate = new Date(date);
    const overlapping = await Booking.findOne({
      cubicle: cubicleId,
      date: bookingDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
    });

    if (overlapping) {
      return res.status(409).json({ message: 'This cubicle is already booked for the selected time slot.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      cubicle: cubicleId,
      date: bookingDate,
      startTime,
      endTime,
      purpose,
      status: 'pending',
    });

    const populated = await booking.populate('cubicle', 'name type location');
    res.status(201).json({ booking: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings (admin/staff - all bookings)
const getBookings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.cubicle) filter.cubicle = req.query.cubicle;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.status) filter.status = req.query.status;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('cubicle', 'name type location')
      .sort({ date: -1, startTime: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/:id (update booking)
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Students can only update their own bookings
    if (req.user.role === 'student' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatable = ['date', 'startTime', 'endTime', 'purpose', 'status'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    const updated = await booking.save();
    const populated = await updated.populate('cubicle', 'name type location');
    res.json({ booking: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/bookings/:id (cancel booking)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Students can only cancel their own bookings
    if (req.user.role === 'student' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyBookings,
  createBooking,
  getBookings,
  updateBooking,
  cancelBooking,
};