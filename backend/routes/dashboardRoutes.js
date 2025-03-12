const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/userModel');
const Flood = require('../models/floodModel');
const Tsunami = require('../models/tsunamiModel');
const Earthquake = require('../models/earthquakeModel');
const Weather = require('../models/weatherModel');
const mongoose = require('mongoose');

// Constants for distance calculations
const MAX_EARTHQUAKE_DISTANCE_KM = 300; // Consider earthquakes within 300km
const MAX_TSUNAMI_DISTANCE_KM = 200; // Consider tsunamis within 200km
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

// Get dashboard stats for the authenticated user
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data with location
    const user = await User.findById(userId);
    if (!user || !user.location) {
      return res.status(400).json({ message: 'User location not found' });
    }
    
    const userLocation = user.location;
    
    // Initialize stats object
    const stats = {
      earthquakes: 0,
      tsunamis: 0,
      floods: 0,
      heatwaves: 0
    };
    console.log("----Stats------");
    // 1. Get earthquake stats
    const earthquakeCollection = await Earthquake.findOne({
      'metadata.type': 'earthquake_collection'
    }).sort({ 'metadata.timestamp': -1 });
    
    if (earthquakeCollection && earthquakeCollection.metadata && earthquakeCollection.metadata.events) {
      // Count earthquakes near user location
      const nearbyEarthquakes = earthquakeCollection.metadata.events.filter(event => {
        if (!event.location) return false;
        
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          event.location.latitude, event.location.longitude
        );
        
        return distance <= MAX_EARTHQUAKE_DISTANCE_KM;
      });
      
      stats.earthquakes = nearbyEarthquakes.length;
    }
    console.log("earthquake collection",earthquakeCollection);
    // 2. Get tsunami stats
    const tsunamiCollection = await Tsunami.findOne({
      'metadata.type': 'tsunami_collection'
    }).sort({ 'metadata.timestamp': -1 });
    
    if (tsunamiCollection && tsunamiCollection.metadata && tsunamiCollection.metadata.events) {
      // Count tsunamis near user location
      const nearbyTsunamis = tsunamiCollection.metadata.events.filter(event => {
        if (!event.location) return false;
        
        const distance = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          event.location.latitude, event.location.longitude
        );
        
        return distance <= MAX_TSUNAMI_DISTANCE_KM;
      });
      
      stats.tsunamis = nearbyTsunamis.length;
    }
    console.log("tsunami collection",tsunamiCollection);
    // 3. Get flood stats - corrected implementation
    // First find the user's flood cluster
    const userFloodCluster = await Flood.findOne({
      'metadata.userIds': userId,
      'metadata.type': 'flood'
    }).sort({ date: -1 });
    
    if (userFloodCluster && userFloodCluster.metadata && userFloodCluster.metadata.clusterId) {
      const clusterId = userFloodCluster.metadata.clusterId;
      
      // Get the latest flood data for this cluster
      const latestFloodData = await Flood.findOne({
        'metadata.clusterId': clusterId,
        'metadata.type': 'flood'
      }).sort({ date: -1 });
      
      if (latestFloodData && latestFloodData.metadata) {
        // First check if there's alert info in the metadata
        if (latestFloodData.metadata.alertInfo) {
          // Check if the alert info is recent (less than 24 hours old)
          const alertLastUpdated = new Date(latestFloodData.metadata.alertInfo.lastUpdated);
          const now = new Date();
          const isAlertRecent = alertLastUpdated && 
                              (now.getTime() - alertLastUpdated.getTime() < 24 * 60 * 60 * 1000);
          
          // If we have recent alert info and hasAlert is true, use the alert count from there
          if (isAlertRecent && latestFloodData.metadata.alertInfo.hasAlert) {
            stats.floods = latestFloodData.metadata.alertInfo.alertDays.length;
            console.log(`Found ${stats.floods} flood alerts in alert info for user ${userId}`);
          } 
          // If we have recent alert info but hasAlert is false, set floods to 0
          else if (isAlertRecent && !latestFloodData.metadata.alertInfo.hasAlert) {
            stats.floods = 0;
            console.log(`No flood alerts in alert info for user ${userId}`);
          }
          // If alert info is outdated, fall back to calculating from daily data
          else {
            console.log(`Alert info is outdated for user ${userId}, calculating from daily data`);
            calculateFromDailyData();
          }
        } 
        // If no alert info, fall back to calculating from daily data
        else {
          console.log(`No alert info found for user ${userId}, calculating from daily data`);
          calculateFromDailyData();
        }
        
        // Helper function to calculate alerts from daily data
        function calculateFromDailyData() {
          // Check if there's a high discharge prediction in the daily data
          if (latestFloodData.metadata.dailyData && 
              latestFloodData.metadata.dailyData.riverDischarge && 
              latestFloodData.metadata.dailyData.time) {
            
            const avgDischarge = latestFloodData.metadata.averageDischarge || 0;
            const alertThreshold = avgDischarge * 1.5; // Same threshold used in flood service
            
            // Count days with discharge above threshold (potential floods)
            let alertCount = 0;
            const now = new Date();
            
            for (let i = 0; i < latestFloodData.metadata.dailyData.time.length; i++) {
              const forecastDate = new Date(latestFloodData.metadata.dailyData.time[i]);
              const discharge = latestFloodData.metadata.dailyData.riverDischarge[i];
              
              // Only consider future dates
              if (forecastDate > now && discharge > alertThreshold) {
                alertCount++;
              }
            }
            
            stats.floods = alertCount;
          }
          
          // If no alerts found through daily data, check for explicit alerts
          if (stats.floods === 0) {
            // Check for explicit flood alerts for this user and cluster
            const checkExplicitAlerts = async () => {
              const floodAlerts = await Flood.countDocuments({
                'metadata.userId': userId,
                'metadata.clusterId': clusterId,
                'metadata.type': 'FLOOD',
                'metadata.status': { $ne: 'EXPIRED' },
                date: { $gte: now }
              });
              
              stats.floods = floodAlerts;
            };
            
            checkExplicitAlerts().catch(err => {
              console.error(`Error checking explicit flood alerts: ${err.message}`);
            });
          }
        }
      }
    }
    console.log("user flood cluster", userFloodCluster);
    console.log("flood alerts count:", stats.floods);
    // 4. Get heatwave stats
    const userWeather = await Weather.findOne({
      'metadata.userIds': userId
    }).sort({ timestamp: -1 });

    if (userWeather) {
      console.log("user weather", userWeather);
      
      // Check if there's a heatwave alert flag
      if (userWeather.metadata && userWeather.metadata.heatwaveAlert) {
        stats.heatwaves = 1;
        console.log("Heatwave alert flag is set to true");
      } 
      // If no flag, check current temperature
      else if (userWeather.temperature > 35) {
        stats.heatwaves = 1;
        console.log("Heatwave alert: Current temperature is above 35°C");
      } 
      // If still no alert, check forecast days
      else if (userWeather.metadata && userWeather.metadata.forecast) {
        const heatwaveDays = userWeather.metadata.forecast.filter(day => 
          day.temperature > 35
        ).length;
        
        if (heatwaveDays > 0) {
          stats.heatwaves = heatwaveDays;
          console.log(`Heatwave alert: ${heatwaveDays} days with temperature above 35°C in forecast`);
        }
      }
    }
    console.log("stats",stats);
    res.json({
      stats,
      location: userLocation
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;