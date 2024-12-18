const Flood = require('../models/floodModel');

// Get all floods
const getAllFloods = async (req, res) => {
  const floods = await Flood.find().sort({ date: -1 });
  res.json(floods);
};

// Get a single flood by ID
const getFloodById = async (req, res) => {
  const flood = await Flood.findById(req.params.id);
  if (!flood) {
    return res.status(404).json({ message: 'Flood not found' });
  }
  res.json(flood);
};

// Create a new flood record
const createFlood = async (req, res) => {
  const flood = new Flood(req.body);
  const savedFlood = await flood.save();
  res.status(201).json(savedFlood);
};

// Update a flood record
const updateFlood = async (req, res) => {
  const flood = await Flood.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!flood) {
    return res.status(404).json({ message: 'Flood not found' });
  }
  res.json(flood);
};

// Delete a flood record
const deleteFlood = async (req, res) => {
  const flood = await Flood.findByIdAndDelete(req.params.id);
  if (!flood) {
    return res.status(404).json({ message: 'Flood not found' });
  }
  res.json({ message: 'Flood deleted successfully' });
};

module.exports = {
  getAllFloods,
  getFloodById,
  createFlood,
  updateFlood,
  deleteFlood
};
