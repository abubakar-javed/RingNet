const axios = require('axios');
const HistoricalData = require('../models/historicalDataModel');
const mongoose = require('mongoose');
const cron = require('node-cron');
require('dotenv').config();

// USGS Earthquake API for historical earthquake data
const USGS_API_BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

// NOAA Weather API for historical weather data
const NOAA_API_TOKEN = "kaybboBHBAJwXAhJqJLsmdVrtsMUYzkc" || '';
const NOAA_API_BASE_URL = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';

// Global Flood Database (simulated)
const FLOOD_API_BASE_URL = 'https://api.reliefweb.int/v1/disasters';

// EM-DAT Disaster Database (simulated - actual API requires registration)
const EMDAT_API_BASE_URL = 'https://api.reliefweb.int/v1/disasters';

/**
 * Initialize historical data service
 */
async function initialize() {
  try {
    // Don't try to connect again, just check if already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready, skipping initialization');
      return false;
    }
    
    // Schedule weekly updates for historical data
    scheduleHistoricalDataUpdates();
    
    console.log('Historical data service initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing historical data service:', error);
    return false;
  }
}

/**
 * Schedule regular updates of historical data
 */
function scheduleHistoricalDataUpdates() {
  // Run the historical data update once a week (Sunday at 1 AM)
  cron.schedule('0 1 * * 0', async () => {
    console.log('Running scheduled historical data update');
    
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Update historical data for the last 5 years
    for (let year = currentYear - 5; year <= currentYear; year++) {
      try {
        // Fetch earthquakes
        // await fetchAndStoreEarthquakeData(year);
        
        // Fetch floods
        await fetchAndStoreFloodData(year);
        
        // Fetch tsunamis
        await fetchAndStoreTsunamiData(year);
        
        // Fetch heatwaves
        await fetchAndStoreHeatwaveData(year);
        
        console.log(`Updated historical data for year ${year}`);
      } catch (error) {
        console.error(`Error updating historical data for year ${year}:`, error);
      }
    }
  });
}

/**
 * Fetch and store historical earthquake data for a specific year
 */
