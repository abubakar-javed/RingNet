const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['Earthquake', 'Tsunami', 'Flood', 'Heatwave'] 
  },
  severity: { 
    type: String, 
    required: true, 
    enum: ['error', 'warning', 'info'] 
  },
  location: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  hazardId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  hazardModel: { 
    type: String, 
    required: true, 
    enum: ['Earthquake', 'Tsunami', 'Flood', 'Heatwave'] 
  },
  // Additional fields that might be useful
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  details: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Generate a unique alert ID
alertSchema.pre('save', function(next) {
  if (!this.alertId) {
    this.alertId = Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
