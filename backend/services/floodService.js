const axios = require('axios');
const Flood = require('../models/floodModel');
const User = require('../models/userModel');
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config();

// Open-Meteo Flood API base URL
const METEO_FLOOD_API_BASE_URL = 'https://flood-api.open-meteo.com/v1/flood';

// Configuration for clustering
const MAX_CLUSTER_RADIUS_KM = 25; // Maximum radius for a cluster in kilometers
const EARTH_RADIUS_KM = 6371; // Earth radius in kilometers

/**
 * Initialize flood service
 */
async function initialize() {
  try {
    // Don't try to connect to DB, just check the connection state
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready, skipping initialization');
      return false;
    }
    
    // Schedule regular updates
    scheduleFloodDataUpdates();
    
    console.log('Flood service initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing flood service:', error);
    return false;
  }
}

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
 * Generate a cluster ID based on coordinates
 */
function generateClusterId(lat, lon) {
  // Round to 2 decimal places for stability
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  return `flood_cluster_${roundedLat}_${roundedLon}`;
}

/**
 * Fetch flood data for all clusters in the database
 */
async function fetchFloodDataForClusters() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return;
    }
    
    // Get all unique cluster IDs from flood data
    const clusterData = await Flood.aggregate([
      { $match: { 'metadata.clusterId': { $exists: true } } },
      { $group: { _id: '$metadata.clusterId', center: { $first: '$metadata.center' } } }
    ]);
    
    if (!clusterData || clusterData.length === 0) {
      console.log('No flood clusters found in database, skipping flood data fetch');
      return;
    }
    
    console.log(`Fetching flood data for ${clusterData.length} clusters from database...`);
    
    // Prepare location parameters for the API
    const latitudes = clusterData.map(cluster => cluster.center.lat).join(',');
    const longitudes = clusterData.map(cluster => cluster.center.lon).join(',');
    
    // Make API request for all clusters in a single call
    const response = await axios.get(METEO_FLOOD_API_BASE_URL, {
      params: {
        latitude: latitudes,
        longitude: longitudes,
        daily: 'river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min',
        forecast_days: 7,
        past_days: 7,
        timeformat: 'iso8601'
      }
    });
    
    console.log('Successfully fetched data from Open-Meteo Flood API');
    
    // Process and store data for each cluster
    for (let i = 0; i < clusterData.length; i++) {
      const apiData = response.data[i];
      const cluster = clusterData[i];
      
      if (!apiData) {
        console.log(`No data returned for cluster ${cluster._id}`);
        continue;
      }
      
      console.log(`Processing data for cluster ${cluster._id}`);
      
      // Store cluster flood data
      await storeClusterFloodData(cluster._id, cluster.center, apiData);
      
      // Generate alerts for users in this cluster if needed
      await processClusterAlerts(cluster._id, apiData);
    }
    
    return clusterData.length;
  } catch (error) {
    console.error('Error fetching flood data for clusters:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

/**
 * Store flood data for a cluster
 */
async function storeClusterFloodData(clusterId, center, apiData) {
  try {
    const dailyData = apiData.daily;
    
    // Skip if no river discharge data
    if (!dailyData || !dailyData.river_discharge || dailyData.river_discharge.length === 0) {
      console.log(`No river discharge data for cluster ${clusterId}`);
      return;
    }
    
    // Calculate average discharge and other metrics
    const avgDischarge = dailyData.river_discharge.reduce((sum, val) => sum + val, 0) / dailyData.river_discharge.length;
    
    // Find maximum discharge and its date
    let maxDischarge = 0;
    let maxDischargeDate = '';
    for (let j = 0; j < dailyData.river_discharge.length; j++) {
      if (dailyData.river_discharge[j] > maxDischarge) {
        maxDischarge = dailyData.river_discharge[j];
        maxDischargeDate = dailyData.time[j];
      }
    }
    
    // Get the user count for this cluster
    const usersInCluster = await getUserCountInCluster(clusterId);
    
    // Store the flood data for this cluster
    const floodData = new Flood({
      location: {
        latitude: apiData.latitude,
        longitude: apiData.longitude,
        placeName: `Cluster ${clusterId}`
      },
      date: new Date(),
      waterLevel: avgDischarge / 100, // Approximate conversion
      duration: 1, // Default 1 day
      affectedArea: calculateAffectedArea(maxDischarge), // Estimate affected area
      source: 'Open-Meteo Flood API',
      description: `Cluster data for ${usersInCluster} users`,
      metadata: {
        clusterId: clusterId,
        center: center || { lat: apiData.latitude, lon: apiData.longitude },
        timestamp: new Date(),
        timeRange: {
          start: dailyData.time[0],
          end: dailyData.time[dailyData.time.length - 1]
        },
        averageDischarge: avgDischarge,
        maxDischarge: maxDischarge,
        maxDischargeDate: maxDischargeDate,
        dailyData: {
          time: dailyData.time,
          riverDischarge: dailyData.river_discharge,
          riverDischargeMax: dailyData.river_discharge_max || [],
          riverDischargeMin: dailyData.river_discharge_min || []
        },
        userCount: usersInCluster,
        type: 'flood'
      }
    });
    
    await floodData.save();
    console.log(`Stored flood data for cluster ${clusterId}`);
    
  } catch (error) {
    console.error(`Error storing cluster flood data for ${clusterId}:`, error.message);
  }
}

/**
 * Calculate approximate affected area based on discharge
 */
function calculateAffectedArea(discharge) {
  // Simple model: affected area in square km increases with discharge
  if (discharge < 1000) return 0;
  if (discharge < 2000) return discharge / 100;
  if (discharge < 5000) return discharge / 50;
  return discharge / 25;
}

/**
 * Get the number of users in a specific cluster
 */
async function getUserCountInCluster(clusterId) {
  try {
    // Get the most recent record for this cluster
    const latestData = await Flood.findOne(
      { 'metadata.clusterId': clusterId },
      { 'metadata.userCount': 1 }
    ).sort({ date: -1 });
    
    return latestData && latestData.metadata ? (latestData.metadata.userCount || 1) : 1;
  } catch (error) {
    console.error(`Error getting user count for cluster ${clusterId}:`, error.message);
    return 1; // Default to 1 if error
  }
}

/**
 * Process and generate alerts for a cluster
 */
async function processClusterAlerts(clusterId, apiData) {
  try {
    const dailyData = apiData.daily;
    
    // Skip if no river discharge data
    if (!dailyData || !dailyData.river_discharge || dailyData.river_discharge.length === 0) {
      return;
    }
    
    // Calculate thresholds for alerts
    const avgDischarge = dailyData.river_discharge.reduce((sum, val) => sum + val, 0) / dailyData.river_discharge.length;
    const alertThreshold = avgDischarge * 1.5;
    
    // Find days with high discharge (potential floods)
    const alertDays = [];
    for (let i = 0; i < dailyData.time.length; i++) {
      // Only consider forecast days (not past data)
      if (new Date(dailyData.time[i]) > new Date()) {
        const discharge = dailyData.river_discharge[i];
        if (discharge > alertThreshold) {
          alertDays.push({
            date: dailyData.time[i],
            discharge,
            severity: getSeverity(discharge, avgDischarge)
          });
        }
      }
    }
    
    // If no alert days, skip
    if (alertDays.length === 0) {
      return;
    }
    
    console.log(`Found ${alertDays.length} potential flood alert days for cluster ${clusterId}`);
    
    // Get users in this cluster
    const userIds = await getUsersInCluster(clusterId);
    
    // Create alerts for users in this cluster
    for (const userId of userIds) {
      for (const day of alertDays) {
        // Create an alert in the database for each user and each alert day
        const alert = new Flood({
          location: {
            latitude: apiData.latitude,
            longitude: apiData.longitude,
            placeName: `Near ${apiData.latitude.toFixed(2)}, ${apiData.longitude.toFixed(2)}`
          },
          date: new Date(day.date),
          waterLevel: day.discharge / 100,
          duration: 1,
          affectedArea: calculateAffectedArea(day.discharge),
          source: 'Flood Monitoring System',
          description: `High river discharge of ${day.discharge.toFixed(1)} m³/s expected on ${day.date}`,
          metadata: {
            discharge: day.discharge,
            avgDischarge: avgDischarge,
            clusterId: clusterId,
            severity: day.severity,
            title: `Potential Flood Alert - ${day.severity}`,
            message: `High river discharge of ${day.discharge.toFixed(1)} m³/s expected on ${day.date}`,
            userId: userId,
            type: 'FLOOD'
          }
        });
        
        await alert.save();
        console.log(`Created flood alert for user ${userId} for ${day.date}`);
      }
    }
    
  } catch (error) {
    console.error(`Error processing cluster alerts for ${clusterId}:`, error.message);
  }
}

/**
 * Get all user IDs associated with a cluster
 */
async function getUsersInCluster(clusterId) {
  try {
    // Get the most recent record for this cluster
    const latestData = await Flood.findOne(
      { 'metadata.clusterId': clusterId },
      { 'metadata.userIds': 1 }
    ).sort({ date: -1 });
    
    return latestData && latestData.metadata && latestData.metadata.userIds 
      ? latestData.metadata.userIds 
      : [];
  } catch (error) {
    console.error(`Error getting users for cluster ${clusterId}:`, error.message);
    return [];
  }
}

/**
 * Get numeric rank for severity to compare alert severities
 */
function getSeverityRank(severity) {
  switch (severity.toLowerCase()) {
    case 'severe': return 4;
    case 'high': return 3;
    case 'moderate': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

/**
 * Determine alert severity based on discharge
 */
function getSeverity(discharge, avgDischarge) {
  if (discharge > avgDischarge * 3) return 'Severe';
  if (discharge > avgDischarge * 2) return 'High';
  if (discharge > avgDischarge * 1.5) return 'Moderate';
  return 'Low';
}

/**
 * Get the appropriate cluster for a user's location
 * Either finds an existing cluster or creates a new one
 */
async function getClusterForUser(userId) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return null;
    }
    
    // Get user's location
    const user = await User.findById(userId);
    if (!user || !user.location) {
      throw new Error('User or user location not found');
    }
    
    // First check if this user is already assigned to a cluster
    const userClusters = await Flood.find(
      { 'metadata.userIds': userId, 'metadata.type': 'flood' },
      { 'metadata.clusterId': 1 }
    ).sort({ date: -1 }).limit(1);
    
    if (userClusters && userClusters.length > 0) {
      const clusterId = userClusters[0].metadata.clusterId;
      console.log(`User ${userId} is already in flood cluster ${clusterId}`);
      
      // Get the latest flood data for this cluster
      const floodData = await getLatestFloodDataForCluster(clusterId);
      
      return {
        clusterId,
        floodData
      };
    }
    
    // If not already in a cluster, check if their location fits in any existing cluster
    // Get all clusters from the database
    const allClusters = await Flood.aggregate([
      { $match: { 'metadata.type': 'flood', 'metadata.clusterId': { $exists: true } } },
      { $sort: { date: -1 } },
      { 
        $group: { 
          _id: '$metadata.clusterId', 
          center: { $first: '$metadata.center' },
          userCount: { $first: '$metadata.userCount' },
          userIds: { $first: '$metadata.userIds' },
          lastUpdated: { $first: '$date' }
        } 
      }
    ]);
    
    for (const cluster of allClusters) {
      const distance = calculateDistance(
        user.location.latitude, user.location.longitude,
        cluster.center.lat, cluster.center.lon
      );
      
      // If within radius, use this cluster
      if (distance <= MAX_CLUSTER_RADIUS_KM) {
        console.log(`Adding user ${userId} to existing flood cluster ${cluster._id}`);
        
        // Get the latest flood data for this cluster
        const floodData = await getLatestFloodDataForCluster(cluster._id);
        
        // Update the cluster to include this user
        if (floodData) {
          // Create a new flood record with the updated user list
          const updatedFloodData = new Flood({
            location: {
              latitude: floodData.location.latitude,
              longitude: floodData.location.longitude,
              placeName: floodData.location.placeName
            },
            date: new Date(),
            waterLevel: floodData.waterLevel,
            duration: floodData.duration,
            affectedArea: floodData.affectedArea,
            source: floodData.source,
            description: floodData.description,
            metadata: {
              ...floodData.metadata,
              userIds: [...(floodData.metadata.userIds || []), userId],
              userCount: (floodData.metadata.userCount || 0) + 1
            }
          });
          
          await updatedFloodData.save();
        }
        
        return {
          clusterId: cluster._id,
          floodData
        };
      }
    }
    
    // If no suitable cluster found, create a new one
    console.log(`Creating new flood cluster for user ${userId}`);
    
    const clusterId = generateClusterId(user.location.latitude, user.location.longitude);
    
    // Fetch data for this new cluster
    const floodData = await createNewClusterData(clusterId, user.location, userId);
    
    return {
      clusterId,
      floodData,
      isNew: true
    };
  } catch (error) {
    console.error('Error getting cluster for user:', error.message);
    throw error;
  }
}

/**
 * Get the latest flood data for a specific cluster
 */
async function getLatestFloodDataForCluster(clusterId) {
  try {
    const floodData = await Flood.findOne({
      'metadata.clusterId': clusterId,
      'metadata.type': 'flood'
    }).sort({ date: -1 });
    
    if (!floodData) {
      console.log(`No flood data found for cluster ${clusterId}`);
      return null;
    }
    
    return floodData;
  } catch (error) {
    console.error(`Error getting latest flood data for cluster ${clusterId}:`, error.message);
    return null;
  }
}

/**
 * Create data for a newly created cluster
 */
async function createNewClusterData(clusterId, location, userId) {
  try {
    console.log(`Fetching initial flood data for new cluster ${clusterId}`);
    
    // Fetch flood data for the new cluster
    const response = await axios.get(METEO_FLOOD_API_BASE_URL, {
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        daily: 'river_discharge,river_discharge_mean,river_discharge_max,river_discharge_min',
        forecast_days: 7,
        past_days: 7,
        timeformat: 'iso8601'
      }
    });
    
    const apiData = response.data;
    const dailyData = apiData.daily;
    
    // Skip if no river discharge data
    if (!dailyData || !dailyData.river_discharge || dailyData.river_discharge.length === 0) {
      console.log(`No river discharge data for new cluster ${clusterId}`);
      return null;
    }
    
    // Calculate average discharge and other metrics
    const avgDischarge = dailyData.river_discharge.reduce((sum, val) => sum + val, 0) / dailyData.river_discharge.length;
    
    // Find maximum discharge and its date
    let maxDischarge = 0;
    let maxDischargeDate = '';
    for (let j = 0; j < dailyData.river_discharge.length; j++) {
      if (dailyData.river_discharge[j] > maxDischarge) {
        maxDischarge = dailyData.river_discharge[j];
        maxDischargeDate = dailyData.time[j];
      }
    }
    
    // Store the flood data for this new cluster
    const floodData = new Flood({
      location: {
        latitude: apiData.latitude,
        longitude: apiData.longitude,
        placeName: `Cluster ${clusterId}`
      },
      date: new Date(),
      waterLevel: avgDischarge / 100, // Approximate conversion
      duration: 1, // Default 1 day
      affectedArea: calculateAffectedArea(maxDischarge), // Estimate affected area
      source: 'Open-Meteo Flood API',
      description: `New cluster for user ${userId}`,
      metadata: {
        clusterId: clusterId,
        center: { lat: location.latitude, lon: location.longitude },
        timestamp: new Date(),
        timeRange: {
          start: dailyData.time[0],
          end: dailyData.time[dailyData.time.length - 1]
        },
        averageDischarge: avgDischarge,
        maxDischarge: maxDischarge,
        maxDischargeDate: maxDischargeDate,
        dailyData: {
          time: dailyData.time,
          riverDischarge: dailyData.river_discharge,
          riverDischargeMax: dailyData.river_discharge_max || [],
          riverDischargeMin: dailyData.river_discharge_min || []
        },
        userIds: [userId],
        userCount: 1,
        type: 'flood'
      }
    });
    
    await floodData.save();
    console.log(`Created new flood cluster ${clusterId} for user ${userId}`);
    
    // Generate and store initial alerts
    await generateAlertsForNewCluster(clusterId, userId, floodData, apiData);
    
    return floodData;
  } catch (error) {
    console.error(`Error creating flood data for new cluster ${clusterId}:`, error.message);
    return null;
  }
}