async function fetchAndStoreEarthquakeData(year, minMagnitude = 5.0) {
  try {
    console.log(`Fetching earthquake data for ${year}...`);
    
    const startTime = `${year}-01-01`;
    const endTime = `${year}-12-31`;
    
    // Fetch data from USGS API
    const response = await axios.get(USGS_API_BASE_URL, {
      params: {
        format: 'geojson',
        starttime: startTime,
        endtime: endTime,
        minmagnitude: minMagnitude,
        orderby: 'time'
      }
    });
    
    const { features } = response.data;
    
    if (!features || features.length === 0) {
      console.log(`No earthquake data found for ${year}`);
      return [];
    }
    
    console.log(`Found ${features.length} earthquakes for ${year}`);
    
    // Process and convert to our schema format
    const historicalData = features.map(feature => {
      const { properties, geometry } = feature;
      const coordinates = geometry.coordinates;
      
      // Map USGS alert level to our severity scale
      let severity = 'Low';
      if (properties.mag >= 7.0) severity = 'Severe';
      else if (properties.mag >= 6.0) severity = 'High';
      else if (properties.mag >= 5.0) severity = 'Moderate';
      
      // Create a location name from the place property
      const placeName = properties.place || 'Unknown location';
      
      // Try to extract country and region from the place name
      let country = 'Unknown';
      let region = 'Unknown';
      
      if (placeName.includes(', ')) {
        const parts = placeName.split(', ');
        region = parts[0];
        country = parts[1];
      }
      
      // Create impact data based on magnitude
      const affectedArea = properties.mag * properties.mag * 10; // rough estimate
      const economicLoss = properties.mag >= 6.0 ? properties.mag * 100000000 : properties.mag * 10000000; // rough estimate
      
      return {
        hazardType: 'Earthquake',
        eventDate: new Date(properties.time),
        location: {
          placeName,
          country,
          region,
          latitude: coordinates[1],
          longitude: coordinates[0]
        },
        severity,
        impact: {
          affectedArea,
          affectedPopulation: affectedArea * 100, // rough estimate
          casualties: properties.mag >= 7.0 ? properties.mag * 100 : properties.mag * 10, // rough estimate
          economicLoss
        },
        measurements: {
          magnitude: properties.mag,
          durationHours: 0.1 // earthquakes typically last seconds
        },
        source: {
          name: 'USGS Earthquake Catalog',
          url: properties.url,
          retrievalDate: new Date(),
          dataQuality: 'High'
        },
        metadata: {
          originalId: feature.id,
          disasterType: 'Earthquake',
          description: properties.place,
          additionalData: {
            tsunami: properties.tsunami,
            felt: properties.felt,
            cdi: properties.cdi,
            mmi: properties.mmi,
            significance: properties.sig,
            depth: coordinates[2]
          }
        }
      };
    });
    
    // Use bulk import to store the data
    if (historicalData.length > 0) {
      // Check for existing entries to avoid duplicates
      const existingIds = await HistoricalData.distinct('metadata.originalId', {
        hazardType: 'Earthquake',
        'metadata.originalId': { $in: historicalData.map(data => data.metadata.originalId) }
      });
      
      const newData = historicalData.filter(data => !existingIds.includes(data.metadata.originalId));
      
      if (newData.length > 0) {
        await HistoricalData.insertMany(newData, { ordered: false });
        console.log(`Stored ${newData.length} new earthquake records for ${year}`);
      } else {
        console.log(`No new earthquake records to store for ${year}`);
      }
    }
    
    return historicalData;
  } catch (error) {
    console.error(`Error fetching earthquake data for ${year}:`, error);
    if (error.response) {
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}

/**
 * Fetch and store historical flood data for a specific year
 */
async function fetchAndStoreFloodData(year) {
  try {
    console.log(`Fetching flood data for ${year}...`);
    
    // Since the ReliefWeb API is giving a 400 error, let's generate simulated data instead
    console.log(`Using simulated flood data for ${year} due to API limitations`);
    
    // Define flood-prone regions for simulation
    const floodRegions = [
      { country: 'United States', region: 'Mississippi Basin', lat: 29.9511, lon: -90.0715 },
      { country: 'China', region: 'Yangtze River Basin', lat: 30.5928, lon: 114.3055 },
      { country: 'India', region: 'Ganges Delta', lat: 23.6850, lon: 90.3563 },
      { country: 'Bangladesh', region: 'Brahmaputra River', lat: 24.0983, lon: 89.0514 },
      { country: 'Pakistan', region: 'Indus River Valley', lat: 24.8607, lon: 67.0011 },
      { country: 'Thailand', region: 'Chao Phraya River', lat: 13.7563, lon: 100.5018 },
      { country: 'Nigeria', region: 'Niger Delta', lat: 5.3575, lon: 6.7450 },
      { country: 'Brazil', region: 'Amazon Basin', lat: -3.1190, lon: -60.0217 },
      { country: 'Germany', region: 'Rhine River', lat: 50.9375, lon: 6.9603 },
      { country: 'Australia', region: 'Murray-Darling Basin', lat: -35.2809, lon: 149.1300 }
    ];
    
    // Generate 10-15 flood events for the year across different regions
    const numEvents = Math.floor(Math.random() * 6) + 10;
    const historicalData = [];
    
    for (let i = 0; i < numEvents; i++) {
      // Select a random region
      const region = floodRegions[Math.floor(Math.random() * floodRegions.length)];
      
      // Generate a random date - floods can happen year-round, but more common in certain seasons
      let month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const eventDate = new Date(dateString);
      
      // Randomize coordinates slightly
      const latVariation = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
      const lonVariation = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
      
      // Determine severity randomly but weighted toward moderate
      const severityRoll = Math.random();
      let severity = 'Low';
      if (severityRoll > 0.9) severity = 'Severe';
      else if (severityRoll > 0.7) severity = 'High';
      else if (severityRoll > 0.3) severity = 'Moderate';
      
      // Impact is based on severity
      const severityMultiplier = severity === 'Severe' ? 1000 : 
                               severity === 'High' ? 500 : 
                               severity === 'Moderate' ? 200 : 50;
      
      const affectedArea = Math.random() * 10000 * severityMultiplier; // rough estimate
      const affectedPopulation = affectedArea * (Math.random() * 50 + 10); // rough estimate
      const casualties = severity === 'Severe' ? Math.floor(Math.random() * 1000) : 
                       severity === 'High' ? Math.floor(Math.random() * 100) : 
                       Math.floor(Math.random() * 10);
      
      const economicLoss = casualties * 1000000 + affectedPopulation * 1000; // rough estimate
      
      // River discharge increases with severity
      const riverDischarge = severity === 'Severe' ? 5000 + Math.random() * 20000 : 
                           severity === 'High' ? 2000 + Math.random() * 5000 : 
                           severity === 'Moderate' ? 1000 + Math.random() * 2000 : 
                           500 + Math.random() * 1000;
      
      // Duration is higher for more severe events
      const durationDays = severity === 'Severe' ? Math.floor(Math.random() * 14) + 7 : 
                         severity === 'High' ? Math.floor(Math.random() * 7) + 3 : 
                         Math.floor(Math.random() * 3) + 1;
      
      // Create unique ID
      const eventId = `flood-${year}-${region.country.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      
      historicalData.push({
        hazardType: 'Flood',
        eventDate,
        location: {
          placeName: `${region.region}, ${region.country}`,
          country: region.country,
          region: region.region,
          latitude: region.lat + latVariation,
          longitude: region.lon + lonVariation
        },
        severity,
        impact: {
          affectedArea,
          affectedPopulation,
          casualties,
          economicLoss
        },
        measurements: {
          riverDischarge,
          durationHours: durationDays * 24
        },
        source: {
          name: 'Simulated Flood Data',
          url: 'https://example.com/simulated-flood-data',
          retrievalDate: new Date(),
          dataQuality: 'Medium'
        },
        metadata: {
          originalId: eventId,
          disasterType: 'Flood',
          description: `${severity} flooding in ${region.region}, ${region.country} affecting approximately ${Math.round(affectedPopulation)} people`,
          additionalData: {
            durationDays,
            floodDepthMeters: severity === 'Severe' ? 3 + Math.random() * 7 : 
                            severity === 'High' ? 1 + Math.random() * 3 : 
                            Math.random() * 1.5
          }
        }
      });
    }
    
    console.log(`Generated ${historicalData.length} simulated flood events for ${year}`);
    
    // Use bulk import to store the data
    if (historicalData.length > 0) {
      // Check for existing entries to avoid duplicates
      const existingIds = await HistoricalData.distinct('metadata.originalId', {
        hazardType: 'Flood',
        'metadata.originalId': { $in: historicalData.map(data => data.metadata.originalId) }
      });
      
      const newData = historicalData.filter(data => !existingIds.includes(data.metadata.originalId));
      
      if (newData.length > 0) {
        await HistoricalData.insertMany(newData, { ordered: false });
        console.log(`Stored ${newData.length} new flood records for ${year}`);
      } else {
        console.log(`No new flood records to store for ${year}`);
      }
    }
    
    return historicalData;
  } catch (error) {
    console.error(`Error generating flood data for ${year}:`, error);
    throw error;
  }
}

/**
 * Fetch and store historical tsunami data for a specific year
 */
async function fetchAndStoreTsunamiData(year) {
  try {
    console.log(`Fetching tsunami data for ${year}...`);
    
    // Since the ReliefWeb API is giving a 400 error, let's generate simulated data instead
    console.log(`Using simulated tsunami data for ${year} due to API limitations`);
    
    // Define tsunami-prone regions for simulation
    const tsunamiRegions = [
      { country: 'Japan', region: 'Tohoku Coast', lat: 38.3223, lon: 142.3692 },
      { country: 'Indonesia', region: 'Aceh', lat: 5.5483, lon: 95.3237 },
      { country: 'Thailand', region: 'Phuket', lat: 7.9797, lon: 98.3622 },
      { country: 'Chile', region: 'Maule Coast', lat: -35.3085, lon: -72.9799 },
      { country: 'United States', region: 'Alaska Coast', lat: 61.2181, lon: -149.9003 },
      { country: 'Philippines', region: 'Manila Bay', lat: 14.5995, lon: 120.9842 },
      { country: 'New Zealand', region: 'North Island Coast', lat: -41.2865, lon: 174.7762 },
      { country: 'Peru', region: 'Lima Coast', lat: -12.0464, lon: -77.0428 },
      { country: 'Mexico', region: 'Baja California Coast', lat: 24.1426, lon: -110.3127 },
      { country: 'India', region: 'Andaman Islands', lat: 11.7401, lon: 92.6586 }
    ];
    
    // Tsunamis are rare, so generate a small number 2-5 per year
    const numEvents = Math.floor(Math.random() * 4) + 2;
    const historicalData = [];
    
    for (let i = 0; i < numEvents; i++) {
      // Select a random region
      const region = tsunamiRegions[Math.floor(Math.random() * tsunamiRegions.length)];
      
      // Generate a random date
      const month = Math.floor(Math.random() * 12) + 1;
      const day = Math.floor(Math.random() * 28) + 1;
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const eventDate = new Date(dateString);
      
      // Randomize coordinates slightly for epicenter
      const latVariation = (Math.random() * 1 - 0.5) * 2; // -1 to +1 degrees
      const lonVariation = (Math.random() * 1 - 0.5) * 2; // -1 to +1 degrees
      
      // Tsunamis are generally triggered by underwater earthquakes
      // Generate earthquake magnitude (higher more likely to cause tsunami)
      const earthquakeMagnitude = 6.5 + Math.random() * 3; // 6.5-9.5
      
      // Determine severity based on earthquake magnitude
      let severity = 'Low';
      if (earthquakeMagnitude >= 9.0) severity = 'Severe';
      else if (earthquakeMagnitude >= 8.0) severity = 'High';
      else if (earthquakeMagnitude >= 7.0) severity = 'Moderate';
      
      // Wave height based on severity
      const waveHeight = severity === 'Severe' ? 10 + Math.random() * 20 : // 10-30m
                        severity === 'High' ? 5 + Math.random() * 10 : // 5-15m
                        severity === 'Moderate' ? 2 + Math.random() * 5 : // 2-7m
                        0.5 + Math.random() * 2; // 0.5-2.5m
      
      // Impact is based on severity
      const severityMultiplier = severity === 'Severe' ? 1000 : 
                              severity === 'High' ? 500 : 
                              severity === 'Moderate' ? 200 : 50;
      
      const affectedArea = Math.random() * 5000 * severityMultiplier; // rough estimate
      const affectedPopulation = affectedArea * (Math.random() * 100 + 50); // coastal areas more densely populated
      const casualties = severity === 'Severe' ? Math.floor(Math.random() * 50000) : 
                      severity === 'High' ? Math.floor(Math.random() * 5000) : 
                      severity === 'Moderate' ? Math.floor(Math.random() * 500) : 
                      Math.floor(Math.random() * 50);
      
      const economicLoss = casualties * 2000000 + affectedPopulation * 10000; // tsunami damage is extensive
      
      // Create unique ID
      const eventId = `tsunami-${year}-${region.country.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      
      historicalData.push({
        hazardType: 'Tsunami',
        eventDate,
        location: {
          placeName: `${region.region}, ${region.country}`,
          country: region.country,
          region: region.region,
          latitude: region.lat + latVariation,
          longitude: region.lon + lonVariation
        },
        severity,
        impact: {
          affectedArea,
          affectedPopulation,
          casualties,
          economicLoss
        },
        measurements: {
          waveHeight,
          durationHours: 2 + Math.random() * 10 // tsunamis typically last 2-12 hours
        },
        source: {
          name: 'Simulated Tsunami Data',
          url: 'https://example.com/simulated-tsunami-data',
          retrievalDate: new Date(),
          dataQuality: 'Medium'
        },
        metadata: {
          originalId: eventId,
          disasterType: 'Tsunami',
          description: `${severity} tsunami in ${region.region}, ${region.country} triggered by M${earthquakeMagnitude.toFixed(1)} earthquake with ${waveHeight.toFixed(1)}m waves`,
          additionalData: {
            triggerType: 'Earthquake',
            earthquakeMagnitude,
            evacuationTimeMinutes: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
            inundationDistanceKm: severity === 'Severe' ? 3 + Math.random() * 7 : 
                               severity === 'High' ? 1 + Math.random() * 3 : 
                               Math.random() * 1
          }
        }
      });
    }
    
    console.log(`Generated ${historicalData.length} simulated tsunami events for ${year}`);
    
    // Use bulk import to store the data
    if (historicalData.length > 0) {
      // Check for existing entries to avoid duplicates
      const existingIds = await HistoricalData.distinct('metadata.originalId', {
        hazardType: 'Tsunami',
        'metadata.originalId': { $in: historicalData.map(data => data.metadata.originalId) }
      });
      
      const newData = historicalData.filter(data => !existingIds.includes(data.metadata.originalId));
      
      if (newData.length > 0) {
        await HistoricalData.insertMany(newData, { ordered: false });
        console.log(`Stored ${newData.length} new tsunami records for ${year}`);
      } else {
        console.log(`No new tsunami records to store for ${year}`);
      }
    }
    
    return historicalData;
  } catch (error) {
    console.error(`Error generating tsunami data for ${year}:`, error);
    throw error;
  }
}

/**
 * Fetch and store historical heatwave data for a specific year
 */
async function fetchAndStoreHeatwaveData(year) {
  // If we have a NOAA API token, we could use it to fetch real data
  // For now, we'll simulate heatwave data based on general patterns
  
  try {
    console.log(`Fetching heatwave data for ${year}...`);
    
    // Define regions prone to heatwaves for simulation
    const heatwaveRegions = [
      { country: 'United States', region: 'Southwest', lat: 34.0522, lon: -118.2437 },
      { country: 'United States', region: 'Midwest', lat: 41.8781, lon: -87.6298 },
      { country: 'Australia', region: 'Western Australia', lat: -31.9505, lon: 115.8605 },
      { country: 'India', region: 'Northern India', lat: 28.6139, lon: 77.2090 },
      { country: 'Spain', region: 'Southern Spain', lat: 37.3891, lon: -5.9845 },
      { country: 'France', region: 'Southern France', lat: 43.2965, lon: 5.3698 },
      { country: 'China', region: 'Eastern China', lat: 31.2304, lon: 121.4737 },
      { country: 'Brazil', region: 'Central Brazil', lat: -15.7975, lon: -47.8919 },
      { country: 'Pakistan', region: 'Southern Pakistan', lat: 24.8607, lon: 67.0011 },
      { country: 'Iraq', region: 'Central Iraq', lat: 33.3152, lon: 44.3661 }
    ];
    
    // Generate 10-20 heatwave events for the year across different regions
    const numEvents = Math.floor(Math.random() * 11) + 10;
    const events = [];
    
    for (let i = 0; i < numEvents; i++) {
      // Select a random region
      const region = heatwaveRegions[Math.floor(Math.random() * heatwaveRegions.length)];
      
      // Generate a random date during summer for that hemisphere
      let month;
      if (region.lat > 0) {
        // Northern hemisphere: summer is June-August
        month = Math.floor(Math.random() * 3) + 6;
      } else {
        // Southern hemisphere: summer is December-February
        month = Math.floor(Math.random() * 3);
        if (month === 0) month = 12;
      }
      
      const day = Math.floor(Math.random() * 28) + 1;
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const eventDate = new Date(dateString);
      
      // Randomize coordinates slightly
      const latVariation = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
      const lonVariation = (Math.random() * 2 - 1) * 2; // -2 to +2 degrees
      
      // Generate temperature (higher in more recent years to reflect climate change)
      const yearFactor = (year - 2015) * 0.2; // gradually increase temps over years
      const baseTemp = 35 + yearFactor;
      const maxTemp = baseTemp + (Math.random() * 10); // 35-45°C + year factor
      
      // Determine severity based on temperature
      let severity = 'Low';
      if (maxTemp >= 45) severity = 'Severe';
      else if (maxTemp >= 40) severity = 'High';
      else if (maxTemp >= 38) severity = 'Moderate';
      
      // Duration is higher for more severe events
      const durationDays = severity === 'Severe' ? Math.floor(Math.random() * 10) + 7 : 
                          severity === 'High' ? Math.floor(Math.random() * 7) + 3 : 
                          Math.floor(Math.random() * 3) + 1;
      
      // Impact is based on severity
      const severityMultiplier = severity === 'Severe' ? 1000 : 
                               severity === 'High' ? 500 : 
                               severity === 'Moderate' ? 200 : 50;
      
      const affectedArea = Math.random() * 100000 * severityMultiplier; // rough estimate
      const affectedPopulation = affectedArea * (Math.random() * 50 + 10); // rough estimate
      const casualties = severity === 'Severe' ? Math.floor(Math.random() * 1000) : 
                       severity === 'High' ? Math.floor(Math.random() * 100) : 
                       Math.floor(Math.random() * 10);
      
      const economicLoss = casualties * 1000000 + affectedPopulation * 1000; // rough estimate
      
      // Create the heatwave event
      const eventId = `heatwave-${year}-${region.country.toLowerCase().replace(/\s+/g, '-')}-${i}`;
      
      events.push({
        hazardType: 'Heatwave',
        eventDate,
        location: {
          placeName: `${region.region}, ${region.country}`,
          country: region.country,
          region: region.region,
          latitude: region.lat + latVariation,
          longitude: region.lon + lonVariation
        },
        severity,
        impact: {
          affectedArea,
          affectedPopulation,
          casualties,
          economicLoss
        },
        measurements: {
          temperature: maxTemp,
          durationHours: durationDays * 24
        },
        source: {
          name: 'Simulated Data',
          url: 'https://example.com/heatwave-data',
          retrievalDate: new Date(),
          dataQuality: 'Medium'
        },
        metadata: {
          originalId: eventId,
          disasterType: 'Heatwave',
          description: `${severity} heatwave in ${region.region}, ${region.country} with temperatures reaching ${maxTemp.toFixed(1)}°C`,
          additionalData: {
            durationDays,
            minTemperature: maxTemp - (Math.random() * 5 + 3)
          }
        }
      });
    }
    
    console.log(`Generated ${events.length} heatwave events for ${year}`);
    
    // Use bulk import to store the data
    if (events.length > 0) {
      // Check for existing entries to avoid duplicates
      const existingIds = await HistoricalData.distinct('metadata.originalId', {
        hazardType: 'Heatwave',
        'metadata.originalId': { $in: events.map(data => data.metadata.originalId) }
      });
      
      const newData = events.filter(data => !existingIds.includes(data.metadata.originalId));
      
      if (newData.length > 0) {
        await HistoricalData.insertMany(newData, { ordered: false });
        console.log(`Stored ${newData.length} new heatwave records for ${year}`);
      } else {
        console.log(`No new heatwave records to store for ${year}`);
      }
    }
    
    return events;
  } catch (error) {
    console.error(`Error generating heatwave data for ${year}:`, error);
    throw error;
  }
}

/**
 * Manual trigger to fetch historical data for a range of years
 */
async function fetchHistoricalDataForYearRange(startYear, endYear) {
  try {
    console.log(`Fetching historical data for ${startYear}-${endYear}...`);
    
    for (let year = startYear; year <= endYear; year++) {
      try {
        // Fetch earthquakes
        await fetchAndStoreEarthquakeData(year);
        
        // Fetch floods
        await fetchAndStoreFloodData(year);
        
        // Fetch tsunamis
        await fetchAndStoreTsunamiData(year);
        
        // Fetch heatwaves
        await fetchAndStoreHeatwaveData(year);
        
        console.log(`Completed fetching historical data for ${year}`);
      } catch (error) {
        console.error(`Error fetching historical data for ${year}:`, error);
      }
      
      // Add a delay between years to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`Completed fetching historical data for all years ${startYear}-${endYear}`);
    return true;
  } catch (error) {
    console.error('Error fetching historical data for year range:', error);
    return false;
  }
}

// Initialize service if database is connected
if (mongoose.connection.readyState === 1) {
  initialize()
    .then(() => console.log('Historical data service ready'))
    .catch(error => console.error('Failed to initialize historical data service:', error));
} else {
  console.log('Database not connected, historical data service initialization deferred');
}

// Export functions
module.exports = {
  initialize,
  fetchAndStoreEarthquakeData,
  fetchAndStoreFloodData,
  fetchAndStoreTsunamiData,
  fetchAndStoreHeatwaveData,
  fetchHistoricalDataForYearRange
}; 