const Heatwave = require('../models/heatwaveModel');

// Get all heatwaves
const getAllHeatwaves = async (req, res) => {
  const heatwaves = await Heatwave.find();
  res.status(200).json(heatwaves);
};

// Get a single heatwave by ID
const getHeatwaveById = async (req, res) => {
  const heatwave = await Heatwave.findById(req.params.id);
  if (!heatwave) {
    return res.status(404).json({ message: 'Heatwave not found' });
  }
  res.status(200).json(heatwave);
};

// Create a new heatwave
const createHeatwave = async (req, res) => {
  const heatwave = await Heatwave.create(req.body);
  res.status(201).json(heatwave);
};

// Update a heatwave
const updateHeatwave = async (req, res) => {
  const heatwave = await Heatwave.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!heatwave) {
    return res.status(404).json({ message: 'Heatwave not found' });
  }
  res.status(200).json(heatwave);
};

// Delete a heatwave
const deleteHeatwave = async (req, res) => {
  const heatwave = await Heatwave.findByIdAndDelete(req.params.id);
  if (!heatwave) {
    return res.status(404).json({ message: 'Heatwave not found' });
  }
  res.status(204).json(null);
};

module.exports = {
  getAllHeatwaves,
  getHeatwaveById,
  createHeatwave,
  updateHeatwave,
  deleteHeatwave
};