/**
 * Generate alerts for a newly created cluster
 */
async function generateAlertsForNewCluster(clusterId, userId, floodData, apiData) {
  try {
    const dailyData = apiData.daily;
    
    // Skip if no river discharge data
    if (!dailyData || !dailyData.river_discharge) {
      return;
    }
    
    // Calculate thresholds for alerts
    const avgDischarge = floodData.metadata.averageDischarge;
    const alertThreshold = avgDischarge * 1.5;
    
    // Find days with high discharge (potential floods)
    const alertDays = [];
    for (let i = 0; i < dailyData.time.length; i++) {
      // Only consider forecast days (not past data)
      if (new Date(dailyData.time[i]) > new Date()) {
        const discharge = dailyData.river_discharge[i];
        if (discharge > alertThreshold) {
          alertDays.push({
            date: dailyData.time[i],
            discharge,
            severity: getSeverity(discharge, avgDischarge)
          });
        }
      }
    }
    
    // If no alert days, skip
    if (alertDays.length === 0) {
      return;
    }
    
    console.log(`Found ${alertDays.length} potential flood alert days for new cluster ${clusterId}`);
    
    // Create alerts for the user
    for (const day of alertDays) {
      const alert = new Flood({
        location: {
          latitude: apiData.latitude,
          longitude: apiData.longitude,
          placeName: `Near ${apiData.latitude.toFixed(2)}, ${apiData.longitude.toFixed(2)}`
        },
        date: new Date(day.date),
        waterLevel: day.discharge / 100,
        duration: 1,
        affectedArea: calculateAffectedArea(day.discharge),
        source: 'Flood Monitoring System',
        description: `High river discharge of ${day.discharge.toFixed(1)} m³/s expected on ${day.date}`,
        metadata: {
          discharge: day.discharge,
          avgDischarge: avgDischarge,
          clusterId: clusterId,
          severity: day.severity,
          title: `Potential Flood Alert - ${day.severity}`,
          message: `High river discharge of ${day.discharge.toFixed(1)} m³/s expected on ${day.date}`,
          userId: userId,
          type: 'FLOOD'
        }
      });
      
      await alert.save();
      console.log(`Created flood alert for user ${userId} for ${day.date}`);
    }
  } catch (error) {
    console.error(`Error generating alerts for new cluster ${clusterId}:`, error.message);
  }
}

