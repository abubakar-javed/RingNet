const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  notificationId: { type: String, required: true, unique: true },
  hazardId: { type: mongoose.Schema.Types.ObjectId, required: true },
  hazardModel: { type: String, required: true, enum: ['Earthquake', 'Flood', 'Heatwave'] },
  magnitude: { type: Number },
  impactRadius: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Sent', 'Delivered', 'Read'], default: 'Sent' },
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
