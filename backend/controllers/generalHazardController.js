const Hazard = require('../models/generalHazardModel');

// Get all hazards
const getAllHazards = async (req, res) => {
  const hazards = await Hazard.find();
  res.json(hazards);
};

// Get hazard by ID
const getHazardById = async (req, res) => {
  const hazard = await Hazard.findById(req.params.id);
  if (!hazard) {
    return res.status(404).json({ message: 'Hazard not found' });
  }
  res.json(hazard);
};

// Create new hazard
const createHazard = async (req, res) => {
  const hazard = new Hazard(req.body);
  await hazard.save();
  res.status(201).json(hazard);
};

// Update hazard
const updateHazard = async (req, res) => {
  const hazard = await Hazard.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!hazard) {
    return res.status(404).json({ message: 'Hazard not found' });
  }
  res.json(hazard);
};

// Delete hazard
const deleteHazard = async (req, res) => {
  const hazard = await Hazard.findByIdAndDelete(req.params.id);
  if (!hazard) {
    return res.status(404).json({ message: 'Hazard not found' });
  }
  res.json({ message: 'Hazard deleted successfully' });
};

module.exports = {
  getAllHazards,
  getHazardById,
  createHazard,
  updateHazard,
  deleteHazard
};
