const Schedule = require('../models/Schedule');
const User = require('../models/User');

// GET /api/schedules?staff=staffId&student=studentId
const getSchedules = async (req, res) => {
  try {
    const filter = {};
    if (req.query.staff) filter.staff = req.query.staff;
    if (req.query.student) filter.students = req.query.student;
    if (req.query.start && req.query.end) {
      filter.start = { $gte: new Date(req.query.start) };
      filter.end = { $lte: new Date(req.query.end) };
    }

    const schedules = await Schedule.find(filter)
      .populate('staff', 'name email role')
      .populate('students', 'name email role')
      .sort({ start: 1 });

    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schedules/:id
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('staff', 'name email role')
      .populate('students', 'name email role');

    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/schedules
const createSchedule = async (req, res) => {
  try {
    const { title, description, start, end, staff, students, location, status } = req.body;

    // Basic validation
    if (!title || !start || !end || !staff) {
      return res.status(400).json({ message: 'Title, start, end and staff are required' });
    }

    const staffUser = await User.findById(staff);
    if (!staffUser) return res.status(400).json({ message: 'Invalid staff user' });

    const schedule = await Schedule.create({
      title,
      description: description || '',
      start: new Date(start),
      end: new Date(end),
      staff,
      students: students || [],
      location: location || '',
      status: status || 'scheduled',
      createdBy: req.user._id,
    });

    const populated = await schedule
      .populate('staff', 'name email')
      .populate('students', 'name email')
      .execPopulate();

    res.status(201).json({ schedule: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/schedules/:id
const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Only allow staff assigned to the schedule or admin to update
    if (req.user.role !== 'admin' && schedule.staff.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatable = ['title', 'description', 'start', 'end', 'students', 'location', 'status', 'staff'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        schedule[field] = req.body[field];
      }
    });

    const saved = await schedule.save();
    const populated = await saved
      .populate('staff', 'name email')
      .populate('students', 'name email')
      .execPopulate();

    res.json({ schedule: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/schedules/:id
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Only staff assigned or admin can delete
    if (req.user.role !== 'admin' && schedule.staff.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await schedule.remove();
    res.json({ message: 'Schedule deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
