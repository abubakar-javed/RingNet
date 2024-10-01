const Earthquake = require('../models/earthquakeModel');

// Controller function to get all earthquakes
const getAllEarthquakes = async (req, res) => {
  try {
    // Fetch all earthquake data from the database
    const earthquakes = await Earthquake.find();
    res.status(200).json(earthquakes);  // Return the data in JSON format
  } catch (error) {
    console.error("Error fetching earthquakes:", error);
    res.status(500).json({ message: "Server error. Could not retrieve earthquakes." });
  }
};

module.exports = { getAllEarthquakes };
