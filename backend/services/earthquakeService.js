const axios = require('axios');
const Earthquake = require('../models/earthquakeModel');
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();
const Alert = require('../models/alertModel');
const Notification = require('../models/notificationModel');

// USGS Earthquake API URL
const USGS_EARTHQUAKE_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// Time threshold for refreshing earthquake data (in milliseconds)
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajavedbese21seecs:abubakar1243@cluster0.xjdvgvy.mongodb.net/ringNet';

const connectDB = async () => {
  try {
    // console.log("weather key",process..env.OPENWEATHER_API_KEY);
    // console.log('Attempting to connect to MongoDB...');
    // console.log('Using connection string:', process..env.MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Reduce the timeout to 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    // console.log('MongoDB connected successfully');
  } catch (error) {
    // console.error('MongoDB connection error:', error);
    
    // More specific error handling
    if (error.code === 'ECONNREFUSED') {
      // console.error('Make sure MongoDB is running on your machine');
    }
    
    process.exit(1);
  }
};

/**
 * Initialize earthquake service
 */
async function initialize() {
  try {
    await connectDB();
    // Check database connection state
    if (mongoose.connection.readyState !== 1) {
      // console.log('Database connection not ready, skipping earthquake service initialization');
      return false;
    }
    
    // Schedule regular updates
    // scheduleEarthquakeDataUpdates();
    fetchEarthquakeData();
    // console.log('Earthquake service initialized successfully');
    return true;
  } catch (error) {
    // console.error('Error initializing earthquake service:', error);
    return false;
  }
}

/**
 * Check if earthquake data needs to be refreshed
 */
async function shouldRefreshEarthquakeData() {
  try {
    // Find the most recent earthquake data entry
    const latestEntry = await Earthquake.findOne({
      'metadata.type': 'earthquake_collection'
    }).sort({ 'metadata.timestamp': -1 });
    
    if (!latestEntry) {
      // console.log('No earthquake data found in database, refresh needed');
      return true;
    }
    
    const lastUpdateTime = new Date(latestEntry.metadata.timestamp).getTime();
    const currentTime = Date.now();
    
    // Check if more than 24 hours have passed
    if (currentTime - lastUpdateTime > REFRESH_THRESHOLD_MS) {
      // console.log('Earthquake data is older than 24 hours, refresh needed');
      return true;
    }
    
    // console.log('Using existing earthquake data from database (less than 24 hours old)');
    return false;
  } catch (error) {
    // console.error('Error checking earthquake data refresh status:', error);
    return true; // Refresh on error to be safe
  }
}

/**
 * Fetch earthquake data from USGS API and store in database
 */
async function fetchEarthquakeData(minMagnitude = 2.5) {
  try {
    // Check if we need to refresh the data
    const needsRefresh = await shouldRefreshEarthquakeData();
    
    if (!needsRefresh) {
      // Return the existing data from database
      return await getStoredEarthquakeEvents();
    }
    
    // console.log('Fetching earthquake data from USGS API...');
    
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - REFRESH_THRESHOLD_MS);
    
    // Format dates for API
    const startTime = oneDayAgo.toISOString();
    const endTime = now.toISOString();
    
    // Make API request
    const response = await axios.get(USGS_EARTHQUAKE_API_URL, {
      params: {
        format: 'geojson',
        starttime: startTime,
        endtime: endTime,
        minmagnitude: minMagnitude
      }
    });
    
    const data = response.data;
    // console.log("data",data);
    if (!data || !data.features || data.features.length === 0) {
      // console.log('No earthquake data found in USGS API response');
      return [];
    }
    
    // console.log(`Found ${data.features.length} earthquakes from USGS API`);
    
    // Process earthquake events
    const processedEvents = data.features.map(feature => {
      const properties = feature.properties;
      const geometry = feature.geometry;
      
      return {
        eventId: feature.id,
        title: properties.title,
        place: properties.place,
        time: new Date(properties.time),
        updated: new Date(properties.updated),
        magnitude: properties.mag,
        magnitudeType: properties.magType,
        depth: geometry.coordinates[2],
        tsunami: properties.tsunami,
        alert: properties.alert,
        status: properties.status,
        location: {
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
          depth: geometry.coordinates[2]
        },
        url: properties.url,
        felt: properties.felt,
        cdi: properties.cdi,
        mmi: properties.mmi,
        significance: properties.sig
      };
    });
    
    // Store all events as a single collection entry
    await storeEarthquakeCollection(processedEvents, {
      start: oneDayAgo,
      end: now
    }, minMagnitude);
    
    return processedEvents;
  } catch (error) {
    // console.error('Error fetching earthquake data:', error.message);
    if (error.response) {
      // console.error('Response status:', error.response.status);
    }
    
    // Try to return existing data if available
    return await getStoredEarthquakeEvents();
  }
}

/**
 * Store all earthquake events as a single collection entry
 */
