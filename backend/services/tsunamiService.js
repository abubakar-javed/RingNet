const axios = require('axios');
const xml2js = require('xml2js');
const Tsunami = require('../models/tsunamiModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const Alert = require('../models/alertModel');
const Notification = require('../models/notificationModel');
require('dotenv').config();

// GDACS API URL for tsunami data
const GDACS_TSUNAMI_API_URL = 'https://www.gdacs.org/xml/rss.xml?eventtype=TS';

// Maximum distance to consider a user affected by a tsunami (in kilometers)
const MAX_TSUNAMI_IMPACT_DISTANCE_KM = 200; // Coastal areas within this distance
const EARTH_RADIUS_KM = 6371; // Earth radius in kilometers

// Time threshold for refreshing tsunami data (in milliseconds)
const REFRESH_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = EARTH_RADIUS_KM * c;
  
  return distance;
}

/**
 * Parse XML data from GDACS API
 */
async function parseGdacsXmlData(xmlData) {
  try {
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlData);
    return result;
  } catch (error) {
    // console.error('Error parsing GDACS XML data:', error);
    throw error;
  }
}

/**
 * Check if tsunami data needs to be refreshed
 */
async function shouldRefreshTsunamiData() {
  try {
    // Find the most recent tsunami data entry
    const latestEntry = await Tsunami.findOne({ 
      'metadata.type': 'tsunami_collection' 
    }).sort({ 'metadata.timestamp': -1 });
    
    if (!latestEntry) {
      // console.log('No tsunami data found in database, refresh needed');
      return true;
    }
    
    const lastUpdateTime = new Date(latestEntry.metadata.timestamp).getTime();
    const currentTime = Date.now();
    
    // Check if more than 24 hours have passed
    if (currentTime - lastUpdateTime > REFRESH_THRESHOLD_MS) {
      // console.log('Tsunami data is older than 24 hours, refresh needed');
      return true;
    }
    
    // console.log('Using existing tsunami data from database (less than 24 hours old)');
    return false;
  } catch (error) {
    // console.error('Error checking tsunami data refresh status:', error);
    return true; // Refresh on error to be safe
  }
}

/**
 * Fetch tsunami data from GDACS API and store in database
 */
async function fetchTsunamiData() {
  try {
    // Check if we need to refresh the data
    const needsRefresh = await shouldRefreshTsunamiData();
    
    if (!needsRefresh) {
      // Return the existing data from database
      return await getStoredTsunamiEvents();
    }
    
    // console.log('Fetching tsunami data from GDACS API...');
    
    // Make API request
    const response = await axios.get(GDACS_TSUNAMI_API_URL);
    
    // Parse XML data
    const parsedData = await parseGdacsXmlData(response.data);
    
    if (!parsedData || !parsedData.rss || !parsedData.rss.channel || !parsedData.rss.channel.item) {
      // console.log('No tsunami data found in GDACS API response');
      return [];
    }
    
    // Extract items (tsunami events)
    const items = Array.isArray(parsedData.rss.channel.item) 
      ? parsedData.rss.channel.item 
      : [parsedData.rss.channel.item];
    
    // console.log(`Found ${items.length} events from GDACS API`);
    // Filter for tsunami events only
    const tsunamiEvents = items.filter(item => 
      item.title && item.title.toLowerCase().includes('tsunami')
    );
    
    // console.log(`Found ${tsunamiEvents.length} tsunami events from GDACS API`);
    
    // Process tsunami events
    const processedEvents = [];
    
    for (const item of tsunamiEvents) {
      // Extract event details
      const eventId = item.guid && item.guid._ ? item.guid._ : `tsunami_${Date.now()}`;
      const title = item.title;
      const description = item.description;
      const pubDate = new Date(item.pubDate);
      
      // Extract coordinates from georss:point
      let latitude = 0;
      let longitude = 0;
      
      if (item['georss:point']) {
        const coords = item['georss:point'].split(' ');
        if (coords.length === 2) {
          latitude = parseFloat(coords[0]);
          longitude = parseFloat(coords[1]);
        }
      }
      
      // Extract alert level
      let alertLevel = 'UNKNOWN';
      if (item['gdacs:alertlevel']) {
        alertLevel = item['gdacs:alertlevel'].toUpperCase();
      }
      
      // Map alert level to severity
      let severity = 'Low';
      if (alertLevel === 'RED') severity = 'Severe';
      else if (alertLevel === 'ORANGE') severity = 'High';
      else if (alertLevel === 'GREEN') severity = 'Moderate';
      
      // Extract magnitude if available
      let magnitude = 0;
      if (item['gdacs:severity'] && item['gdacs:severity'].value) {
        magnitude = parseFloat(item['gdacs:severity'].value);
      }
      
      // Create tsunami event object
      const tsunamiEvent = {
        eventId,
        title,
        description,
        pubDate,
        location: {
          latitude,
          longitude
        },
        alertLevel,
        severity,
        magnitude,
        source: 'GDACS',
        link: item.link || ''
      };
      
      // Add after the severity and magnitude are determined
      if (alertLevel !== 'UNKNOWN') {
        // Create alert entry
        const newAlert = new Alert({
          type: 'Tsunami',
          severity: alertLevel === 'RED' ? 'error' : alertLevel === 'ORANGE' ? 'warning' : 'info',
          location: item.title || 'Ocean region',
          timestamp: new Date(item.pubDate || Date.now()),
          hazardId: new mongoose.Types.ObjectId(), // Or use a specific ID if available
          hazardModel: 'Tsunami',
          coordinates: {
            latitude: latitude,
            longitude: longitude
          },
          details: `Magnitude: ${magnitude}, Alert Level: ${alertLevel}`,
          isActive: true
        });
        
        await newAlert.save();
        
        // Create notification entry
        const newNotification = new Notification({
          notificationId: Math.random().toString(36).substr(2, 6).toUpperCase(),
          alertId: newAlert._id,
          hazardId: newAlert.hazardId,
          hazardModel: 'Tsunami',
          type: 'Tsunami',
          severity: newAlert.severity,
          location: newAlert.location,
          magnitude: magnitude,
          impactRadius: 100, // Default or calculate based on magnitude
          sentAt: new Date(),
          status: 'Sent',
          message: `Tsunami alert: ${severity} risk tsunami detected near ${newAlert.location}`,
          // Recipients would be determined based on your app's logic
          // recipients: [...affected users...]
        });
        
        await newNotification.save();
      }
      
      processedEvents.push(tsunamiEvent);
    }
    
    // Store all events as a single collection entry
    await storeTsunamiCollection(processedEvents);
    
    return processedEvents;
  } catch (error) {
    // console.error('Error fetching tsunami data:', error.message);
    if (error.response) {
      // console.error('Response status:', error.response.status);
    }
    
    // Try to return existing data if available
    return await getStoredTsunamiEvents();
  }
}

