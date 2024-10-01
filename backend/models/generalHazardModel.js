const mongoose = require('mongoose');

// General Hazard schema
const hazardSchema = new mongoose.Schema({
    hazardType: { type: String, required: true }, // e.g., "Hurricane", "Volcano", etc.
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      placeName: { type: String, required: true },
    },
    severity: { type: String, required: true }, // e.g., "Severe", "Moderate", "Mild"
    date: { type: Date, required: true },
    fatalities: { type: Number, default: 0 },
    injuries: { type: Number, default: 0 },
    damageEstimate: { type: Number, default: 0 },
  });
  
  const Hazard = mongoose.model('Hazard', hazardSchema);
  
  module.exports = Hazard;
  