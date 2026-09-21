const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const PayrollRecord = require('../models/PayrollRecord');

const employeePopulate = 'name email role phone department employmentStatus status';

const getHrOverview = async (req, res) => {
  try {
    const [users, leaveRequests, payrollRecords] = await Promise.all([
      User.find({ role: { $in: ['staff', 'hr'] } }).select('-password').sort({ name: 1 }),
      LeaveRequest.find()
        .populate('employee', employeePopulate)
        .populate('submittedBy', 'name email role')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 }),
      PayrollRecord.find()
        .populate('employee', employeePopulate)
        .populate('createdBy', 'name email role')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 }),
    ]);

    const students = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });
    res.json({
      summary: {
        staff: users.filter((user) => user.role === 'staff').length,
        hrUsers: users.filter((user) => user.role === 'hr').length,
        students: students.length,
        pendingLeave: leaveRequests.filter((request) => request.status === 'pending').length,
        pendingPayroll: payrollRecords.filter((record) => record.status === 'submitted').length,
      },
      staff: users,
      students,
      leaveRequests,
      payrollRecords,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Employee, leave type, dates and reason are required.' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'Leave end date must be on or after the start date.' });
    }
    const employee = await User.findOne({ _id: employeeId, role: 'staff' });
    if (!employee) return res.status(404).json({ message: 'Staff member not found.' });

    const request = await LeaveRequest.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      submittedBy: req.user._id,
    });
    res.status(201).json({ leaveRequest: await request.populate('employee', employeePopulate) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewLeaveRequest = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'A valid approval status is required.' });
    }
    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Leave request not found.' });
    request.status = status;
    request.reviewNotes = reviewNotes || '';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    const saved = await request.save();
    res.json({ leaveRequest: await saved.populate('employee', employeePopulate) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayrollRecord = async (req, res) => {
  try {
    const { employeeId, period, grossAmount, deductions, notes } = req.body;
    if (!employeeId || !period || grossAmount === undefined) {
      return res.status(400).json({ message: 'Employee, period and gross amount are required.' });
    }
    const employee = await User.findOne({ _id: employeeId, role: 'staff' });
    if (!employee) return res.status(404).json({ message: 'Staff member not found.' });
    const gross = Number(grossAmount);
    const deductionTotal = Number(deductions || 0);
    if (!Number.isFinite(gross) || !Number.isFinite(deductionTotal) || gross < 0 || deductionTotal < 0 || deductionTotal > gross) {
      return res.status(400).json({ message: 'Payroll amounts are invalid.' });
    }

    const record = await PayrollRecord.create({
      employee: employeeId,
      period,
      grossAmount: gross,
      deductions: deductionTotal,
      netAmount: gross - deductionTotal,
      notes: notes || '',
      createdBy: req.user._id,
    });
    res.status(201).json({ payrollRecord: await record.populate('employee', employeePopulate) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reviewPayrollRecord = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'A valid approval status is required.' });
    }
    const record = await PayrollRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Payroll record not found.' });
    record.status = status;
    record.approvedBy = req.user._id;
    record.approvedAt = new Date();
    const saved = await record.save();
    res.json({ payrollRecord: await saved.populate('employee', employeePopulate) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHrOverview,
  createLeaveRequest,
  reviewLeaveRequest,
  createPayrollRecord,
  reviewPayrollRecord,
};