/**
 * Store all tsunami events as a single collection entry
 */
async function storeTsunamiCollection(events) {
  try {
    // Create a new tsunami collection record
    const tsunamiCollection = new Tsunami({
      location: {
        latitude: 0, // Not applicable for collection
        longitude: 0,
        placeName: 'Global Tsunami Collection'
      },
      date: new Date(),
      waterLevel: 0, // Not applicable for collection
      duration: 24, // 24 hours validity
      affectedArea: 0, // Not applicable for collection
      source: 'GDACS Tsunami API',
      description: `Collection of ${events.length} tsunami events`,
      metadata: {
        timestamp: new Date(),
        eventCount: events.length,
        events: events,
        type: 'tsunami_collection'
      }
    });
    
    await tsunamiCollection.save();
    // console.log(`Stored collection of ${events.length} tsunami events in database`);
    
    return tsunamiCollection;
  } catch (error) {
    // console.error('Error storing tsunami collection:', error.message);
    return null;
  }
}

/**
 * Get stored tsunami events from database
 */
async function getStoredTsunamiEvents() {
  try {
    // Find the most recent tsunami collection
    const latestCollection = await Tsunami.findOne({ 
      'metadata.type': 'tsunami_collection' 
    }).sort({ 'metadata.timestamp': -1 });
    
    if (!latestCollection || !latestCollection.metadata || !latestCollection.metadata.events) {
      // console.log('No tsunami events found in database');
      return [];
    }
    
    return latestCollection.metadata.events;
  } catch (error) {
    // console.error('Error getting stored tsunami events:', error.message);
    return [];
  }
}

/**
 * Get tsunami alerts for a specific user
 */
async function getUserTsunamiAlerts(userId) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      // console.log('Database connection not ready');
      return { alerts: [] };
    }
    
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.location) {
      // console.log(`User ${userId} not found or has no location data`);
      return { alerts: [] };
    }
    
    // Get all tsunami events (either from API or database)
    const tsunamiEvents = await fetchTsunamiData();
    
    if (!tsunamiEvents || tsunamiEvents.length === 0) {
      // console.log('No tsunami events available');
      return { alerts: [] };
    }
    
    // console.log(`Checking ${tsunamiEvents.length} tsunami events for user ${userId}`);
    
    // Filter events that are relevant to the user's location
    const relevantAlerts = [];
    
    for (const event of tsunamiEvents) {
      // Skip events with invalid coordinates
      if (!event.location || !event.location.latitude || !event.location.longitude) {
        continue;
      }
      
      // Calculate distance between user and tsunami event
      const distance = calculateDistance(
        user.location.latitude, user.location.longitude,
        event.location.latitude, event.location.longitude
      );
      
      // If user is within impact distance, create alert
      if (distance <= MAX_TSUNAMI_IMPACT_DISTANCE_KM) {
        // console.log(`User ${userId} is within impact distance (${distance.toFixed(1)} km) of tsunami event ${event.eventId}`);
        
        // Create alert object
        const alert = {
          title: `Tsunami Alert - ${event.severity}`,
          date: event.pubDate,
          message: `A ${event.severity.toLowerCase()} tsunami alert has been issued near your area. ${event.title}`,
          severity: event.severity,
          distance: distance,
          link: event.link
        };
        
        relevantAlerts.push(alert);
      }
    }
    
    // Sort alerts by severity and distance
    relevantAlerts.sort((a, b) => {
      // First sort by severity (Severe > High > Moderate > Low)
      const severityOrder = { 'Severe': 0, 'High': 1, 'Moderate': 2, 'Low': 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      // Then sort by distance (closest first)
      return a.distance - b.distance;
    });
    
    return {
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude
      },
      alerts: relevantAlerts
    };
  } catch (error) {
    // console.error('Error getting user tsunami alerts:', error.message);
    return { alerts: [] };
  }
}
// Export functions
module.exports = {
  fetchTsunamiData,
  getUserTsunamiAlerts
};