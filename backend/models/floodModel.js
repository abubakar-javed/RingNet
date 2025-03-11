const mongoose = require('mongoose');
// Flood schema
const floodSchema = new mongoose.Schema({
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      placeName: { type: String, required: true },
    },
    date: { type: Date, required: true },
    waterLevel: { type: Number, required: true }, // Height of floodwaters in meters
    duration: { type: Number, required: true }, // Duration in days
    affectedArea: { type: Number, required: true }, // Affected area in square kilometers
    fatalities: { type: Number, default: 0 },
    injuries: { type: Number, default: 0 },
    damageEstimate: { type: Number, default: 0 },
    source: { type: String, default: 'Open-Meteo Flood API' },
    description: { type: String },
    // Add metadata for cluster-based implementation
    metadata: {
      clusterId: { type: String },
      center: {
        lat: { type: Number },
        lon: { type: Number }
      },
      timestamp: { type: Date },
      timeRange: {
        start: { type: String },
        end: { type: String }
      },
      averageDischarge: { type: Number },
      maxDischarge: { type: Number },
      maxDischargeDate: { type: String },
      dailyData: {
        time: [String],
        riverDischarge: [Number],
        riverDischargeMax: [Number],
        riverDischargeMin: [Number]
      },
      userIds: [String],
      userCount: { type: Number, default: 1 },
      type: { type: String, default: 'flood' }
    }
  });
  
  const Flood = mongoose.model('Flood', floodSchema);
  
  module.exports = Flood;
  