const express = require('express');
const router = express.Router();
const {
  getAllFloods,
  getFloodById,
  createFlood,
  updateFlood,
  deleteFlood
} = require('../controllers/floodController');

// GET all floods
router.get('/', getAllFloods);

// GET single flood
router.get('/:id', getFloodById);

// POST new flood
router.post('/', createFlood);

// PUT update flood
router.put('/:id', updateFlood);

// DELETE flood
router.delete('/:id', deleteFlood);

module.exports = router;
