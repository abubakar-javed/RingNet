const mongoose = require("mongoose");

const startServer = async () => {
  try {
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1); 
  }
};

module.exports = startServer;
