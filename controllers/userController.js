const User = require('../models/User');
const Training = require('../models/Training');
const Enrollment = require('../models/Enrollment');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const applications = await Enrollment.find({ user: req.user._id })
      .populate('training', 'title category type duration status startDate endDate')
      .sort({ createdAt: -1 });

    res.json({ user, applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = ['name', 'phone', 'department'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    const savedUser = await user.save();
    res.json({ user: savedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDashboardData = async (req, res) => {
  try {
    const [users, trainings, applications] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }),
      Training.find().sort({ createdAt: -1 }),
      Enrollment.find()
        .populate('user', 'name email role')
        .populate('training', 'title category type status')
        .sort({ createdAt: -1 }),
    ]);

    const totalUsers = users.length;
    const totalStudents = users.filter((user) => user.role === 'student').length;
    const totalStaff = users.filter((user) => user.role === 'staff').length;
    const totalAdmins = users.filter((user) => user.role === 'admin').length;
    const activePrograms = trainings.filter((training) => training.status !== 'completed').length;

    const recentActivity = [...applications.map((application) => ({
      label: `${application.user?.name || 'Student'} applied for ${application.training?.title || 'a course'}`,
      status: application.status,
      updatedAt: application.updatedAt,
    })), ...users.map((user) => ({
      label: `${user.name} joined as ${user.role}`,
      status: user.status,
      updatedAt: user.createdAt,
    }))].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 12);

    res.json({
      summary: {
        totalUsers,
        totalStudents,
        totalStaff,
        totalAdmins,
        activePrograms,
        totalApplications: applications.length,
      },
      users,
      trainings,
      applications,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  getUserProfile,
  updateUser,
  getDashboardData,
};
