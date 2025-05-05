const Earthquake = require('../models/earthquakeModel');
const Notification = require('../models/notificationModel');
const Alert = require('../models/alertModel');
const User = require('../models/userModel');
const { v4: uuidv4 } = require('uuid');
const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');
const axios = require('axios');

// Calculate distance between two points in km using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

const predictEarthquakeMagnitude = async (req, res) => {
    // Default Islamabad coordinates if not provided
    const DEFAULT_LATITUDE = 33.63932843857055;
    const DEFAULT_LONGITUDE = 72.98566973732082;
    const DEFAULT_LOCATION = "Islamabad, Pakistan";

    // Extract parameters from request body
    const { parameters,lat,long,loc,depth } = req.body;
    
    // Use default values if not provided in the request
    const latitude = lat || DEFAULT_LATITUDE;
    const longitude = long || DEFAULT_LONGITUDE;
    const location = loc || DEFAULT_LOCATION;
    
    try {
        const response = await axios.post('https://flask-test-rvu8.onrender.com/predict', {
            parameters
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("response", response.data);

        // Create earthquake based on the schema
        const earthquake = new Earthquake({
            date: new Date(),
            source: 'ML Prediction',
            description: `Earthquake prediction for ${location}`,
            metadata: {
                eventCount: 1,
                minMagnitude: response.data.magnitude,
                timeRange: {
                    start: new Date(),
                    end: new Date()
                },
                events: [{
                    eventId: uuidv4(),
                    title: `Predicted Earthquake at ${location}`,
                    place: location,
                    time: new Date(),
                    updated: new Date(),
                    magnitude: response.data.magnitude,
                    magnitudeType: 'ML',
                    depth: parameters.depth || 0,
                    tsunami: 0,
                    alert: determineSeverity(response.data.magnitude),
                    status: 'predicted',
                    location: {
                        latitude: latitude,
                        longitude: longitude,
                        depth: parameters.depth || 0
                    },
                    significance: calculateSignificance(response.data.magnitude)
                }]
            }
        });
        
        await earthquake.save();

        // Create alert
        const alertSeverity = determineSeverity(response.data.magnitude);
        const alert = new Alert({
            type: 'Earthquake',
            severity: alertSeverity,
            location: location,
            hazardId: earthquake._id,
            hazardModel: 'Earthquake',
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            details: `Predicted earthquake with magnitude ${response.data.magnitude}`,
            isActive: true
        });

        await alert.save();

        // Find users within 100km radius of the earthquake
        const users = await User.find({});
        const impactRadius = parseFloat(response.data.distance) || 100; // Use predicted distance or default to 100km
        
        // Filter users within the impact radius
        const affectedUsers = users.filter(user => {
            if (!user.location || !user.location.latitude || !user.location.longitude) {
                return false;
            }
            
            const distance = calculateDistance(
                latitude, 
                longitude, 
                user.location.latitude, 
                user.location.longitude
            );
            
            return distance <= impactRadius;
        });
        
        // Create notification for each affected user
        const notifications = [];
        for (const user of affectedUsers) {
            const notification = new Notification({
                notificationId: uuidv4(),
                alertId: alert._id,
                hazardId: earthquake._id,
                hazardModel: 'Earthquake',
                type: 'Earthquake',
                severity: alertSeverity,
                location: location,
                magnitude: response.data.magnitude,
                impactRadius: impactRadius,
                status: 'Sent',
                message: `A ${response.data.magnitude} magnitude earthquake is predicted near ${location} with impact radius of ${impactRadius} km`,
                recipients: [user._id]
            });
            
            await notification.save();
            notifications.push(notification);
        }

        res.json({
            success: true,
            predictedMagnitude: response.data.magnitude,
            impactArea: `Approx.${impactRadius} km`,
            alertSeverity: alertSeverity,
            affectedUsers: affectedUsers.length,
            notificationsSent: notifications.length
        }); 
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Helper function to determine severity based on magnitude
function determineSeverity(magnitude) {
    if (magnitude >= 7.0) return 'error';
    if (magnitude >= 5.0) return 'warning';
    return 'info';
}

// Helper function to calculate significance
function calculateSignificance(magnitude) {
    // Simple formula based on magnitude
    return Math.round(Math.pow(10, magnitude) * 10);
}

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
