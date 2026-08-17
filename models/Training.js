const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    facilitator: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['course', 'program'],
      default: 'course',
    },
    duration: {
      type: String,
      default: '4 weeks',
    },
    capacity: {
      type: Number,
      default: 25,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Training', trainingSchema);
