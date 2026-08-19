const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const User = require('../models/User');

// GET /api/staff/:id/students  (protected: staff themselves or admin)
router.get('/:id/students', protect, async (req, res) => {
  try {
    const staffId = req.params.id;

    // Only admin or the staff owner can view their assigned students
    if (req.user.role !== 'admin' && req.user._id.toString() !== staffId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const students = await User.find({ assignedStaff: staffId, role: 'student' }).select('-password');
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/staff/:id/assign-student  (admin or staff assign a student to this staff)
router.post('/:id/assign-student', protect, authorize('admin', 'staff'), async (req, res) => {
  try {
    const staffId = req.params.id;
    const { studentId } = req.body;

    // Only admin or the staff owner can assign
    if (req.user.role !== 'admin' && req.user._id.toString() !== staffId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ message: 'Invalid student user' });
    }

    student.assignedStaff = staffId;
    await student.save();

    res.json({ message: 'Student assigned', student: { _id: student._id, name: student.name, email: student.email, assignedStaff: student.assignedStaff } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
