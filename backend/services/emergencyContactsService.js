const axios = require('axios');
const User = require('../models/userModel');
const NodeGeocoder = require('node-geocoder');

// Initialize geocoder 
const geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

// Rate limiting and retry configuration
const API_REQUEST_CONFIG = {
  maxRetries: 3,                   // Maximum number of retry attempts
  initialBackoffDelay: 2000,       // Initial delay in ms (2 seconds)
  maxBackoffDelay: 60000,          // Maximum delay in ms (60 seconds)
  backoffFactor: 2,                // Exponential factor
  requestTimeout: 10000,           // 10 seconds timeout for requests
  requestQueue: [],                // Queue for pending requests
  isProcessingQueue: false,        // Flag to track if we're processing the queue
  lastRequestTime: 0,              // Timestamp of the last request
  minRequestInterval: 1000,        // Minimum 1 second between requests
};

// Static emergency contacts to use as fallback
const DEFAULT_EMERGENCY_CONTACTS = [
  { dept: 'National Emergency', contact: '911', status: 'Available' },
  { dept: 'Local Police', contact: '112', status: 'Available' },
  { dept: 'Ambulance', contact: '112', status: 'Available' },
  { dept: 'Fire Department', contact: '112', status: 'Available' }
];

// Cache for emergency contacts by location
const emergencyContactsCache = new Map();

/**
 * Helper function to make API requests with retry logic
 * @param {Function} requestFn - Function that returns a promise for the API request
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<any>} - API response
 */
const makeRequestWithRetry = async (requestFn, retryCount = 0) => {
  try {
    // Check if we need to wait before making a request
    const now = Date.now();
    const timeElapsed = now - API_REQUEST_CONFIG.lastRequestTime;
    
    if (timeElapsed < API_REQUEST_CONFIG.minRequestInterval) {
      const waitTime = API_REQUEST_CONFIG.minRequestInterval - timeElapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    // Update the last request time
    API_REQUEST_CONFIG.lastRequestTime = Date.now();
    
    return await requestFn();
  } catch (error) {
    // If we get rate limited (429) or it's a temporary server error (5xx)
    if ((error.response && error.response.status === 429) || 
        (error.response && error.response.status >= 500 && error.response.status < 600)) {
      
      if (retryCount >= API_REQUEST_CONFIG.maxRetries) {
        console.error(`Maximum retries reached for API request`);
        throw error;
      }
      
      // Calculate backoff delay with exponential backoff + small random jitter
      const jitter = Math.random() * 1000; // Random ms between 0-1000
      const delay = Math.min(
        API_REQUEST_CONFIG.initialBackoffDelay * Math.pow(API_REQUEST_CONFIG.backoffFactor, retryCount) + jitter,
        API_REQUEST_CONFIG.maxBackoffDelay
      );
      
      console.log(`API request failed with ${error.response.status}. Retrying in ${Math.round(delay/1000)} seconds...`);
      
      // Wait for the calculated delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return makeRequestWithRetry(requestFn, retryCount + 1);
    }
    
    // For other errors, just throw
    throw error;
  }
};

/**
 * Get emergency contacts for a specific location using Gemini API
 * @param {Object} location - Object containing latitude and longitude
 * @returns {Promise<Array>} - Array of emergency contacts
 */
const getEmergencyContactsForLocation = async (location = null, userId) => {
  try {
    // let latitude;
    // let longitude;
    // let user;
    
    // if (location) {
    //   latitude = location.latitude;
    //   longitude = location.longitude;
      
    //   // Get user and update their location
    //   user = await User.findById(userId);
    //   if (user) {
    //     user.location = {
    //       latitude: location.latitude,
    //       longitude: location.longitude
    //     };
    //     await user.save();
    //   }
    // }
    // else {
    //   user = await User.findById(userId);
    //   if (!user) {
    //     throw new Error('User not found');
    //   }
    //   if (!user.location) {
    //     throw new Error('User location not found');
    //   }
    //   latitude = user.location.latitude;
    //   longitude = user.location.longitude;
    // }

    // Get location name from coordinates
    // const geocodeResult = await geocoder.reverse({ lat: latitude, lon: longitude });
    // const locationName = geocodeResult && geocodeResult.length > 0
    //   ? `${geocodeResult[0].city || ''}, ${geocodeResult[0].state || ''}, ${geocodeResult[0].country || ''}`
    //   : `${latitude}, ${longitude}`;

    // // Create a unique cache key for this location
    // const locationKey = locationName.toLowerCase().trim();
    
    // // Check if we have this location cached
    // if (emergencyContactsCache.has(locationKey)) {
    //   console.log(`Using cached emergency contacts for ${locationName}`);
    //   return emergencyContactsCache.get(locationKey);
    // }

    // // Call Gemini API
    // const GEMINI_API_KEY = "AIzaSyBz00CrU6oWRHOzazQ2QOmRKWdHSovQZjY";

    // if (!GEMINI_API_KEY) {
    //   throw new Error('Gemini API key is not configured');
    // }

    // const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

    // const prompt = `
    //   I need a list of emergency contacts for the location: ${locationName}. 
    //   Please provide actual, accurate emergency service contacts for this specific location.
    //   The response should be in the following JSON format:
    //   [
    //     {
    //       "dept": "Emergency Service Name",
    //       "contact": "Contact Number",
    //       "status": "Available"
    //     }
    //   ]
    //   Include police, ambulance, fire department, and disaster management contacts relevant to ${locationName}.
    //   The status should be "Available" for all contacts.
    //   Return only the JSON array, no explanations or other text.
    // `;

    // // Create a request function that will be passed to the retry mechanism
    // const makeApiRequest = async () => {
    //   return await axios.post(
    //     `${API_URL}?key=${GEMINI_API_KEY}`,
    //     {
    //       contents: [
    //         {
    //           parts: [
    //             {
    //               text: prompt
    //             }
    //           ]
    //         }
    //       ],
    //       generationConfig: {
    //         temperature: 0.2,
    //         topK: 32,
    //         topP: 0.95,
    //         maxOutputTokens: 1024,
    //       }
    //     },
    //     {
    //       timeout: API_REQUEST_CONFIG.requestTimeout
    //     }
    //   );
    // };

    // // Make the API request with retry logic
    // const response = await makeRequestWithRetry(makeApiRequest);

    // // Extract and parse the generated content from Gemini
    // const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Clean the response to extract just the JSON part
    // const jsonText = generatedText.trim().replace(/```json|```/g, '').trim();

    // // Parse the JSON
    // let emergencyContacts = JSON.parse(jsonText);

    // // Ensure we have the correct format
    // emergencyContacts = emergencyContacts.map(contact => ({
    //   dept: contact.dept,
    //   contact: contact.contact,
    //   status: contact.status || 'Available'
    // }));

    // Cache the results
    // emergencyContactsCache.set(locationKey, emergencyContacts);
    
    // // If cache gets too large, remove the oldest entries
    // if (emergencyContactsCache.size > 100) {
    //   const oldestKey = emergencyContactsCache.keys().next().value;
    //   emergencyContactsCache.delete(oldestKey);
    // }

    return DEFAULT_EMERGENCY_CONTACTS;
  } catch (error) {
    console.error('Error in getEmergencyContactsForLocation:', error);

    // Fallback to default emergency contacts if API fails
    return DEFAULT_EMERGENCY_CONTACTS;
  }
};

module.exports = {
  getEmergencyContactsForLocation
}; 