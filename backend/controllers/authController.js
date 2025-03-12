const errorHandler = require("../middlewares/errorMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {loginSchema} = require("../schemas/authSchema");
const {StatusCodes} = require("http-status-codes");
const {decrypt, encrypt} = require("../config/encryption");
const {z} = require("zod");
// Helper function to generate JWT

const JWT_SECRET = process.env.JWT_SECRET;
const login = async (req, res) => {

    const {email, password} = req.body;

    // Check if all fields are provided
    if (!email || !password) {
        return res.status(400).json({message: "Email and password are required."});
    }

    // Check if the user exists
    const user = await User.findOne({email});
    if (!user) {
        return res.status(400).json({message: "Invalid credentials."});
    }
    // Compare passwords
    if (password != decrypt(user.password)) {
        return res.status(400).json({message: "Invalid credentials."});
    }

    // Create a permanent JWT token
    const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: "9999 years"});

    // Send the response with token
    res.status(200).json({
        message: "Login successful.",
        token,
        userId: user._id,
    });
};

const register = async (req, res) => {
    const {name, email, password, location} = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
        return res.status(400).json({message: "All fields are required."});
    }

    // Check if the user already exists
    const existingUser = await User.findOne({email});
    if (existingUser) {
        return res.status(400).json({message: "User already exists."});
    }

    // Hash the password
    const hashedPassword = encrypt(password);

    // Use default location (Islamabad, Pakistan) if location is not provided
    const defaultLocation = {latitude: 33.6844, longitude: 73.0479}; // Islamabad coordinates
    const userLocation = location || defaultLocation;

    // Create a new user
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        location: userLocation,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Create a permanent JWT token
    const token = jwt.sign({userId: savedUser._id}, JWT_SECRET, {expiresIn: "9999 years"}); // Set token to a very long expiration time

    // Send the response with token
    res.status(201).json({
        message: "User registered successfully.",
        token,
        userId: savedUser._id,
    });
};
const authenticate = (req, res) => {
    if (req.user) {
        const userEmail = req.user.email;
        const domain = userEmail.split('@')[1]; // Extract domain

        if (domain === 'gosaas.io') {
            const token = generateToken(req.user.userid);
            res.redirect(
                `${process.env.DEPLOY_FRONTEND_URL}/auth/callback?token=${token}&userId=${req.user.userid}` // Use req.user.userid here
            );
        } else {
            res.redirect(
                `${process.env.DEPLOY_FRONTEND_URL}/login?error=UnauthorizedDomain`
            );
        }
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({message: "User not authenticated"});
    }


};


module.exports = {
    login,
    authenticate,
    register
};
