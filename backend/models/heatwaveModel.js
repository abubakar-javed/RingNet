const mongoose = require('mongoose');

// Heatwave schema
const heatwaveSchema = new mongoose.Schema({
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      placeName: { type: String, required: true },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    peakTemperature: { type: Number, required: true }, // Maximum temperature in Celsius
    averageTemperature: { type: Number, required: true }, // Average temperature during the heatwave
    fatalities: { type: Number, default: 0 },
    injuries: { type: Number, default: 0 },
  });
  
  const Heatwave = mongoose.model('Heatwave', heatwaveSchema);
  
  module.exports = Heatwave;
  