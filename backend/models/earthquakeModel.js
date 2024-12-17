const mongoose = require('mongoose');

// Earthquake schema
const earthquakeSchema = new mongoose.Schema({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placeName: { type: String, required: true }, // e.g., city, country
  },
  magnitude: { type: Number, required: true }, // Richter scale magnitude
  depth: { type: Number, required: true }, // Depth of the earthquake in km
  date: { type: Date, required: true },
  fatalities: { type: Number, default: 0 },
  injuries: { type: Number, default: 0 },
  damageEstimate: { type: Number, default: 0 }, 
});

const Earthquake = mongoose.model('Earthquake', earthquakeSchema);

module.exports = Earthquake;
