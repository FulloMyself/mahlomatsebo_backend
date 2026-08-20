const Booking = require('../models/Booking');
const Cubicle = require('../models/Cubicle');
const User = require('../models/User');

// GET /api/bookings/my-bookings (student)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('cubicle', 'name type location')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });

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
      status: { $in: ['pending', 'approved'] },
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

    const populated = await booking
      .populate('cubicle', 'name type location')
      .populate('assignedStaff', 'name email');

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
    
    // Staff can only see bookings assigned to them
    if (req.user.role === 'staff') {
      filter.assignedStaff = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('cubicle', 'name type location')
      .populate('assignedStaff', 'name email')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/bookings/:id (update booking - student can cancel, admin can approve/reject)
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Handle admin approval/rejection
    if (req.user.role === 'admin') {
      const { status, assignedStaffId, adminNotes, rejectionReason } = req.body;
      
      if (status === 'approved') {
        if (!assignedStaffId) {
          return res.status(400).json({ message: 'Staff assignment is required for approval.' });
        }
        
        // Verify staff exists
        const staff = await User.findById(assignedStaffId);
        if (!staff || staff.role !== 'staff') {
          return res.status(400).json({ message: 'Invalid staff user.' });
        }
        
        booking.status = 'approved';
        booking.assignedStaff = assignedStaffId;
        booking.adminNotes = adminNotes || '';
        booking.reviewedBy = req.user._id;
        booking.reviewedAt = new Date();
        
        // Update cubicle status to occupied
        await Cubicle.findByIdAndUpdate(booking.cubicle, { status: 'occupied' });
        
      } else if (status === 'rejected') {
        if (!rejectionReason) {
          return res.status(400).json({ message: 'Rejection reason is required.' });
        }
        
        booking.status = 'rejected';
        booking.rejectionReason = rejectionReason;
        booking.reviewedBy = req.user._id;
        booking.reviewedAt = new Date();
      }
    } 
    // Handle student cancellation
    else if (req.user.role === 'student') {
      // Students can only cancel their own bookings
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Can only cancel if pending or approved
      if (booking.status !== 'pending' && booking.status !== 'approved') {
        return res.status(400).json({ message: 'This booking cannot be cancelled.' });
      }
      
      booking.status = 'cancelled';
      
      // If booking was approved, free up the cubicle
      if (booking.status === 'approved') {
        await Cubicle.findByIdAndUpdate(booking.cubicle, { status: 'available' });
      }
    }
    // Handle staff updates (mark as completed)
    else if (req.user.role === 'staff') {
      // Staff can only update their assigned bookings
      if (booking.assignedStaff?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const { status } = req.body;
      if (status === 'completed') {
        booking.status = 'completed';
        
        // Free up the cubicle
        await Cubicle.findByIdAndUpdate(booking.cubicle, { status: 'available' });
      }
    }

    const updated = await booking.save();
    const populated = await updated
      .populate('user', 'name email')
      .populate('cubicle', 'name type location')
      .populate('assignedStaff', 'name email')
      .populate('reviewedBy', 'name email');

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
    
    // Free up the cubicle if booking was approved
    if (booking.status === 'approved') {
      await Cubicle.findByIdAndUpdate(booking.cubicle, { status: 'available' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/pending (admin - get pending bookings)
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('cubicle', 'name type location')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/bookings/stats (admin - booking statistics)
const getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const rejectedBookings = await Booking.countDocuments({ status: 'rejected' });

    res.json({
      stats: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        completedBookings,
        rejectedBookings,
      }
    });
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
  getPendingBookings,
  getBookingStats,
};