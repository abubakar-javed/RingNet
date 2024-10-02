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


app.get('/api/welcome', (req, res) => {
    res.send('Hello, World!');
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/earthquake", earthquakeRoutes);

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
    const dbConnected = await mongoConnection();
};

startServer();
