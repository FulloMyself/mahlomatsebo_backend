const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getCubicles,
  createCubicle,
  getCubicleById,
} = require('../controllers/cubicleController');

router.get('/', protect, getCubicles);
router.post('/', protect, authorize('admin'), createCubicle);
router.get('/:id', protect, getCubicleById);

module.exports = router;