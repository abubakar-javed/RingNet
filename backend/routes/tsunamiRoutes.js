const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const tsunamiService = require('../services/tsunamiService');


// Get tsunami alerts for the authenticated user
router.get('/user/alerts', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tsunamiAlerts = await tsunamiService.getUserTsunamiAlerts(userId);
    
    res.json(tsunamiAlerts);
  } catch (error) {
    console.error('Error fetching user tsunami alerts:', error);
    res.status(500).json({ message: 'Error fetching tsunami alerts' });
  }
});

// Get all active tsunami events
router.get('/active', auth, async (req, res) => {
  try {
    const activeEvents = await tsunamiService.getActiveTsunamiEvents();
    
    res.json({ events: activeEvents });
  } catch (error) {
    console.error('Error fetching active tsunami events:', error);
    res.status(500).json({ message: 'Error fetching tsunami events' });
  }
});

// Manually trigger tsunami data fetch (for testing)
router.post('/fetch', auth, async (req, res) => {
  try {
    // Check if user is admin (optional)
    if (req.user.isAdmin !== true) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const tsunamiEvents = await tsunamiService.fetchTsunamiData();
    
    res.json({ message: 'Tsunami data fetched successfully', count: tsunamiEvents.length });
  } catch (error) {
    console.error('Error fetching tsunami data:', error);
    res.status(500).json({ message: 'Error fetching tsunami data' });
  }
});

module.exports = router;
