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
  });
  
  const Flood = mongoose.model('Flood', floodSchema);
  
  module.exports = Flood;
  