const express = require('express');
const { getAllEarthquakes, getEarthquakeById, createEarthquake, updateEarthquake, deleteEarthquake, predictEarthquakeMagnitude } = require('../controllers/earthquakeController');
const router = express.Router();

// Route to get all earthquakes
router.get('/', getAllEarthquakes);
router.get('/:id', getEarthquakeById);
router.post('/', createEarthquake);
router.put('/:id', updateEarthquake);
router.delete('/:id', deleteEarthquake);
router.post('/predict', predictEarthquakeMagnitude);
module.exports = router;
