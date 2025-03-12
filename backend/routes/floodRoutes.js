const express = require('express');
const router = express.Router();
const {
  getAllFloods,
  getFloodById,
  getFloodsByLocation,
  getFloodsForUser,
  createFlood,
  updateFlood,
  deleteFlood,
  updateFloodData,
  getFloodAlerts
} = require('../controllers/floodController');
const authMiddleware = require('../middlewares/auth');

// Public routes
router.get('/', getAllFloods);
router.get('/by-location', getFloodsByLocation);
router.get('/:id', getFloodById);

// Protected routes - require authentication
router.get('/user/floods', authMiddleware, getFloodsForUser);
router.get('/user/alerts', authMiddleware, getFloodAlerts);

// Admin-only routes
router.post('/', authMiddleware, createFlood);
router.put('/:id', authMiddleware, updateFlood);
router.delete('/:id', authMiddleware, deleteFlood);
router.post('/update-data', authMiddleware, updateFloodData);

module.exports = router;
