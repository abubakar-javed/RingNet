const Flood = require('../models/floodModel');
const { getUserFloodAlerts, fetchFloodDataForClusters } = require('../services/floodService');

// Get all floods
const getAllFloods = async (req, res) => {
  try {
    const floods = await Flood.find().sort({ date: -1 }).limit(100);
    res.json(floods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single flood by ID
const getFloodById = async (req, res) => {
  try {
    const flood = await Flood.findById(req.params.id);
    if (!flood) {
      return res.status(404).json({ message: 'Flood not found' });
    }
    res.json(flood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get floods by location
const getFloodsByLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Convert radius from km to approximate degrees
    const latRadius = radius / 111; // 1 degree latitude is approximately 111 km
    const lonRadius = radius / (111 * Math.cos(latitude * Math.PI / 180));
    
    const floods = await Flood.find({
      'location.latitude': { 
        $gte: parseFloat(latitude) - latRadius, 
        $lte: parseFloat(latitude) + latRadius 
      },
      'location.longitude': { 
        $gte: parseFloat(longitude) - lonRadius, 
        $lte: parseFloat(longitude) + lonRadius 
      }
    }).sort({ date: -1 }).limit(50);
    
    res.json(floods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get flood alerts for the current user
const getFloodsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get flood alerts from the service
    const floodAlerts = await getUserFloodAlerts(userId);
    res.json(floodAlerts);
  } catch (error) {
    console.error('Error in getFloodsForUser:', error);
    res.status(500).json({ 
      error: 'Failed to fetch flood data',
      message: error.message 
    });
  }
};

// Create a new flood record (admin only)
const createFlood = async (req, res) => {
  try {
    const flood = new Flood(req.body);
    const savedFlood = await flood.save();
    res.status(201).json(savedFlood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a flood record (admin only)
const updateFlood = async (req, res) => {
  try {
    const flood = await Flood.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!flood) {
      return res.status(404).json({ message: 'Flood not found' });
    }
    res.json(flood);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a flood record (admin only)
const deleteFlood = async (req, res) => {
  try {
    const flood = await Flood.findByIdAndDelete(req.params.id);
    if (!flood) {
      return res.status(404).json({ message: 'Flood not found' });
    }
    res.json({ message: 'Flood deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Force update all flood data for clusters
const updateFloodData = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized: Admin access required' });
    }
    
    // Trigger the update
    const result = await fetchFloodDataForClusters();
    
    res.json({ 
      message: 'Flood data update triggered successfully',
      clustersUpdated: result
    });
  } catch (error) {
    console.error('Error updating flood data:', error);
    res.status(500).json({ 
      error: 'Failed to update flood data',
      message: error.message 
    });
  }
};

// Get all flood alerts
const getFloodAlerts = async (req, res) => {
  try {
    const userId = req.user._id;
    const floodAlerts = await getUserFloodAlerts(userId);
    res.json(floodAlerts.alerts);
  } catch (error) {
    console.error('Error getting flood alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch flood alerts',
      message: error.message 
    });
  }
};

module.exports = {
  getAllFloods,
  getFloodById,
  getFloodsByLocation,
  getFloodsForUser,
  createFlood,
  updateFlood,
  deleteFlood,
  updateFloodData,
  getFloodAlerts
};
