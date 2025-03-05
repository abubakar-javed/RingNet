const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  clusterId: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placeName: { type: String, required: true },
  },
  userCount: { 
    type: Number, 
    required: true 
  },
  temperature: { type: Number, required: true },
  feelsLike: { type: Number, required: true },
  humidity: { type: Number, required: true },
  windSpeed: { type: Number, required: true },
  description: { type: String, required: true },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true // Add index for faster queries
  },
  alerts: [{
    event: String,
    description: String,
    start: Date,
    end: Date,
    severity: String
  }]
});

// Add compound index for efficient querying by both clusterId and timestamp
weatherDataSchema.index({ clusterId: 1, timestamp: -1 });

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);
module.exports = WeatherData;