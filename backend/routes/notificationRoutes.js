const express = require('express');
const router = express.Router();
const Notification = require('../models/notificationModel');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');

// Get all notifications for the logged-in user
router.get('/user-notifications', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Find notifications where the user is in the recipients array
    // or notifications that are relevant to the user's location
    const notifications = await Notification.find({
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } } // Notifications with no specific recipients (broadcast)
      ]
    })
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit);
    
    const total = await Notification.countDocuments({
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } }
      ]
    });
    
    res.json({
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update notification status to 'Read'
    notification.status = 'Read';
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if user is allowed to delete this notification
    const userId = req.user._id;
    const canDelete = notification.recipients.length === 0 || 
                     notification.recipients.some(recipient => 
                       recipient.toString() === userId.toString()
                     );
    
    if (!canDelete) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } }
      ],
      status: { $ne: 'Read' }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications by type
router.get('/type/:type', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationType = req.params.type;
    
    // Validate notification type
    const validTypes = ['Earthquake', 'Tsunami', 'Flood', 'Heatwave'];
    if (!validTypes.includes(notificationType)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }
    
    const notifications = await Notification.find({
      $or: [
        { recipients: userId },
        { recipients: { $size: 0 } }
      ],
      type: notificationType
    }).sort({ sentAt: -1 });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
