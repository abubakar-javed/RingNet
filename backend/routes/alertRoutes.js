const express = require('express');
const router = express.Router();
const Alert = require('../models/alertModel');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');
const { calculateDistance } = require('../utils/geoUtils');

// Get all recent alerts for map view (past 3 days)
router.get('/map-alerts', auth, async (req, res) => {
  try {
    // Get alerts from the last 3 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3);
    
    // Find all alerts without filtering by user location
    const alerts = await Alert.find({
      timestamp: { $gte: startDate },
      isActive: true,
      // Only include alerts with valid coordinates
      'coordinates.latitude': { $exists: true },
      'coordinates.longitude': { $exists: true }
    }).sort({ timestamp: -1 });
    
    res.json({
      alerts: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error fetching map alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alerts for logged in user based on location
router.get('/user-alerts', auth, async (req, res) => {
  try {
    const user = req.user;
    const maxDistance = req.query.distance || 100; // Default 100km radius
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Get alerts from the last 7 days by default
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Find all alerts
    const alerts = await Alert.find({
      timestamp: { $gte: startDate },
      isActive: true
    }).sort({ timestamp: -1 });
    
    // Filter alerts by distance from user
    const userAlerts = alerts.filter(alert => {
      if (!alert.coordinates || !alert.coordinates.latitude || !alert.coordinates.longitude) {
        return false;
      }
      
      const distance = calculateDistance(
        user.location.latitude, 
        user.location.longitude,
        alert.coordinates.latitude, 
        alert.coordinates.longitude
      );
      
      // Add distance to the alert object
      alert._doc.distance = Math.round(distance);
      
      return distance <= maxDistance;
    });
    
    // Paginate results
    const paginatedAlerts = userAlerts.slice(skip, skip + limit);
    
    res.json({
      alerts: paginatedAlerts,
      total: userAlerts.length,
      page,
      totalPages: Math.ceil(userAlerts.length / limit)
    });
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific alert by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alerts by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const user = req.user;
    const alertType = req.params.type;
    const maxDistance = req.query.distance || 100; // Default 100km radius
    
    // Validate alert type
    const validTypes = ['Earthquake', 'Tsunami', 'Flood', 'Heatwave'];
    if (!validTypes.includes(alertType)) {
      return res.status(400).json({ message: 'Invalid alert type' });
    }
    
    // Get alerts from the last 7 days by default
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Find alerts by type
    const alerts = await Alert.find({
      type: alertType,
      timestamp: { $gte: startDate },
      isActive: true
    }).sort({ timestamp: -1 });
    
    // Filter alerts by distance from user
    const userAlerts = alerts.filter(alert => {
      if (!alert.coordinates || !alert.coordinates.latitude || !alert.coordinates.longitude) {
        return false;
      }
      
      const distance = calculateDistance(
        user.location.latitude, 
        user.location.longitude,
        alert.coordinates.latitude, 
        alert.coordinates.longitude
      );
      
      // Add distance to the alert object
      alert._doc.distance = Math.round(distance);
      
      return distance <= maxDistance;
    });
    
    res.json(userAlerts);
  } catch (error) {
    console.error('Error fetching alerts by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
