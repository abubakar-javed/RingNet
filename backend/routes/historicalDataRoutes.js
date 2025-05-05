const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getHistoricalData,
  getNearbyEvents,
  getHistoricalStats,
  addHistoricalData,
  bulkImportHistoricalData
} = require('../controllers/historicalDataController');

// Skip authentication for development mode only
const skipAuth = process.env.NODE_ENV === 'development' ? (req, res, next) => next() : auth;

// GET /api/historical - Get historical data with filters
router.get('/', skipAuth, getHistoricalData);

// GET /api/historical/nearby - Get historical data near a location
router.get('/nearby', skipAuth, getNearbyEvents);

// GET /api/historical/stats - Get statistics about historical data
router.get('/stats', skipAuth, getHistoricalStats);

// POST /api/historical - Add a new historical data entry (always require auth)
router.post('/', auth, addHistoricalData);

// POST /api/historical/bulk - Bulk import historical data (always require auth)
router.post('/bulk', auth, bulkImportHistoricalData);

module.exports = router; 