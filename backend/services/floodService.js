const axios = require('axios');
const Flood = require('../models/floodModel');
const User = require('../models/userModel');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Alert = require('../models/alertModel');
const Notification = require('../models/notificationModel');
require('dotenv').config();

// Open-Meteo Flood API base URL
const METEO_FLOOD_API_BASE_URL = 'https://flood-api.open-meteo.com/v1/flood';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajavedbese21seecs:abubakar1243@cluster0.xjdvgvy.mongodb.net/ringNet';

/**
 * Initialize flood service
 */
async function initialize() {
  try {
    // Don't try to connect again, just check if already connected
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

// Configuration for clustering
const MAX_CLUSTER_RADIUS_KM = 25; // Maximum radius for a cluster in kilometers
const EARTH_RADIUS_KM = 6371; // Earth radius in kilometers

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
 * Fetch flood data for all users by creating fresh clusters
 */
async function fetchFloodDataForClusters() {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return;
    }
    
    // First, delete all existing flood data
    console.log('Deleting all previous flood data...');
    await Flood.deleteMany({ 'metadata.type': 'flood' });
    console.log('Previous flood data deleted successfully');
    
    // Get all user locations from database
    const users = await User.find({}, 'location _id');
    
    if (!users || users.length === 0) {
      console.log('No users found in the database');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Map users with their IDs
    const userLocationsWithIds = users.filter(user => user.location).map(user => ({
      latitude: user.location.latitude,
      longitude: user.location.longitude,
      userId: user._id.toString()
    }));
    
    // Cluster the locations using the same clustering logic as in weather service
    const clusters = clusterLocations(userLocationsWithIds);
    console.log(`Created ${clusters.length} fresh flood clusters`);
    
    // Fetch flood data for each cluster center
    for (const cluster of clusters) {
      // Fetch flood data for the cluster center
      const response = await axios.get(METEO_FLOOD_API_BASE_URL, {
        params: {
          latitude: cluster.center.lat,
          longitude: cluster.center.lon,
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
        console.log(`No river discharge data for cluster ${cluster.id}`);
        continue;
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
      
      // Calculate alert threshold and find potential alert days
      const alertThreshold = avgDischarge * 1.5;
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
      
      // Determine if there's an alert
      const hasAlert = alertDays.length > 0;
      
      // Create alert info object
      const alertInfo = {
        hasAlert,
        alertDays,
        alertThreshold,
        avgDischarge,
        lastUpdated: new Date(),
        highestSeverity: hasAlert ? alertDays.reduce((highest, day) => {
          const currentRank = getSeverityRank(day.severity);
          const highestRank = getSeverityRank(highest);
          return currentRank > highestRank ? day.severity : highest;
        }, 'Low') : 'None'
      };
      
      // Extract user IDs from the cluster points
      const userIds = cluster.points.map(point => point.userId);
      
      // Store the flood data for this cluster
      const floodData = new Flood({
        location: {
          latitude: cluster.center.lat,
          longitude: cluster.center.lon,
          placeName: `Cluster ${cluster.id}`
        },
        date: new Date(),
        waterLevel: avgDischarge / 100, // Approximate conversion
        duration: 1, // Default 1 day
        affectedArea: calculateAffectedArea(maxDischarge), // Estimate affected area
        source: 'Open-Meteo Flood API',
        description: hasAlert 
          ? `Cluster with ${alertDays.length} potential flood alerts` 
          : `Cluster with no flood alerts`,
        metadata: {
          clusterId: cluster.id,
          center: { lat: cluster.center.lat, lon: cluster.center.lon },
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
          userIds: userIds,
          userCount: userIds.length,
          type: 'flood',
          alertInfo: alertInfo
        }
      });
      
      await floodData.save();
      console.log(`Stored flood data for cluster ${cluster.id} with ${userIds.length} users`);
      
      // Process alerts for each user in the cluster
      if (hasAlert) {
        for (const userId of userIds) {
          await processUserFloodAlerts(userId, floodData);
        }
      }
    }
    
    return clusters.length;
  } catch (error) {
    console.error('Error fetching flood data for clusters:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Add the clusterLocations function if it doesn't exist yet
function clusterLocations(locations) {
  const clusters = [];
  const used = new Set();
  const MAX_CLUSTER_RADIUS_KM = 25; // Use the same radius as defined at the top

  for (let i = 0; i < locations.length; i++) {
    if (used.has(i)) continue;
    
    const cluster = {
      points: [locations[i]],
      center: { lat: locations[i].latitude, lon: locations[i].longitude }
    };
    used.add(i);

    // Find all points within MAX_CLUSTER_RADIUS_KM of this point
    for (let j = i + 1; j < locations.length; j++) {
      if (used.has(j)) continue;
      
      const distance = calculateDistance(
        locations[i].latitude, 
        locations[i].longitude,
        locations[j].latitude, 
        locations[j].longitude
      );

      if (distance <= MAX_CLUSTER_RADIUS_KM) {
        cluster.points.push(locations[j]);
        used.add(j);
      }
    }

    // Calculate cluster center (centroid)
    if (cluster.points.length > 1) {
      cluster.center = {
        lat: cluster.points.reduce((sum, p) => sum + p.latitude, 0) / cluster.points.length,
        lon: cluster.points.reduce((sum, p) => sum + p.longitude, 0) / cluster.points.length
      };
    }

    // Add cluster ID
    cluster.id = generateClusterId(cluster.center.lat, cluster.center.lon);
    clusters.push(cluster);
  }

  return clusters;
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
    
    // Get the latest flood data for this cluster
    const latestClusterData = await getLatestFloodDataForCluster(clusterId);
    
    if (!latestClusterData) {
      console.log(`No existing flood data found for cluster ${clusterId}`);
      return;
    }
    
    // Update the existing cluster record with alert information
    const alertInfo = {
      hasAlert: true,
      alertDays: alertDays,
      alertThreshold: alertThreshold,
      avgDischarge: avgDischarge,
      lastUpdated: new Date(),
      highestSeverity: alertDays.reduce((highest, day) => {
        const currentRank = getSeverityRank(day.severity);
        const highestRank = getSeverityRank(highest);
        return currentRank > highestRank ? day.severity : highest;
      }, 'Low')
    };
    
    // Update the cluster record with alert information
    await Flood.findByIdAndUpdate(
      latestClusterData._id,
      {
        $set: {
          'metadata.alertInfo': alertInfo,
          description: `Cluster with ${alertDays.length} potential flood alerts`
        }
      }
    );
    
    console.log(`Updated cluster ${clusterId} with alert information`);
    
    // Process alerts for each user in the cluster
    for (const userId of userIds) {
      await processUserFloodAlerts(userId, {
        location: {
          latitude: apiData.latitude,
          longitude: apiData.longitude,
          placeName: latestClusterData.location.placeName || 'River basin area'
        },
        metadata: {
          alertInfo: alertInfo
        }
      });
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
async function getClusterForUser(userId, updatedLocation = null) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return null;
    }
    
    // Get user's location
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // // If location is provided from frontend, update it
    // // Only check this if the location hasn't changed
    // if (!updatedLocation) {
    //   const userClusters = await Flood.find(
    //     { 'metadata.userIds': userId, 'metadata.type': 'flood' },
    //     { 'metadata.clusterId': 1 }
    //   ).sort({ date: -1 }).limit(1);
      
    //   if (userClusters && userClusters.length > 0) {
    //     const clusterId = userClusters[0].metadata.clusterId;
    //     console.log(`User ${userId} is already in flood cluster ${clusterId}`);
        
    //     // Get the latest flood data for this cluster
    //     const floodData = await getLatestFloodDataForCluster(clusterId);
        
    //     return {
    //       clusterId,
    //       floodData
    //     };
    //   }
    // }
    
    // Check if their location fits in any existing cluster
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
        
        if (floodData) {
          // Update the existing flood record with the new user
      await Flood.findByIdAndUpdate(
        floodData._id,
        {
              $addToSet: { 'metadata.userIds': userId }, // Adds userId only if it doesn't already exist
              $inc: { 'metadata.userCount': 1 },         // Increment the user count by 1
              $set: { date: new Date() }                 // Update the last modified date
            }
          );
          
          console.log(`Updated existing flood cluster ${cluster._id} to include user ${userId}`);
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
    
    // Calculate alert threshold and find potential alert days
    const alertThreshold = avgDischarge * 1.5;
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
    
    // Determine if there's an alert
    const hasAlert = alertDays.length > 0;
    
    // Create alert info object
    const alertInfo = {
      hasAlert,
      alertDays,
      alertThreshold,
      avgDischarge,
      lastUpdated: new Date(),
      highestSeverity: hasAlert ? alertDays.reduce((highest, day) => {
        const currentRank = getSeverityRank(day.severity);
        const highestRank = getSeverityRank(highest);
        return currentRank > highestRank ? day.severity : highest;
      }, 'Low') : 'None'
    };
    
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
      description: hasAlert 
        ? `New cluster for user ${userId} with ${alertDays.length} potential flood alerts` 
        : `New cluster for user ${userId} with no flood alerts`,
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
        type: 'flood',
        alertInfo: alertInfo
      }
    });
    
    await floodData.save();
    console.log(`Created new flood cluster ${clusterId} for user ${userId} (hasAlert: ${hasAlert})`);
    
    return floodData;
  } catch (error) {
    console.error(`Error creating flood data for new cluster ${clusterId}:`, error.message);
    return null;
  }
}


/**
 * Get flood alerts for a specific user
 */
async function getUserFloodAlerts(userId, updatedLocation = null) {
  try {
    // Ensure database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready');
      return { hasAlert: false, alerts: [] };
    }
    console.log('updatedLocation', updatedLocation);
    // First get the appropriate cluster for this user, passing any updated location
    const clusterInfo = await getClusterForUser(userId, updatedLocation);
    
    if (!clusterInfo) {
      console.log(`No cluster found for user ${userId}`);
      return { hasAlert: false, alerts: [] };
    }
    
    const clusterId = clusterInfo.clusterId;
    console.log(`Found cluster ${clusterId} for user ${userId}`);
    
    // Get the latest flood data for this cluster
    const floodData = clusterInfo.floodData;
    
    if (!floodData) {
      console.log(`No flood data found for cluster ${clusterId}`);
      return { hasAlert: false, alerts: [] };
    }
    
    // Check if alert info exists and is less than 24 hours old
    const hasAlertInfo = floodData.metadata && floodData.metadata.alertInfo;
    const alertLastUpdated = hasAlertInfo ? new Date(floodData.metadata.alertInfo.lastUpdated) : null;
    const now = new Date();
    const isAlertRecent = alertLastUpdated && 
                          (now.getTime() - alertLastUpdated.getTime() < 24 * 60 * 60 * 1000);
    
    // If we have recent alert info, use it
    if (hasAlertInfo && isAlertRecent) {
      console.log(`Using existing alert info for cluster ${clusterId} (last updated: ${alertLastUpdated})`);
      
      // Process user-specific alerts if hazardous conditions exist
      if (floodData.metadata.alertInfo.hasAlert) {
        await processUserFloodAlerts(userId, floodData);
      }
      
      // Return the alert info from the cluster
      return {
        location: {
          latitude: floodData.location.latitude,
          longitude: floodData.location.longitude
        },
        clusterId,
        hasAlert: floodData.metadata.alertInfo.hasAlert,
        alerts: floodData.metadata.alertInfo.hasAlert ? floodData.metadata.alertInfo.alertDays : []
      };
    }
    
    // If alert info doesn't exist or is outdated, fetch new data from API
    console.log(`Alert info for cluster ${clusterId} is outdated or missing, fetching new data`);
    
    // Fetch new flood data from API
    const response = await axios.get(METEO_FLOOD_API_BASE_URL, {
      params: {
        latitude: floodData.location.latitude,
        longitude: floodData.location.longitude,
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
      console.log(`No river discharge data for cluster ${clusterId}`);
      
      // Update cluster with no alert info
      await Flood.findByIdAndUpdate(
        floodData._id,
        {
          $set: {
            'metadata.alertInfo': {
              hasAlert: false,
              alertDays: [],
              lastUpdated: new Date()
            }
          }
        }
      );
      
      return { 
        location: {
          latitude: floodData.location.latitude,
          longitude: floodData.location.longitude
        },
        clusterId,
        hasAlert: false, 
        alerts: [] 
      };
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
    
    // Determine if there's an alert
    const hasAlert = alertDays.length > 0;
    
    // Update the cluster with new alert info
    const alertInfo = {
      hasAlert,
      alertDays,
      alertThreshold,
      avgDischarge,
      lastUpdated: new Date(),
      highestSeverity: hasAlert ? alertDays.reduce((highest, day) => {
        const currentRank = getSeverityRank(day.severity);
        const highestRank = getSeverityRank(highest);
        return currentRank > highestRank ? day.severity : highest;
      }, 'Low') : 'None'
    };
    
    // Update the cluster record with alert information
    await Flood.findByIdAndUpdate(
      floodData._id,
      {
        $set: {
          'metadata.alertInfo': alertInfo,
          description: hasAlert 
            ? `Cluster with ${alertDays.length} potential flood alerts` 
            : `Cluster with no flood alerts`
        }
      }
    );
    
    console.log(`Updated cluster ${clusterId} with new alert information (hasAlert: ${hasAlert})`);
    
    // After updating the cluster with new alert information
    if (hasAlert) {
      await processUserFloodAlerts(userId, {
        location: {
          latitude: floodData.location.latitude,
          longitude: floodData.location.longitude,
          placeName: floodData.location.placeName || 'River basin area'
        },
        metadata: {
          alertInfo: alertInfo
        }
      });
    }
    
    // Return the updated alert info
    return {
      location: {
        latitude: floodData.location.latitude,
        longitude: floodData.location.longitude
      },
      clusterId,
      hasAlert,
      alerts: alertDays
    };
    
  } catch (error) {
    console.error('Error getting user flood alerts:', error.message);
    return { hasAlert: false, alerts: [] };
  }
}

// New helper function to process user-specific alerts
async function processUserFloodAlerts(userId, floodData) {
  try {
    if (!floodData.metadata || !floodData.metadata.alertInfo || !floodData.metadata.alertInfo.alertDays) {
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User ${userId} not found, cannot process alerts`);
      return;
    }

    const alertDays = floodData.metadata.alertInfo.alertDays;
    const avgDischarge = floodData.metadata.alertInfo.avgDischarge;
    
    // Process only the highest severity alert to avoid multiple notifications
    const highestAlert = alertDays.reduce((highest, current) => {
      const currentRank = getSeverityRank(current.severity);
      const highestRank = highest ? getSeverityRank(highest.severity) : 0;
      return currentRank > highestRank ? current : highest;
    }, null);
    
    if (highestAlert) {
      // Check if there's already a recent alert (within last 3 hours) for this user
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recentAlert = await Alert.findOne({
        type: 'Flood',
        hazardModel: 'Flood',
        'coordinates.latitude': { $gte: floodData.location.latitude - 0.01, $lte: floodData.location.latitude + 0.01 },
        'coordinates.longitude': { $gte: floodData.location.longitude - 0.01, $lte: floodData.location.longitude + 0.01 },
        timestamp: { $gte: threeHoursAgo }
      });
      
      if (recentAlert) {
        // Check if there's a notification for this alert that includes this user
        const notification = await Notification.findOne({
          alertId: recentAlert._id,
          recipients: userId
        });
        
        if (notification) {
          console.log(`Skipping flood alert for user ${userId} - already notified within last 3 hours`);
          return;
        }
      }
      
      // Log the date string for debugging
      console.log(`Alert date string: ${highestAlert.date}`);
      
      // Create a valid date object using the current date
      // The highestAlert.date can be in the future based on forecast
      const alertDate = new Date(highestAlert.date);
      console.log(`Parsed alert date: ${alertDate.toISOString()}`);
      
      // Create user-specific alert entry - use current date for timestamp
      const newAlert = new Alert({
        type: 'Flood',
        severity: getSeverity(highestAlert.discharge, avgDischarge) === 'Severe' ? 'error' : 
                 getSeverity(highestAlert.discharge, avgDischarge) === 'High' ? 'warning' : 'info',
        location: floodData.location.placeName || 'River basin area',
        timestamp: new Date(), // Use current date for timestamp, not the forecast date
        forecastDate: alertDate, // Store the forecast date separately
        hazardId: new mongoose.Types.ObjectId(),
        hazardModel: 'Flood',
        coordinates: {
          latitude: floodData.location.latitude,
          longitude: floodData.location.longitude
        },
        details: `Discharge: ${highestAlert.discharge} m³/s, Average: ${avgDischarge} m³/s`,
        isActive: true
      });
      
      await newAlert.save();
      
      // Create user-specific notification entry
      const newNotification = new Notification({
        notificationId: Math.random().toString(36).substr(2, 6).toUpperCase(),
        alertId: newAlert._id,
        hazardId: newAlert.hazardId,
        hazardModel: 'Flood',
        type: 'Flood',
        severity: newAlert.severity,
        location: newAlert.location,
        impactRadius: 50, // Default or calculate based on discharge
        sentAt: new Date(),
        status: 'Sent',
        message: `Flood alert: ${getSeverity(highestAlert.discharge, avgDischarge)} risk of flooding on ${alertDate.toLocaleDateString()}`,
        recipients: [userId] // Add the specific user
      });
      
      await newNotification.save();
      console.log(`Created user-specific flood alert and notification for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error processing flood alerts for user ${userId}:`, error);
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
      // console.log('Cleaning up expired flood alerts');
      
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