/**
 * Get flood alerts for a specific user
 */
async function getUserFloodAlerts(userId) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return { alerts: [] };
    }
    
    // First get the appropriate cluster for this user
    const clusterInfo = await getClusterForUser(userId);
    
    if (!clusterInfo) {
      console.log(`No cluster found for user ${userId}`);
      return { alerts: [] };
    }
    
    const clusterId = clusterInfo.clusterId;
    console.log(`Found cluster ${clusterId} for user ${userId}`);
    
    // Get alerts from database
    const userAlerts = await Flood.find({
      'metadata.userId': userId,
      'metadata.type': 'FLOOD',
      'metadata.date': { $gte: new Date() } // Only future alerts
    }).sort({ 'metadata.date': 1 }); // Sort by date ascending
    
    // If we have flood data and no alerts, generate them
    if (clusterInfo.floodData && userAlerts.length === 0) {
      const floodData = clusterInfo.floodData;
      const generatedAlerts = [];
      
      // Calculate base average for reference
      const avgDischarge = floodData.metadata.averageDischarge;
      const dailyData = floodData.metadata.dailyData;
      
      // Generate alerts for high discharge days
      for (let i = 0; i < dailyData.time.length; i++) {
        const date = new Date(dailyData.time[i]);
        
        // Only consider future dates
        if (date > new Date()) {
          const discharge = dailyData.riverDischarge[i];
          
          // If discharge is significantly high, create an alert
          if (discharge > avgDischarge * 1.5) {
            const severity = getSeverity(discharge, avgDischarge);
            
            // Create alert object
            const alertObj = {
              date: dailyData.time[i],
              discharge,
              severity,
              message: `High river discharge of ${discharge.toFixed(1)} m³/s expected on ${dailyData.time[i]}`
            };
            
            generatedAlerts.push(alertObj);
            
            // Store this alert in the database for future reference
            const alert = new Flood({
              location: {
                latitude: floodData.location.latitude,
                longitude: floodData.location.longitude,
                placeName: floodData.location.placeName
              },
              date: new Date(dailyData.time[i]),
              waterLevel: discharge / 100,
              duration: 1,
              affectedArea: calculateAffectedArea(discharge),
              source: 'Flood Monitoring System',
              description: alertObj.message,
              metadata: {
                discharge,
                avgDischarge,
                clusterId,
                severity,
                title: `Potential Flood Alert - ${severity}`,
                message: alertObj.message,
                userId,
                type: 'FLOOD'
              }
            });
            
            try {
              await alert.save();
            } catch (err) {
              console.error(`Error saving generated alert:`, err.message);
            }
          }
        }
      }
      
      return {
        location: {
          latitude: floodData.location.latitude,
          longitude: floodData.location.longitude
        },
        clusterId,
        alerts: generatedAlerts
      };
    }
    
    // If we have stored alerts, return those
    return {
      location: clusterInfo.floodData ? {
        latitude: clusterInfo.floodData.location.latitude,
        longitude: clusterInfo.floodData.location.longitude
      } : {
        latitude: 0,
        longitude: 0
      },
      clusterId,
      alerts: userAlerts.map(alert => ({
        date: alert.metadata.date,
        discharge: alert.metadata.discharge,
        severity: alert.metadata.severity,
        message: alert.metadata.message
      }))
    };
  } catch (error) {
    console.error('Error getting user flood alerts:', error.message);
    return { alerts: [] };
  }
}

