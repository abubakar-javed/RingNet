const Earthquake = require('../models/earthquakeModel');
const Notification = require('../models/notificationModel');
const { v4: uuidv4 } = require('uuid');
const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');
const axios = require('axios');

const predictEarthquakeMagnitude = async (req, res) => {
    const { parameters } = req.body;
    try {
        const response = await axios.post('https://flask-test-rvu8.onrender.com/predict', {
            parameters
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const earthquake = new Earthquake({
            location: {
                latitude: parameters.latitude || 0,
                longitude: parameters.longitude || 0,
                placeName: parameters.location || 'Unknown Location'
            },
            magnitude: response.data.magnitude,
            depth: parameters.depth || 0,
            date: new Date()
        });
        
        await earthquake.save();

        const notification = new Notification({
            notificationId: uuidv4(),
            hazardId: earthquake._id,
            hazardModel: 'Earthquake',
            magnitude: response.data.magnitude,
            impactRadius: parseFloat(response.data.distance),
            status: 'Sent'
        });

        await notification.save();

        res.json({
            success: true,
            predictedMagnitude: response.data.magnitude,
            impactArea:`Approx.${response.data.distance} km`,
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

const getEarthquakeById = async (req, res) => {
    try {
        const earthquake = await Earthquake.findById(req.params.id);
        if (!earthquake) {
            return res.status(404).json({ message: "Earthquake not found" });
        }
        res.status(200).json(earthquake);
    } catch (error) {
        res.status(500).json({ message: "Error fetching earthquake", error: error.message });
    }
};

const createEarthquake = async (req, res) => {
    try {
        const earthquake = new Earthquake({
            location: {
                latitude: req.body.location.latitude,
                longitude: req.body.location.longitude,
                placeName: req.body.location.placeName,
            },
            magnitude: req.body.magnitude,
            depth: req.body.depth,
            date: req.body.date || new Date(),
            fatalities: req.body.fatalities,
            injuries: req.body.injuries,
            damageEstimate: req.body.damageEstimate,
        });

        const savedEarthquake = await earthquake.save();
        res.status(201).json(savedEarthquake);
    } catch (error) {
        res.status(400).json({ message: "Error creating earthquake", error: error.message });
    }
};

const updateEarthquake = async (req, res) => {
    try {
        const earthquake = await Earthquake.findByIdAndUpdate(
            req.params.id,
            {
                location: {
                    latitude: req.body.location.latitude,
                    longitude: req.body.location.longitude,
                    placeName: req.body.location.placeName,
                },
                magnitude: req.body.magnitude,
                depth: req.body.depth,
                date: req.body.date,
                fatalities: req.body.fatalities,
                injuries: req.body.injuries,
                damageEstimate: req.body.damageEstimate,
            },
            { new: true, runValidators: true }
        );

        if (!earthquake) {
            return res.status(404).json({ message: "Earthquake not found" });
        }

        res.status(200).json(earthquake);
    } catch (error) {
        res.status(400).json({ message: "Error updating earthquake", error: error.message });
    }
};

const deleteEarthquake = async (req, res) => {
    try {
        const earthquake = await Earthquake.findByIdAndDelete(req.params.id);
        
        if (!earthquake) {
            return res.status(404).json({ message: "Earthquake not found" });
        }

        res.status(200).json({ message: "Earthquake deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting earthquake", error: error.message });
    }
};

// Update the exports
module.exports = { 
    getAllEarthquakes, 
    getEarthquakeById,
    createEarthquake,
    updateEarthquake,
    deleteEarthquake,
    predictEarthquakeMagnitude 
};
