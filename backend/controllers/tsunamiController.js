const Tsunami = require('../models/tsunamiModel');

// Get all tsunamis
const getAllTsunamis = async (req, res) => {
  const tsunamis = await Tsunami.find().sort({ date: -1 });
  res.status(200).json(tsunamis);
};

// Get a single tsunami by ID
const getTsunamiById = async (req, res) => {
  const tsunami = await Tsunami.findById(req.params.id);
  if (!tsunami) {
    return res.status(404).json({ message: 'Tsunami not found' });
  }
  res.status(200).json(tsunami);
};

// Create a new tsunami
const createTsunami = async (req, res) => {
  const tsunami = await Tsunami.create(req.body);
  res.status(201).json(tsunami);
};

// Update a tsunami
const updateTsunami = async (req, res) => {
  const tsunami = await Tsunami.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!tsunami) {
    return res.status(404).json({ message: 'Tsunami not found' });
  }
  res.status(200).json(tsunami);
};

// Delete a tsunami
const deleteTsunami = async (req, res) => {
  const tsunami = await Tsunami.findByIdAndDelete(req.params.id);
  if (!tsunami) {
    return res.status(404).json({ message: 'Tsunami not found' });
  }
  res.status(204).send();
};

module.exports = {
  getAllTsunamis,
  getTsunamiById,
  createTsunami,
  updateTsunami,
  deleteTsunami
};
