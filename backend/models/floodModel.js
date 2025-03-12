const mongoose = require('mongoose');

const floodSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  },
  waterLevel: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 1
  },
  affectedArea: {
    type: Number,
    default: 0
  },
  source: {
    type: String,
    default: 'Open-Meteo Flood API'
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    clusterId: String,
    center: {
      lat: Number,
      lon: Number
    },
    timestamp: Date,
    timeRange: {
      start: String,
      end: String
    },
    averageDischarge: Number,
    maxDischarge: Number,
    maxDischargeDate: String,
    dailyData: {
      time: [String],
      riverDischarge: [Number],
      riverDischargeMax: [Number],
      riverDischargeMin: [Number]
    },
    userIds: [String],
    userCount: {
      type: Number,
      default: 1
    },
    type: {
      type: String,
      enum: ['flood', 'FLOOD'],
      default: 'flood'
    },
    alertInfo: {
      hasAlert: {
        type: Boolean,
        default: false
      },
      alertDays: [{
        date: String,
        discharge: Number,
        severity: {
          type: String,
          enum: ['None', 'Low', 'Moderate', 'High', 'Severe'],
          default: 'None'
        }
      }],
      alertThreshold: Number,
      avgDischarge: Number,
      lastUpdated: Date,
      highestSeverity: {
        type: String,
        enum: ['None', 'Low', 'Moderate', 'High', 'Severe'],
        default: 'None'
      }
    },
    // Fields for user-specific alerts
    userId: String,
    discharge: Number,
    severity: String,
    title: String,
    message: String,
    isReference: Boolean,
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED'],
      default: 'ACTIVE'
    }
  }
}, { timestamps: true });

// Add indexes for better query performance
floodSchema.index({ 'metadata.clusterId': 1 });
floodSchema.index({ 'metadata.userId': 1 });
floodSchema.index({ 'metadata.type': 1 });
floodSchema.index({ date: -1 });

const Flood = mongoose.model('Flood', floodSchema);

module.exports = Flood;
  