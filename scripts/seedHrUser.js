const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const HR_USER = {
  name: 'HR Manager',
  email: 'hr@mahlomatsebosolutions.co.za',
  password: 'hr123',
  role: 'hr',
  phone: '082 740 1371',
  department: 'Human Resources',
  status: 'active',
};

async function seedHrUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingUser = await User.findOne({ email: HR_USER.email });
    if (existingUser) {
      existingUser.name = HR_USER.name;
      existingUser.role = HR_USER.role;
      existingUser.phone = HR_USER.phone;
      existingUser.department = HR_USER.department;
      existingUser.status = HR_USER.status;
      await existingUser.save();
      console.log(`Updated HR user: ${existingUser.email}`);
    } else {
      const createdUser = await User.create(HR_USER);
      console.log(`Created HR user: ${createdUser.email}`);
    }
  } catch (error) {
    console.error('HR user seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedHrUser();
