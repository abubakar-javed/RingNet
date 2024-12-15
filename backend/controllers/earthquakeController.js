const Earthquake = require('../models/earthquakeModel');
const { PythonShell } = require('python-shell');
const { spawn } = require('child_process');

const predictEarthquakeMagnitude = (req, res) => {
  const { parameters } = req.body;

  if (!parameters || parameters.length !== 12) {
      return res.status(400).json({ error: '12 input parameters are required' });
  }

  // Spawn the Python process
  const pythonProcess = spawn('python', ['predict.py', ...parameters]);

  let output = '';
  let errorOutput = '';

  // Capture stdout
  pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
  });

  // Capture stderr
  pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
  });

  // Handle process exit
  pythonProcess.on('close', (code) => {
      if (code !== 0 || errorOutput) {
          console.error(`Python script error (code ${code}): ${errorOutput}`);
          return res.status(500).json({ error: errorOutput || 'Python script error' });
      }

      console.log("Python script output:", output);

      try {
          const [predictedMagnitude, travelDistance] = output.trim().split(',').map(parseFloat);

          let zone;
          if (predictedMagnitude >= 7) {
              zone = "High impact area (Notify all within 500 km)";
          } else if (predictedMagnitude >= 5) {
              zone = "Moderate impact area (Notify all within 200 km)";
          } else {
              zone = "Low impact area (Notify all within 100 km)";
          }

          res.json({
              predictedMagnitude: predictedMagnitude.toFixed(2),
              travelDistance,
              zone
          });
      } catch (parseError) {
          console.error("Error parsing Python script output:", parseError);
          return res.status(500).json({ error: 'Error parsing Python script output.' });
      }
  });
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

module.exports = { getAllEarthquakes,predictEarthquakeMagnitude };
