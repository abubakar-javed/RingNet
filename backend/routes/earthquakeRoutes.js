const express = require('express');
const { getAllEarthquakes } = require('../controllers/earthquakeController');
const router = express.Router();

// Route to get all earthquakes
router.get('/', getAllEarthquakes);

module.exports = router;
