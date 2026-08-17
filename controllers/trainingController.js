const Training = require('../models/Training');
const Enrollment = require('../models/Enrollment');

const getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    res.json({ trainings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTraining = async (req, res) => {
  try {
    const { title, category, description, facilitator, type, duration, capacity, imageUrl, startDate, endDate } = req.body;

    if (!title || !category || !description || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, category, description, startDate and endDate are required.' });
    }

    const training = await Training.create({
      title,
      category,
      description,
      facilitator: facilitator || 'Mahloma Tsebo Trainer',
      type: type || 'course',
      duration: duration || '4 weeks',
      capacity: capacity || 25,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
      startDate,
      endDate,
      status: 'scheduled',
      createdBy: req.user._id,
    });

    res.status(201).json({ training });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTrainingById = async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    res.json({ training });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyToTraining = async (req, res) => {
  try {
    const { trainingId, notes } = req.body;

    if (!trainingId) {
      return res.status(400).json({ message: 'Training selection is required.' });
    }

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ message: 'Training not found.' });
    }

    const existing = await Enrollment.findOne({ user: req.user._id, training: trainingId });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied for this course or programme.' });
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      training: trainingId,
      notes: notes || '',
      source: 'portal',
      status: 'applied',
    });

    res.status(201).json({ enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEnrollmentStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const enrollment = await Enrollment.findById(req.params.id).populate('user training');

    if (!enrollment) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    enrollment.status = status || enrollment.status;
    enrollment.notes = notes || enrollment.notes;
    enrollment.processedBy = req.user._id;

    const updated = await enrollment.save();
    res.json({ enrollment: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTrainings,
  createTraining,
  getTrainingById,
  applyToTraining,
  updateEnrollmentStatus,
};
