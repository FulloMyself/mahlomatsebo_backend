const express = require('express');
const { getTrainings, createTraining, getTrainingById, applyToTraining, updateEnrollmentStatus } = require('../controllers/trainingController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', protect, getTrainings);
router.post('/', protect, authorize('admin', 'staff'), createTraining);
router.post('/apply', protect, applyToTraining);
router.put('/applications/:id/status', protect, authorize('admin', 'staff'), updateEnrollmentStatus);
router.get('/:id', protect, getTrainingById);

module.exports = router;
