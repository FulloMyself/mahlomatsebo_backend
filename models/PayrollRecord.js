const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: { type: String, required: true, trim: true },
    grossAmount: { type: Number, required: true, min: 0 },
    deductions: { type: Number, required: true, min: 0, default: 0 },
    netAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected', 'paid'], default: 'submitted' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayrollRecord', payrollRecordSchema);
