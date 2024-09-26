const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Import all models
const User = require('./models/userModel');
const Earthquake = require('./models/earthquakeModel');
const Flood = require('./models/floodModel');
const Heatwave = require('./models/heatwaveModel');
const Tsunami = require('./models/tsunamiModel');
const Hazard = require('./models/generalHazardModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Function to generate random numbers
const getRandomNumber = (min, max) => Math.random() * (max - min) + min;

// Dummy Data Insertion
const insertDummyData = async () => {
  try {
    // Number of entries to insert
    const numEntries = 5;

    // Insert multiple users
    for (let i = 0; i < numEntries; i++) {
      const user = new User({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: "hashed_password", // Replace with encrypted password logic
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180)
        }
      });
      await user.save();
      console.log(`User ${i + 1} inserted successfully`);
    }

    // Insert multiple earthquakes
    for (let i = 0; i < numEntries; i++) {
      const earthquake = new Earthquake({
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180),
          placeName: `Place ${i + 1}`
        },
        magnitude: getRandomNumber(4, 9),
        depth: getRandomNumber(5, 100),
        date: new Date(`2023-0${i + 1}-01`),
        fatalities: getRandomNumber(0, 500),
        injuries: getRandomNumber(0, 1000),
        damageEstimate: getRandomNumber(100000, 10000000),
        tsunamiWarning: i % 2 === 0
      });
      await earthquake.save();
      console.log(`Earthquake ${i + 1} inserted successfully`);
    }

    // Insert multiple floods
    for (let i = 0; i < numEntries; i++) {
      const flood = new Flood({
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180),
          placeName: `FloodPlace ${i + 1}`
        },
        date: new Date(`2022-0${i + 1}-15`),
        waterLevel: getRandomNumber(1, 10), // meters
        duration: getRandomNumber(1, 7), // days
        affectedArea: getRandomNumber(10, 500), // square kilometers
        fatalities: getRandomNumber(0, 200),
        injuries: getRandomNumber(0, 500),
        damageEstimate: getRandomNumber(100000, 5000000)
      });
      await flood.save();
      console.log(`Flood ${i + 1} inserted successfully`);
    }

    // Insert multiple heatwaves
    for (let i = 0; i < numEntries; i++) {
      const heatwave = new Heatwave({
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180),
          placeName: `HeatwavePlace ${i + 1}`
        },
        startDate: new Date(`2023-0${i + 1}-01`),
        endDate: new Date(`2023-0${i + 1}-10`),
        peakTemperature: getRandomNumber(35, 50), // Celsius
        averageTemperature: getRandomNumber(30, 45),
        fatalities: getRandomNumber(0, 300),
        injuries: getRandomNumber(0, 1000)
      });
      await heatwave.save();
      console.log(`Heatwave ${i + 1} inserted successfully`);
    }

    // Insert multiple tsunamis
    for (let i = 0; i < numEntries; i++) {
      const tsunami = new Tsunami({
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180),
          placeName: `TsunamiPlace ${i + 1}`
        },
        magnitude: getRandomNumber(6, 9),
        waveHeight: getRandomNumber(3, 20), // meters
        date: new Date(`2021-0${i + 1}-30`),
        fatalities: getRandomNumber(0, 400),
        injuries: getRandomNumber(0, 1000),
        damageEstimate: getRandomNumber(100000, 20000000)
      });
      await tsunami.save();
      console.log(`Tsunami ${i + 1} inserted successfully`);
    }

    // Insert multiple general hazards
    for (let i = 0; i < numEntries; i++) {
      const hazard = new Hazard({
        hazardType: `HazardType ${i + 1}`,
        location: {
          latitude: getRandomNumber(-90, 90),
          longitude: getRandomNumber(-180, 180),
          placeName: `HazardPlace ${i + 1}`
        },
        severity: i % 2 === 0 ? "Severe" : "Moderate",
        date: new Date(`2023-0${i + 1}-20`),
        fatalities: getRandomNumber(0, 100),
        injuries: getRandomNumber(0, 300),
        damageEstimate: getRandomNumber(50000, 10000000)
      });
      await hazard.save();
      console.log(`Hazard ${i + 1} inserted successfully`);
    }

    // Close the MongoDB connection
    mongoose.connection.close();
    console.log("Dummy data inserted and connection closed");
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    process.exit(1);
  }
};

// Run the script
connectDB().then(insertDummyData);
