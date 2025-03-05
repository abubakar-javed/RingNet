const axios = require('axios');
const WeatherData = require('../models/weatherModel');
const User = require('../models/userModel');
const cron = require('node-cron');
const mongoose = require('mongoose');
require('dotenv').config(); 

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'eed41bad5cf0d45290152944586af33c';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajavedbese21seecs:abubakar1243@cluster0.xjdvgvy.mongodb.net/ringNet';

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    console.log("weather key",process.env.OPENWEATHER_API_KEY);
    console.log('Attempting to connect to MongoDB...');
    console.log('Using connection string:', process.env.MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Reduce the timeout to 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    
    // More specific error handling
    if (error.code === 'ECONNREFUSED') {
      console.error('Make sure MongoDB is running on your machine');
    }
    
    process.exit(1);
  }
};

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
      await connectDB();
    }

    // Get all user locations from database
    const users = await User.find({}, 'location');
    
    if (!users || users.length === 0) {
      console.log('No users found in the database');
      return;
    }
    
    console.log(`Found ${users.length} users`);
    const userLocations = users.map(user => user.location);
    
    // Cluster the locations
    const clusters = clusterLocations(userLocations);
    console.log(`Created ${clusters.length} clusters`);
    
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

      const weatherData = new WeatherData({
        clusterId: cluster.id, // Add cluster ID
        location: {
          latitude: cluster.center.lat,
          longitude: cluster.center.lon,
          placeName: placeName
        },
        userCount: cluster.points.length, // Add number of users in cluster
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        description: response.data.weather[0].description,
        alerts: [],
        timestamp: new Date() // Explicit timestamp
      });

      await weatherData.save();
      console.log(`Weather data stored for ${placeName} (Cluster ID: ${cluster.id})`);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
  } finally {
    // If you're running this as a standalone script (not part of the main app),
    // you might want to close the connection after you're done
    if (process.env.NODE_ENV !== 'production') {
      await mongoose.connection.close();
      console.log('Database connection closed');
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
async function findUserCluster(userLocation) {
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
      return cluster;
    }
  }

  return null; // User doesn't belong to any existing cluster
}

// Function to create a new cluster for a single user and get its weather
async function createNewClusterForUser(userLocation) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: {
        lat: userLocation.latitude,
        lon: userLocation.longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric'
      }
    });

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
      timestamp: new Date()
    });

    await weatherData.save();
    return weatherData;
  } catch (error) {
    console.error('Error creating new cluster:', error);
    throw error;
  }
}

// Main function to get weather data for a user
async function getUserWeather(userId) {
  try {
    // Get user's location
    const user = await User.findById(userId);
    if (!user || !user.location) {
      throw new Error('User location not found');
    }

    // Try to find an existing cluster for the user
    const existingCluster = await findUserCluster(user.location);
    
    if (existingCluster) {
      // Return the existing cluster's weather data
      return existingCluster;
    } else {
      // Create a new cluster for the user
      return await createNewClusterForUser(user.location);
    }
  } catch (error) {
    console.error('Error getting user weather:', error);
    throw error;
  }
}

// Update exports
module.exports = {
  fetchAndStoreWeatherData,
  getClusterHistory,
  getRecentClusterData,
  getUserWeather
}; 