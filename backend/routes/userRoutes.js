const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middlewares/auth'); // Assuming you have auth middleware

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, location, description, alertPreferences } = req.body;
    
    // Build user object
    const userFields = {};
    if (name) {
      const [firstName, ...lastNameParts] = name.split(' ');
      userFields.name = name;
    }
    if (email) userFields.email = email;
    if (phone) userFields.phone = phone;
    if (description) userFields.description = description;
    if (alertPreferences) userFields.alertPreferences = alertPreferences;
    
    // Handle location (could be string or coordinates)
    if (location) {
      if (typeof location === 'string') {
        userFields.locationString = location;
      } else if (typeof location === 'object') {
        userFields.location = {
          latitude: location.latitude,
          longitude: location.longitude
        };
      }
    }
    
    userFields.updatedAt = Date.now();

    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user location only
router.put('/location', auth, async (req, res) => {
  try {
    const { location } = req.body;
    console.log("location",location);
    
    if (!location || !location.latitude || !location.longitude) {
      return res.status(400).json({ message: 'Invalid location data' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.location = {
      latitude: location.latitude,
      longitude: location.longitude
    };
    user.updatedAt = Date.now();
    
    await user.save();
    
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;