/**
 * Schedule regular updates of flood data for clusters
 */
function scheduleFloodDataUpdates() {
  // Use mongoose directly without trying to connect
  if (mongoose.connection.readyState !== 1) {
    console.log('Database connection not ready, skipping scheduling');
    return;
  }
  
  // Fetch flood data once a day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled flood data update for clusters');
      
      await fetchFloodDataForClusters();
    } catch (error) {
      console.error('Error in scheduled flood data update:', error);
    }
  });
  
  // Clean up expired alerts
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log('Cleaning up expired flood alerts');
      
      // Mark alerts for past dates as inactive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const result = await Flood.updateMany(
        { 
          type: 'FLOOD', 
          date: { $lt: yesterday } 
        },
        { 
          $set: { 'metadata.status': 'EXPIRED' } 
        }
      );
      
      console.log(`Marked ${result.modifiedCount} expired flood alerts`);
    } catch (error) {
      console.error('Error cleaning up expired alerts:', error);
    }
  });
}

// Initialize service only if DB is connected
if (mongoose.connection.readyState === 1) {
  initialize()
    .then(() => console.log('Flood service ready'))
    .catch(error => console.error('Failed to initialize flood service:', error));
} else {
  console.log('Database not connected, flood service initialization deferred');
}

// Export functions
module.exports = {
  initialize,
  getUserFloodAlerts,
  fetchFloodDataForClusters,
  getClusterForUser
};



