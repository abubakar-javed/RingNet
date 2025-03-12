const mongoose = require('mongoose');

// Tsunami schema
const tsunamiSchema = new mongoose.Schema({
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      placeName: { type: String, default: 'Unknown Location' },
    },
    date: { type: Date, required: true },
    waterLevel: { type: Number, default: 0 },
    duration: { type: Number, default: 24 },
    affectedArea: { type: Number, default: 0 },
    source: { type: String, default: 'GDACS Tsunami API' },
    description: { type: String, default: '' },
    metadata: {
      eventId: String,
      title: String,
      alertLevel: String,
      severity: String,
      magnitude: Number,
      link: String,
      userId: mongoose.Schema.Types.ObjectId,
      distance: Number,
      timestamp: Date,
      status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED'],
        default: 'ACTIVE'
      },
      type: {
        type: String,
        enum: ['tsunami', 'TSUNAMI', 'tsunami_collection'],
        required: true
      },
      eventCount: Number,
      events: [{
        eventId: String,
        title: String,
        description: String,
        pubDate: Date,
        location: {
          latitude: Number,
          longitude: Number
        },
        alertLevel: String,
        severity: String,
        magnitude: Number,
        source: String,
        link: String
      }]
    }
}, { timestamps: true });
  
const Tsunami = mongoose.model('Tsunami', tsunamiSchema);
  
module.exports = Tsunami;
  