#!/usr/bin/env node

/**
 * Script to fetch historical data for the past 5 years
 * Usage: node scripts/fetchHistoricalData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { fetchHistoricalDataForYearRange } = require('../services/historicalDataService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://ajavedbese21seecs:abubakar1243@cluster0.xjdvgvy.mongodb.net/ringNet';

// Default to last 5 years if not specified
const currentYear = new Date().getFullYear();
const startYear = process.argv[2] ? parseInt(process.argv[2]) : currentYear - 5;
const endYear = process.argv[3] ? parseInt(process.argv[3]) : currentYear;

async function run() {
  try {
    // Connect to the MongoDB database
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Fetch historical data for the specified year range
    console.log(`Fetching historical data for years ${startYear} to ${endYear}...`);
    
    const result = await fetchHistoricalDataForYearRange(startYear, endYear);
    
    if (result) {
      console.log(`Successfully fetched historical data for years ${startYear} to ${endYear}`);
    } else {
      console.error(`Failed to fetch historical data for years ${startYear} to ${endYear}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
run()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  }); 