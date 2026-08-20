const Cubicle = require('../models/Cubicle');

// GET /api/cubicles
const getCubicles = async (req, res) => {
  try {
    const cubicles = await Cubicle.find().sort({ name: 1 });
    res.json({ cubicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/cubicles (admin only)
const createCubicle = async (req, res) => {
  try {
    const { name, type, location, equipment } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ message: 'Name, type and location are required.' });
    }

    const cubicle = await Cubicle.create({
      name,
      type,
      location,
      equipment: equipment || [],
      createdBy: req.user._id,
    });

    res.status(201).json({ cubicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/cubicles/:id
const getCubicleById = async (req, res) => {
  try {
    const cubicle = await Cubicle.findById(req.params.id);
    if (!cubicle) {
      return res.status(404).json({ message: 'Cubicle not found' });
    }
    res.json({ cubicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCubicles,
  createCubicle,
  getCubicleById,
};