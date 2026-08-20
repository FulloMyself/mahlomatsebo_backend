const mongoose = require('mongoose');

const cubicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Electrical', 'Welding', 'General'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    equipment: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cubicle', cubicleSchema);