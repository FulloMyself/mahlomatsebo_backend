const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    training: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    status: {
      type: String,
      enum: ['applied', 'accepted', 'enrolled', 'completed', 'cancelled'],
      default: 'applied',
    },
    source: {
      type: String,
      enum: ['portal', 'admin'],
      default: 'portal',
    },
    notes: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
