const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      idNumber,
      dateOfBirth,
      address,
      province,
      employmentStatus,
      desiredProgram,
      motivation,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const normalizedRole = role === 'student' ? 'student' : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      idNumber: idNumber || '',
      dateOfBirth: dateOfBirth || '',
      address: address || '',
      province: province || '',
      employmentStatus: employmentStatus || '',
      desiredProgram: desiredProgram || '',
      motivation: motivation || '',
      role: normalizedRole,
      status: 'active',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      desiredProgram: user.desiredProgram,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
