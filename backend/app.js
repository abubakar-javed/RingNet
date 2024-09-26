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
const logger = require("morgan");



// Import routes

const authRoutes = require("./routes/auth");

const app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret", //custom env variable
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(passport.initialize());
app.use(passport.session());



// Routes
app.use("/api/auth", authRoutes);


// Error handling middleware
app.use(errorHandler);

const startServer = async () => {
  const dbConnected = await mongoConnection();
};

startServer();

module.exports = app;
