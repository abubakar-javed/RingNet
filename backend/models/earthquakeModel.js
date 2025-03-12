const mongoose = require('mongoose');

// Earthquake schema
const earthquakeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    default: 'USGS Earthquake API'
  },
  description: {
    type: String,
    default: 'Earthquake data collection'
  },
  metadata: {
    timestamp: {
      type: Date,
      default: Date.now
    },
    eventCount: {
      type: Number,
      required: true
    },
    minMagnitude: {
      type: Number,
      default: 2.5
    },
    timeRange: {
      start: Date,
      end: Date
    },
    type: {
      type: String,
      enum: ['earthquake_collection'],
      default: 'earthquake_collection'
    },
    events: [{
      eventId: String,
      title: String,
      place: String,
      time: Date,
      updated: Date,
      magnitude: Number,
      magnitudeType: String,
      depth: Number,
      tsunami: Number,
      alert: String,
      status: String,
      location: {
        latitude: Number,
        longitude: Number,
        depth: Number
      },
      url: String,
      felt: Number,
      cdi: Number,
      mmi: Number,
      significance: Number
    }]
  }
}, { timestamps: true });

const Earthquake = mongoose.model('Earthquake', earthquakeSchema);

module.exports = Earthquake;
