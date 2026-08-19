/* Seed script to create system users and launch programmes */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Training = require('../models/Training');
const Enrollment = require('../models/Enrollment');
const Schedule = require('../models/Schedule');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mahloma';

const users = [
  { name: 'System Administrator', email: 'admin@mahlomatsebosolutions.co.za', password: 'admin123', role: 'admin', phone: '064 649 5947', department: 'Operations' },
  { name: 'Training Facilitator', email: 'staff@mahlomatsebosolutions.co.za', password: 'staff123', role: 'staff', phone: '082 740 1371', department: 'Training' },
  { name: 'Demo Learner', email: 'student@mahlomatsebosolutions.co.za', password: 'student123', role: 'student', phone: '071 000 0000', department: 'Student Services' },
];

const schedulesSeed = [
  {
    title: 'First Aid - Session 1',
    description: 'Intro to First Aid',
    start: new Date('2026-08-25T09:00:00Z'),
    end: new Date('2026-08-25T11:00:00Z'),
    location: 'Training Room A',
    status: 'scheduled',
  },
  {
    title: 'ECD Foundations - Week 1',
    description: 'Foundations and classroom setup',
    start: new Date('2026-09-02T08:00:00Z'),
    end: new Date('2026-09-02T12:00:00Z'),
    location: 'Training Hall',
    status: 'scheduled',
  },
];


const programmes = [
  {
    title: 'ECD Foundations Programme',
    category: 'Early Childhood Development',
    description: 'A practical course for educators and caregivers to support learner development in early years settings.',
    facilitator: 'Ms. N. Mokoena',
    type: 'program',
    duration: '6 weeks',
    capacity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=900&q=80',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-10-15'),
    status: 'scheduled',
  },
  {
    title: 'First Aid Level 2',
    category: 'Health & Safety',
    description: 'A hands-on first aid training course covering emergency care, assessment and workplace readiness.',
    facilitator: 'Mr. T. Dlamini',
    type: 'course',
    duration: '3 weeks',
    capacity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
    startDate: new Date('2026-08-20'),
    endDate: new Date('2026-09-10'),
    status: 'scheduled',
  },
  {
    title: 'Basic Fire Fighting Essentials',
    category: 'Fire Safety',
    description: 'Build confidence in fire prevention, evacuation procedures and safe equipment handling.',
    facilitator: 'Mr. K. Nkabinde',
    type: 'course',
    duration: '2 weeks',
    capacity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    startDate: new Date('2026-09-15'),
    endDate: new Date('2026-09-29'),
    status: 'scheduled',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to Mongo for seeding');

    await User.deleteMany({});
    await Training.deleteMany({});
    await Enrollment.deleteMany({});

    const createdUsers = [];
    for (const userData of users) {
      const createdUser = await User.create(userData);
      createdUsers.push(createdUser);
      console.log(`Created ${createdUser.email}`);
    }

    const adminUser = createdUsers.find((user) => user.role === 'admin');
    for (const trainingData of programmes) {
      const training = await Training.create({
        ...trainingData,
        createdBy: adminUser._id,
      });
      console.log(`Created programme: ${training.title}`);
    }

    const studentUser = createdUsers.find((user) => user.role === 'student');
    const staffUser = createdUsers.find((user) => user.role === 'staff');
    const firstTraining = await Training.findOne({ title: 'ECD Foundations Programme' });
    if (studentUser && firstTraining) {
      await Enrollment.create({
        user: studentUser._id,
        training: firstTraining._id,
        status: 'applied',
        source: 'portal',
        notes: 'Interested in ECD leadership pathway.',
      });
      console.log('Created sample student application');
    }

    // Create sample schedules assigned to staff with the demo student as participant
    if (staffUser) {
      for (const s of schedulesSeed) {
        const created = await Schedule.create({
          title: s.title,
          description: s.description,
          start: s.start,
          end: s.end,
          staff: staffUser._id,
          students: studentUser ? [studentUser._id] : [],
          location: s.location,
          status: s.status || 'scheduled',
          createdBy: adminUser._id,
        });
        console.log(`Created schedule: ${created.title}`);
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
