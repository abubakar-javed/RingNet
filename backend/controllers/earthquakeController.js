const Earthquake = require('../models/earthquakeModel');
const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');
const axios = require('axios');

const predictEarthquakeMagnitude = async (req, res) => {
    const { parameters } = req.body;
    console.log(parameters);
    try {
        const response = await axios.post('https://flask-test-rvu8.onrender.com/predict', {
            parameters
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response.data);
        res.json({
            success: true,
            predictedMagnitude: response.data.magnitude,
            impactArea:`Approx.${response.data.distance} km`
        }); 
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};



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

module.exports = { getAllEarthquakes, predictEarthquakeMagnitude };
