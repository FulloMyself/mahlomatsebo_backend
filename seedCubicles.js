const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cubicle = require('./models/Cubicle');
const User = require('./models/User');

dotenv.config();

const seedCubicles = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find an admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found. Creating default admin...');
      
      const defaultAdmin = await User.create({
        name: 'System Administrator',
        email: 'admin@mahlomatsebosolutions.co.za',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      
      console.log('Created default admin:', defaultAdmin.email);
      var adminId = defaultAdmin._id;
    } else {
      console.log('Found admin:', admin.email);
      var adminId = admin._id;
    }

    // Clear existing cubicles
    await Cubicle.deleteMany({});
    console.log('Cleared existing cubicles');

    // Create cubicles
    const cubicles = [
      {
        name: 'Electrical Cubicle 1',
        type: 'Electrical',
        location: 'Workshop A',
        equipment: ['Multimeter', 'Oscilloscope', 'Power Supply', 'Circuit Tester'],
        status: 'available',
        createdBy: adminId
      },
      {
        name: 'Electrical Cubicle 2',
        type: 'Electrical',
        location: 'Workshop A',
        equipment: ['Circuit Tester', 'Soldering Station', 'Wire Strippers'],
        status: 'available',
        createdBy: adminId
      },
      {
        name: 'Welding Cubicle 1',
        type: 'Welding',
        location: 'Welding Bay 1',
        equipment: ['Arc Welder', 'MIG Welder', 'Safety Gear', 'Welding Helmet'],
        status: 'available',
        createdBy: adminId
      },
      {
        name: 'Welding Cubicle 2',
        type: 'Welding',
        location: 'Welding Bay 1',
        equipment: ['TIG Welder', 'Plasma Cutter', 'Grinding Station'],
        status: 'available',
        createdBy: adminId
      }
    ];

    const created = await Cubicle.insertMany(cubicles);
    console.log(`Created ${created.length} cubicles`);
    console.log('Cubicle seeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cubicles:', error);
    process.exit(1);
  }
};

seedCubicles();