const express = require('express');
const router = express.Router();
const emergencyContactsController = require('../controllers/emergencyContactsController');
const auth = require('../middlewares/auth');

// Get emergency contacts for user based on location
router.get('/', auth, emergencyContactsController.getEmergencyContactsForUser);

module.exports = router; 