const { getEmergencyContactsForLocation } = require('../services/emergencyContactsService');

/**
 * Get emergency contacts for the user based on their location
 * @param {Object} req - Express request object with user and query params
 * @param {Object} res - Express response object
 */
const getEmergencyContactsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if location is provided in request params
    const userLocation = req.query.latitude && req.query.longitude ? {
      latitude: parseFloat(req.query.latitude),
      longitude: parseFloat(req.query.longitude)
    } : null;
    
   
    // Get the user's location name from coordinates (reverse geocoding)
    // This could be done with a geocoding service or stored in user profile
    
    const emergencyContacts = await getEmergencyContactsForLocation(userLocation,userId);
    
    res.json(emergencyContacts);
  } catch (error) {
    console.error('Error in getEmergencyContactsForUser:', error);
    res.status(500).json({ 
      error: 'Failed to fetch emergency contacts',
      message: error.message 
    });
  }
};

module.exports = {
  getEmergencyContactsForUser
}; 