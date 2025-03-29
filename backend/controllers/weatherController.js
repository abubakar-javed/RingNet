const WeatherData = require('../models/weatherModel');
const { getUserWeather } = require('../services/weatherService');

const getCurrentWeather = async (req, res) => {
  try {
    const latestWeatherData = await WeatherData.find()
      .sort({ timestamp: -1 })
      .limit(MONITORED_LOCATIONS.length);
    res.json(latestWeatherData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHistoricalWeather = async (req, res) => {
  const { startDate, endDate, location } = req.query;
  try {
    const query = {};
    if (location) query['location.placeName'] = location;
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const historicalData = await WeatherData.find(query)
      .sort({ timestamp: -1 });
    res.json(historicalData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWeatherForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    // Check if location is provided in request params
    const updatedLocation = req.query.latitude && req.query.longitude ? {
      latitude: parseFloat(req.query.latitude),
      longitude: parseFloat(req.query.longitude)
    } : null;
    
    const weatherData = await getUserWeather(userId, updatedLocation);
    res.json(weatherData);
  } catch (error) {
    console.error('Error in getWeatherForUser:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message 
    });
  }
};

module.exports = {
  getCurrentWeather,
  getHistoricalWeather,
  getWeatherForUser
};