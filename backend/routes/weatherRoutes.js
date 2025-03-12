const express = require('express');
const router = express.Router();
const { getCurrentWeather, getHistoricalWeather, getWeatherForUser } = require('../controllers/weatherController');
const authMiddleware = require('../middlewares/auth');

router.get('/current', getCurrentWeather);
router.get('/historical', getHistoricalWeather);
router.get('/user-weather', authMiddleware, getWeatherForUser);

module.exports = router;