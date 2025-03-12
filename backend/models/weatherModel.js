const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  clusterId: {
    type: String,
    required: true,
    index: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    placeName: {
      type: String,
      default: 'Unknown'
    }
  },
  userCount: {
    type: Number,
    default: 1
  },
  temperature: {
    type: Number,
    required: true
  },
  feelsLike: {
    type: Number
  },
  humidity: {
    type: Number
  },
  windSpeed: {
    type: Number
  },
  description: {
    type: String
  },
  alerts: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    forecast: [{
      date: String,
      temperature: Number,
      description: String,
      isHeatwave: Boolean
    }],
    heatwaveAlert: {
      type: Boolean,
      default: false
    },
    userIds: {
      type: [String],
      default: []
    }
  }
}, { timestamps: true });

// Add indexes for better query performance
weatherSchema.index({ 'metadata.userIds': 1 });
weatherSchema.index({ timestamp: -1 });

const WeatherData = mongoose.model('WeatherData', weatherSchema);

module.exports = WeatherData;