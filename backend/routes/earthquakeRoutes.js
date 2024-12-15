const express = require('express');
const { getAllEarthquakes,predictEarthquakeMagnitude } = require('../controllers/earthquakeController');
const router = express.Router();

// Route to get all earthquakes
router.get('/', getAllEarthquakes);
router.post('/predict',predictEarthquakeMagnitude);
module.exports = router;
