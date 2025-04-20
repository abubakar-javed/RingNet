const axios = require('axios');
const User = require('../models/userModel');
const NodeGeocoder = require('node-geocoder');

// Initialize geocoder 
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

/**
 * Get emergency contacts for a specific location using Gemini API
 * @param {Object} location - Object containing latitude and longitude
 * @returns {Promise<Array>} - Array of emergency contacts
 */
const getEmergencyContactsForLocation = async (location = null, userId) => {
  try {
    let latitude;
    let longitude;
    if (location) {
      latitude=location.latitude;
      longitude=location.longitude;
      user.location = updatedLocation;
      await user.save()
    }
    else {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      if (!user.location) {
        throw new Error('User location not found');
      }
      latitude=user.location.latitude;
      longitude=user.location.longitude;
    }


   
    // Get location name from coordinates
    const geocodeResult = await geocoder.reverse({ lat: latitude, lon: longitude });
    const locationName = geocodeResult && geocodeResult.length > 0
      ? `${geocodeResult[0].city || ''}, ${geocodeResult[0].state || ''}, ${geocodeResult[0].country || ''}`
      : `${latitude}, ${longitude}`;

    // Call Gemini API
    const GEMINI_API_KEY = "AIzaSyCgd-30Wlh3z5YJNBs0TndJyP3rsR8hqr8";

    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    const prompt = `
      I need a list of emergency contacts for the location: ${locationName}. 
      Please provide actual, accurate emergency service contacts for this specific location.
      The response should be in the following JSON format:
      [
        {
          "dept": "Emergency Service Name",
          "contact": "Contact Number",
          "status": "Available"
        }
      ]
      Include police, ambulance, fire department, and disaster management contacts relevant to ${locationName}.
      The status should be "Available" for all contacts.
      Return only the JSON array, no explanations or other text.
    `;

    const response = await axios.post(
      `${API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }
    );

    // Extract and parse the generated content from Gemini
    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Clean the response to extract just the JSON part
    const jsonText = generatedText.trim().replace(/```json|```/g, '').trim();

    // Parse the JSON
    let emergencyContacts = JSON.parse(jsonText);

    // Ensure we have the correct format
    emergencyContacts = emergencyContacts.map(contact => ({
      dept: contact.dept,
      contact: contact.contact,
      status: contact.status || 'Available'
    }));

    return emergencyContacts;
  } catch (error) {
    console.error('Error in getEmergencyContactsForLocation:', error);

    // Fallback to default emergency contacts if API fails
    return [
      { dept: 'National Emergency', contact: '911', status: 'Available' },
      { dept: 'Local Police', contact: '112', status: 'Available' },
      { dept: 'Ambulance', contact: '112', status: 'Available' },
      { dept: 'Fire Department', contact: '112', status: 'Available' }
    ];
  }
};

module.exports = {
  getEmergencyContactsForLocation
}; 