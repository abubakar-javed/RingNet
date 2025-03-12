const express = require('express');
const { getAllEarthquakes, getEarthquakeById, createEarthquake, updateEarthquake, deleteEarthquake, predictEarthquakeMagnitude } = require('../controllers/earthquakeController');
const router = express.Router();
const auth = require('../middlewares/auth');
const earthquakeService = require('../services/earthquakeService');

// Route to get all earthquakes
router.get('/', getAllEarthquakes);
router.post('/', createEarthquake);

// Get earthquake data for the authenticated user
router.get('/user/data', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const maxDistance = req.query.maxDistance ? parseInt(req.query.maxDistance) : 500;
    
    const earthquakeData = await earthquakeService.getUserEarthquakeData(userId, maxDistance);
    
    res.json(earthquakeData);
  } catch (error) {
    console.error('Error fetching user earthquake data:', error);
    res.status(500).json({ message: 'Error fetching earthquake data' });
  }
});

// Get all earthquake events
router.get('/events', auth, async (req, res) => {
  try {
    const earthquakeEvents = await earthquakeService.getStoredEarthquakeEvents();
    
    res.json({ events: earthquakeEvents });
  } catch (error) {
    console.error('Error fetching earthquake events:', error);
    res.status(500).json({ message: 'Error fetching earthquake events' });
  }
});

// Manually trigger earthquake data fetch (for testing)
router.post('/fetch', auth, async (req, res) => {
  try {
    // Check if user is admin (optional)
    if (req.user.isAdmin !== true) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const minMagnitude = req.body.minMagnitude || 2.5;
    const earthquakeEvents = await earthquakeService.fetchEarthquakeData(minMagnitude);
    
    res.json({ 
      message: 'Earthquake data fetched successfully', 
      count: earthquakeEvents.length 
    });
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    res.status(500).json({ message: 'Error fetching earthquake data' });
  }
});


router.post('/predict', predictEarthquakeMagnitude);
router.get('/:id', getEarthquakeById);
router.put('/:id', updateEarthquake);
router.delete('/:id', deleteEarthquake);
module.exports = router;
