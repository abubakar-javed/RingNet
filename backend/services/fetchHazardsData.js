const Heatwave = require('../models/heatwaveModel');
const cron = require('node-cron');
const Tsunami = require('../models/tsunamiModel');
const axios = require('axios');
const fetchHeatwaveData = async () => {
  try {
    // const response = await axios.get('https://testapi');
    // const heatwaves = response.data;
  } catch (error) {
    console.error('Error fetching heatwave data:', error);
  }
};

cron.schedule('0 0 * * *', () => {
  fetchHeatwaveData();
});

const fetchAndStoreTsunamiData = async () => {
  try {
    const response = await axios.get('https://testapi');
    const tsunamis = response.data.map(item => ({
      location: {
        latitude: item.latitude,
        longitude: item.longitude,
        placeName: item.place
      },
      magnitude: item.magnitude,
      waveHeight: item.wave_height,
      date: new Date(item.time),
      fatalities: item.fatalities || 0,
      injuries: item.injuries || 0,
      damageEstimate: item.damage_estimate || 0
    }));

    await Tsunami.insertMany(tsunamis);
  } catch (error) {
    console.error('Error updating tsunami data:', error);
  }
};

cron.schedule('0 0 * * *', fetchAndStoreTsunamiData);

module.exports = {
  fetchHeatwaveData,fetchAndStoreTsunamiData
};
