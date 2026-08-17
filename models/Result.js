const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
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
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pass', 'fail', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
