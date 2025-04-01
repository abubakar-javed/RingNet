#!/usr/bin/env node

const express = require("express");
require("dotenv").config();
require("express-async-errors");
const mongoConnection = require("./startup/connectToDB");
const errorHandler = require("./middlewares/errorMiddleware");
const session = require("express-session");
const passport = require("./config/passport");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
// const logger = require("morgan");
const http = require("http");
const debug = require("debug")("my-express-backend:server");
const config = require("config");

// Import routes
const authRoutes = require("./routes/auth");
const earthquakeRoutes = require("./routes/earthquakeRoutes");
const tsunamiRoutes = require("./routes/tsunamiRoutes");
const generalHazardRoutes = require("./routes/generalHazardRoutes");
const floodRoutes = require("./routes/floodRoutes");    
const heatwaveRoutes = require("./routes/heatwaveRoutes");
const weatherRoutes = require('./routes/weatherRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const alertRoutes = require('./routes/alertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Create Express app
const app = express();

// Middleware setup
// app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Session setup
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your_secret", // Custom env variable
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === "production" },
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Add this where you initialize your services
const { initialize: initializeFloodService } = require('./services/floodService');

// Initialize flood service when the server starts
initializeFloodService()
  .then(() => {
    console.log('Flood service initialized successfully');
  })
  .catch(err => {
    console.error('Failed to initialize flood service:', err);
  });

app.get('/api/welcome', (req, res) => {
    res.send('Hello, World!');
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/earthquake", earthquakeRoutes);
app.use("/api/flood", floodRoutes);
app.use("/api/heatwave", heatwaveRoutes);
app.use("/api/tsunami", tsunamiRoutes);
app.use("/api/hazards", generalHazardRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

// Retrieve the port from environment variables or use default from the config
const port = normalizePort(3000);
app.set("port", port);

// Create and start HTTP server
const server = http.createServer(app);

server.listen(port);
server.on("listening", onListening);

// Normalize port into a number, string, or false
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

// Function to log when the server starts listening
function onListening() {
    const addr = server.address();
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
    debug("Listening on " + bind);
}

// Start server and connect to MongoDB
const startServer = async () => {
    try {
        // Wait for MongoDB connection to be established
        const dbConnected = await mongoConnection();
        
        if (dbConnected) {
            console.log('MongoDB connected successfully');
            
            // Initialize services AFTER database connection
            const { initialize: initializeFloodService } = require('./services/floodService');
            initializeFloodService()
              .then(() => console.log('Flood service initialized'))
              .catch(err => console.error('Failed to initialize flood service:', err));
              
            // Initialize other services here if needed
        } else {
            console.error('Failed to connect to MongoDB');
        }
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

startServer();