async function storeEarthquakeCollection(events, timeRange, minMagnitude) {
  try {
    // Create a new earthquake collection record
    const earthquakeCollection = new Earthquake({
      date: new Date(),
      source: 'USGS Earthquake API',
      description: `Collection of ${events.length} earthquakes in the past 24 hours`,
      metadata: {
        timestamp: new Date(),
        eventCount: events.length,
        minMagnitude: minMagnitude,
        timeRange: {
          start: timeRange.start,
          end: timeRange.end
        },
        type: 'earthquake_collection',
        events: events
      }
    });
    
    await earthquakeCollection.save();
    // console.log(`Stored collection of ${events.length} earthquakes in database`);
    
    return earthquakeCollection;
  } catch (error) {
    // console.error('Error storing earthquake collection:', error.message);
    return null;
  }
}

/**
 * Get stored earthquake events from database
 */
async function getStoredEarthquakeEvents() {
  try {
    // Find the most recent earthquake collection
    const latestCollection = await Earthquake.findOne({
      'metadata.type': 'earthquake_collection'
    }).sort({ 'metadata.timestamp': -1 });
    
    if (!latestCollection || !latestCollection.metadata || !latestCollection.metadata.events) {
      // console.log('No earthquake events found in database');
      return [];
    }
    
    return latestCollection.metadata.events;
  } catch (error) {
    // console.error('Error getting stored earthquake events:', error.message);
    return [];
  }
}

/**
 * Get earthquake data for a specific user based on location
 */
async function getUserEarthquakeData(userId, maxDistanceKm = 500) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      // console.log('Database connection not ready');
      return { events: [] };
    }
    
    // Get user data
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (!user || !user.location) {
      // console.log(`User ${userId} not found or has no location data`);
      return { events: [] };
    }
    
    // Get all earthquake events (either from API or database)
    const earthquakeEvents = await fetchEarthquakeData();
    
    if (!earthquakeEvents || earthquakeEvents.length === 0) {
      // console.log('No earthquake events available');
      return { events: [] };
    }
    
    // Filter events that are relevant to the user's location
    const relevantEvents = earthquakeEvents.filter(event => {
      // Calculate distance between user and earthquake
      const distance = calculateDistance(
        user.location.latitude, user.location.longitude,
        event.location.latitude, event.location.longitude
      );
      
      // Add distance to the event
      event.distance = distance;
      
      // Return events within the specified distance
      return distance <= maxDistanceKm;
    });
    
    // Sort events by magnitude (highest first) and distance (closest first)
    relevantEvents.sort((a, b) => {
      // First sort by magnitude
      const magnitudeDiff = b.magnitude - a.magnitude;
      
      if (Math.abs(magnitudeDiff) > 0.5) return magnitudeDiff;
      
      // Then sort by distance
      return a.distance - b.distance;
    });
    
    // Add where relevant earthquake events are processed
    // This would typically be after filtering and sorting events
    for (const event of relevantEvents) {
      // Create alert entry for each relevant earthquake
      const newAlert = new Alert({
        type: 'Earthquake',
        severity: event.magnitude >= 7 ? 'error' : 
                 event.magnitude >= 5 ? 'warning' : 'info',
        location: event.location.name || `${event.location.latitude}, ${event.location.longitude}`,
        timestamp: new Date(event.time),
        hazardId: event._id || new mongoose.Types.ObjectId(),
        hazardModel: 'Earthquake',
        coordinates: {
          latitude: event.location.latitude,
          longitude: event.location.longitude
        },
        details: `Magnitude: ${event.magnitude}, Depth: ${event.depth}km, Distance: ${event.distance}km`,
        isActive: true
      });
      
      await newAlert.save();
      
      // Create notification entry
      const newNotification = new Notification({
        notificationId: Math.random().toString(36).substr(2, 6).toUpperCase(),
        alertId: newAlert._id,
        hazardId: newAlert.hazardId,
        hazardModel: 'Earthquake',
        type: 'Earthquake',
        severity: newAlert.severity,
        location: newAlert.location,
        magnitude: event.magnitude,
        impactRadius: event.magnitude * 10, // Simple calculation based on magnitude
        sentAt: new Date(),
        status: 'Sent',
        message: `Earthquake alert: Magnitude ${event.magnitude} earthquake detected ${event.distance}km from your location`,
        // Recipients would be determined based on your app's logic
        recipients: [user._id] // Since this is in the context of a specific user
      });
      
      await newNotification.save();
    }
    
    return {
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude
      },
      events: relevantEvents
    };
  } catch (error) {
    // console.error('Error getting user earthquake data:', error.message);
    return { events: [] };
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Schedule regular updates of earthquake data
 */
function scheduleEarthquakeDataUpdates() {
  // Fetch earthquake data once a day
  cron.schedule('0 0 * * *', async () => {
    try {
      // console.log('Running scheduled earthquake data update');
      await fetchEarthquakeData();
    } catch (error) {
      // console.error('Error in scheduled earthquake data update:', error);
    }
  });
}


  initialize()
    .then(() => console.log('Earthquake service ready'))
    .catch(error => console.error('Failed to initialize earthquake service:', error));


// Export functions
module.exports = {
  initialize,
  fetchEarthquakeData,
  getUserEarthquakeData,
  getStoredEarthquakeEvents
};