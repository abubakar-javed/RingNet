const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  alertId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Alert' 
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
  magnitude: { 
    type: Number 
  },
  impactRadius: { 
    type: Number, 
    default: 0 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['Sent', 'Delivered', 'Read'], 
    default: 'Sent' 
  },
  message: { 
    type: String 
  },
  recipients: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
