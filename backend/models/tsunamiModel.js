const mongoose = require('mongoose');

// Tsunami schema
const tsunamiSchema = new mongoose.Schema({
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      placeName: { type: String, required: true },
    },
    magnitude: { type: Number, required: true }, // Magnitude of the earthquake that triggered the tsunami
    waveHeight: { type: Number, required: true }, // Wave height in meters
    date: { type: Date, required: true },
    fatalities: { type: Number, default: 0 },
    injuries: { type: Number, default: 0 },
    damageEstimate: { type: Number, default: 0 },
  });
  
  const Tsunami = mongoose.model('Tsunami', tsunamiSchema);
  
  module.exports = Tsunami;
  