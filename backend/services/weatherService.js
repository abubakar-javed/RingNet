const axios = require('axios');
const WeatherData = require('../models/weatherModel');
const User = require('../models/userModel');
const cron = require('node-cron');
const mongoose = require('mongoose');
const Alert = require('../models/alertModel');
const Notification = require('../models/notificationModel');
require('dotenv').config(); 

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'eed41bad5cf0d45290152944586af33c';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajavedbese21seecs:abubakar1243@cluster0.xjdvgvy.mongodb.net/ringNet';

const CLUSTER_RADIUS = 10;

// Convert degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate distance between two points using Haversine formula
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Add this function to generate stable cluster IDs
function generateClusterId(lat, lon) {
  // Round to 2 decimal places for stability
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  return `cluster_${roundedLat}_${roundedLon}`;
}

// Modify the clusterLocations function to include cluster IDs
function clusterLocations(locations) {
  const clusters = [];
  const used = new Set();

  for (let i = 0; i < locations.length; i++) {
    if (used.has(i)) continue;
    
    const cluster = {
      points: [locations[i]],
      center: { lat: locations[i].latitude, lon: locations[i].longitude }
    };
    used.add(i);

    // Find all points within CLUSTER_RADIUS of this point
    for (let j = i + 1; j < locations.length; j++) {
      if (used.has(j)) continue;
      
      const distance = getDistanceInKm(
        locations[i].latitude, 
        locations[i].longitude,
        locations[j].latitude, 
        locations[j].longitude
      );

      if (distance <= CLUSTER_RADIUS) {
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

async function fetchAndStoreWeatherData() {
  try {
    // Ensure DB connection before proceeding
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready, skipping initialization');
      return false;
    }

    // First, delete all existing weather data
    console.log('Deleting all previous weather data...');
    await WeatherData.deleteMany({});
    console.log('Previous weather data deleted successfully');

    // Get all user locations from database
    const users = await User.find({}, 'location _id'); 
    
    if (!users || users.length === 0) {
      console.log('No users found in the database');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    
    // Map users with their IDs
    const userLocationsWithIds = users.map(user => ({
      latitude: user.location.latitude,
      longitude: user.location.longitude,
      userId: user._id.toString()
    }));
    
    // Cluster the locations
    const clusters = clusterLocations(userLocationsWithIds);
    console.log(`Created ${clusters.length} fresh clusters`);
    
    // Fetch weather data for each cluster center
    for (const cluster of clusters) {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          lat: cluster.center.lat,
          lon: cluster.center.lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      const placeName = `Cluster of ${cluster.points.length} users near ${response.data.name}`;

      // Extract user IDs from the cluster points
      const userIds = cluster.points.map(point => point.userId);

      // Add this after fetching current weather
      const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
        params: {
          lat: cluster.center.lat,
          lon: cluster.center.lon,
          appid: OPENWEATHER_API_KEY,
          units: 'metric'
        }
      });

      // Process forecast data
      const forecastDays = [];
      const processedDates = new Set();

      // OpenWeatherMap forecast returns data in 3-hour intervals
      for (const item of forecastResponse.data.list) {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        
        if (!processedDates.has(date)) {
          processedDates.add(date);
          forecastDays.push({
            date: date,
            temperature: item.main.temp,
            description: item.weather[0].description,
            isHeatwave: item.main.temp > 35 // Flag for temperatures above 35°C
          });
        } else {
          // Update max temperature if this reading is higher
          const existingDay = forecastDays.find(day => day.date === date);
          if (existingDay && item.main.temp > existingDay.temperature) {
            existingDay.temperature = item.main.temp;
            existingDay.description = item.weather[0].description;
            existingDay.isHeatwave = item.main.temp > 35;
          }
        }
      }

      // Then include this forecast data in the WeatherData model
      const weatherData = new WeatherData({
        clusterId: cluster.id,
        location: {
          latitude: cluster.center.lat,
          longitude: cluster.center.lon,
          placeName: placeName
        },
        userCount: cluster.points.length,
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        alerts: [],
        timestamp: new Date(),
        // Add forecast data and user IDs
        metadata: {
          forecast: forecastDays,
          heatwaveAlert: forecastDays.some(day => day.isHeatwave) || response.data.main.temp > 35,
          userIds: userIds // Add the array of user IDs in this cluster
        }
      });

      await weatherData.save();
      
      // Now process alerts for each user in the cluster using the same function we use in the user flow
      // This keeps the alert creation consistent between cron job and user requests
      for (const userId of userIds) {
        await processUserWeatherAlerts(userId, weatherData);
      }
    }
  } catch (error) {
    // console.error('Error fetching weather data:', error);
  } finally {
    // If you're running this as a standalone script (not part of the main app),
    // you might want to close the connection after you're done
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.connection.close();
      // console.log('Database connection closed');
    }
  }
}

// If running directly (not required as a module)
if (require.main === module) {
  fetchAndStoreWeatherData()
    .then(() => {
      if (process.env.NODE_ENV !== 'production') {
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
// For production use
cron.schedule('0 * * * *', fetchAndStoreWeatherData);

// Add these utility functions to query historical data
async function getClusterHistory(clusterId, startDate, endDate) {
  return await WeatherData.find({
    clusterId: clusterId,
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
}

async function getRecentClusterData(clusterId, limit = 24) {
  return await WeatherData.find({ clusterId: clusterId })
    .sort({ timestamp: -1 })
    .limit(limit);
}

// Add these new utility functions

// Function to find which cluster a user belongs to
async function findUserCluster(userLocation, userId) {
  // Get all weather data from last hour to get active clusters
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  const recentClusters = await WeatherData.find({
    timestamp: { $gte: lastHour }
  });

  // Check if user is within CLUSTER_RADIUS of any existing cluster
  for (const cluster of recentClusters) {
    const distance = getDistanceInKm(
      userLocation.latitude,
      userLocation.longitude,
      cluster.location.latitude,
      cluster.location.longitude
    );

    if (distance <= CLUSTER_RADIUS) {
      // Check if this user is already in the cluster
      const userAlreadyInCluster = cluster.metadata && 
                                  cluster.metadata.userIds && 
                                  Array.isArray(cluster.metadata.userIds) &&
                                  cluster.metadata.userIds.includes(userId);
      
      // If user is not already in the cluster, add them
      if (!userAlreadyInCluster) {
        // console.log(`Adding user ${userId} to existing weather cluster ${cluster.clusterId}`);
        
        // Create a new weather data entry with updated userIds array
        const updatedWeatherData = new WeatherData({
          clusterId: cluster.clusterId,
          location: cluster.location,
          userCount: (cluster.userCount || 1) + 1,
          temperature: cluster.temperature,
          feelsLike: cluster.feelsLike,
          humidity: cluster.humidity,
          windSpeed: cluster.windSpeed,
          description: cluster.description,
          alerts: cluster.alerts,
          timestamp: new Date(),
          metadata: {
            ...cluster.metadata,
            userIds: Array.isArray(cluster.metadata.userIds) 
              ? [...cluster.metadata.userIds, userId] 
              : [userId]
          }
        });
        
        await updatedWeatherData.save();
        return updatedWeatherData;
      }
      
      return cluster;
    }
  }

  return null; // User doesn't belong to any existing cluster
}

// Function to create a new cluster for a single user and get its weather
async function createNewClusterForUser(userLocation, userId) {
  try {
    // Fetch current weather data
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    // Fetch forecast data
    const forecastResponse = await axios.get(`https://api.openweathermap.org/data/2.5/forecast`, {
      params: {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

    // Process forecast data
    const forecastDays = [];
    const processedDates = new Set();

    // OpenWeatherMap forecast returns data in 3-hour intervals
    // We'll take the max temperature for each day
    for (const item of forecastResponse.data.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!processedDates.has(date)) {
        processedDates.add(date);
        forecastDays.push({
          date: date,
          temperature: item.main.temp,
          description: item.weather[0].description,
          isHeatwave: item.main.temp > 35 
        });
      } else {
        // Update max temperature if this reading is higher
        const existingDay = forecastDays.find(day => day.date === date);
        if (existingDay && item.main.temp > existingDay.temperature) {
          existingDay.temperature = item.main.temp;
          existingDay.description = item.weather[0].description;
          existingDay.isHeatwave = item.main.temp > 35;
        }
      }
    }

    const clusterId = generateClusterId(userLocation.latitude, userLocation.longitude);
    
    const weatherData = new WeatherData({
      clusterId,
      location: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        placeName: `Individual user near ${response.data.name}`
      },
      userCount: 1,
      temperature: response.data.main.temp,
      feelsLike: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      description: response.data.weather[0].description,
      alerts: [],
      timestamp: new Date(),
      // Change from userId to userIds array
      metadata: {
        forecast: forecastDays,
        heatwaveAlert: forecastDays.some(day => day.isHeatwave) || response.data.main.temp > 35,
        userIds: [userId] // Store as an array instead of a single value
      }
    });

    await weatherData.save();
    // console.log(`Created new weather data for user ${userId} with forecast data`);
    return weatherData;
  } catch (error) {
    // console.error('Error creating new cluster:', error);
    throw error;
  }
}

// Main function to get weather data for a user
async function getUserWeather(userId, updatedLocation = null) {
  try {
    // Get user's location from DB
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // If location is provided from frontend, update it
    if (updatedLocation) {
      user.location = updatedLocation;
      await user.save();
    }
    
    // Ensure we have a location to work with
    if (!user.location) {
      throw new Error('User location not found');
    }

    // Check existing clusters based on proximity to current location
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentClusters = await WeatherData.find({
      timestamp: { $gte: oneHourAgo }
    });
    
    // Look for a cluster that includes this location
    let weatherData = null;
    
    for (const cluster of recentClusters) {
      const distance = getDistanceInKm(
        user.location.latitude,
        user.location.longitude,
        cluster.location.latitude,
        cluster.location.longitude
      );
      
      // If user is within cluster radius and data is recent
      if (distance <= CLUSTER_RADIUS) {
        // Check if user is already in this cluster
        const userInCluster = cluster.metadata && 
                             cluster.metadata.userIds && 
                             Array.isArray(cluster.metadata.userIds) &&
                             cluster.metadata.userIds.includes(userId);
        
        // If user isn't in cluster yet, add them
        if (!userInCluster) {
          // console.log(`Adding user ${userId} to existing weather cluster ${cluster.clusterId}`);
          
          // Create updated record with user added to cluster
          const updatedWeatherData = new WeatherData({
            clusterId: cluster.clusterId,
            location: cluster.location,
            userCount: (cluster.userCount || 1) + 1,
            temperature: cluster.temperature,
            feelsLike: cluster.feelsLike,
            humidity: cluster.humidity,
            windSpeed: cluster.windSpeed,
            description: cluster.description,
            alerts: cluster.alerts,
            timestamp: new Date(),
            metadata: {
              ...cluster.metadata,
              userIds: Array.isArray(cluster.metadata.userIds) 
                ? [...cluster.metadata.userIds, userId] 
                : [userId]
            }
          });
          
          await updatedWeatherData.save();
          weatherData = updatedWeatherData;
          break;
        }
        
        weatherData = cluster;
        break;
      }
    }
    
    // If no suitable cluster found, create a new one for this user
    if (!weatherData) {
      weatherData = await createNewClusterForUser(user.location, userId);
    }
    
    // Process user-specific weather alerts
    await processUserWeatherAlerts(userId, weatherData);
    
    return weatherData;
    
  } catch (error) {
    console.error('Error getting user weather:', error);
    throw error;
  }
}

// New helper function to process user-specific weather alerts
async function processUserWeatherAlerts(userId, weatherData) {
  try {
    if (!weatherData || !weatherData.metadata) {
      return;
    }
    
    // Check for heatwave conditions
    const isHeatwave = weatherData.metadata.heatwaveAlert === true || weatherData.temperature > 35;
    
    if (isHeatwave) {
      // Get user details
      const user = await User.findById(userId);
      if (!user) {
        console.log(`User ${userId} not found, cannot process weather alerts`);
        return;
      }
      
      // Check if there's already a recent alert (within last 3 hours) for this user
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recentAlert = await Alert.findOne({
        type: 'Heatwave',
        hazardModel: 'Heatwave',
        'coordinates.latitude': { $gte: weatherData.location.latitude - 0.01, $lte: weatherData.location.latitude + 0.01 },
        'coordinates.longitude': { $gte: weatherData.location.longitude - 0.01, $lte: weatherData.location.longitude + 0.01 },
        timestamp: { $gte: threeHoursAgo },
        // We need to also check if there's a notification linked to this alert for this specific user
      });
      
      if (recentAlert) {
        // Check if there's a notification for this alert that includes this user
        const notification = await Notification.findOne({
          alertId: recentAlert._id,
          recipients: userId
        });
        
        if (notification) {
          console.log(`Skipping heatwave alert for user ${userId} - already notified within last 3 hours`);
          return;
        }
      }
      
      // Create user-specific alert entry
      const newAlert = new Alert({
        type: 'Heatwave',
        severity: weatherData.temperature > 40 ? 'error' : 
                 weatherData.temperature > 37 ? 'warning' : 'info',
        location: weatherData.location.placeName || `${weatherData.location.latitude}, ${weatherData.location.longitude}`,
        timestamp: new Date(),
        hazardId: new mongoose.Types.ObjectId(),
        hazardModel: 'Heatwave',
        coordinates: {
          latitude: weatherData.location.latitude,
          longitude: weatherData.location.longitude
        },
        details: `Temperature exceeds 35°C in upcoming days near your location`,
        isActive: true
      });
      
      await newAlert.save();
      
      // Create user-specific notification entry
      const newNotification = new Notification({
        notificationId: Math.random().toString(36).substr(2, 6).toUpperCase(),
        alertId: newAlert._id,
        hazardId: newAlert.hazardId,
        hazardModel: 'Heatwave',
        type: 'Heatwave',
        severity: newAlert.severity,
        location: newAlert.location,
        sentAt: new Date(),
        status: 'Sent',
        message: `Temperature exceeds 35°C in upcoming days near your location`,
        recipients: [userId] // Add the specific user
      });
      
      await newNotification.save();
      console.log(`Created user-specific heatwave alert and notification for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error processing weather alerts for user ${userId}:`, error);
  }
}

// Update exports
module.exports = {
  fetchAndStoreWeatherData,
  getClusterHistory,
  getRecentClusterData,
  getUserWeather
}; 