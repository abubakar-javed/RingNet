const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
  hazardType: {
    type: String,
    required: true,
    enum: ['Earthquake', 'Tsunami', 'Flood', 'Heatwave', 'Other'],
    index: true
  },
  eventDate: {
    type: Date,
    required: true,
    index: true
  },
  location: {
    placeName: String,
    country: String,
    region: String,
    latitude: Number,
    longitude: Number
  },
  severity: {
    type: String,
    enum: ['Low', 'Moderate', 'High', 'Severe'],
    required: true
  },
  impact: {
    affectedArea: Number, // in square km
    affectedPopulation: Number,
    casualties: Number,
    economicLoss: Number // in USD
  },
  measurements: {
    magnitude: Number, // for earthquakes
    riverDischarge: Number, // for floods (m³/s)
    waveHeight: Number, // for tsunamis (m)
    temperature: Number, // for heatwaves (°C)
    durationHours: Number // duration in hours
  },
  source: {
    name: String, // API or data source name
    url: String,
    retrievalDate: Date,
    dataQuality: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    }
  },
  metadata: {
    // Store any additional data specific to the hazard type
    originalId: String, // ID from the source system
    disasterType: String, // More specific than hazardType (e.g., "Flash Flood", "Wildfire")
    alerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }],
    description: String,
    additionalData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Add indexes for faster querying
historicalDataSchema.index({ hazardType: 1, eventDate: 1 });
historicalDataSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
historicalDataSchema.index({ 'metadata.originalId': 1 }, { sparse: true });

// Static method to find events near a location
historicalDataSchema.statics.findNearby = function(latitude, longitude, radiusKm, options = {}) {
  // Calculate bounding box for faster initial filtering
  const kmPerDegree = 111.32; // approximate at equator
  const latDelta = radiusKm / kmPerDegree;
  const lonDelta = radiusKm / (kmPerDegree * Math.cos(latitude * Math.PI / 180));
  
  const query = {
    'location.latitude': { $gte: latitude - latDelta, $lte: latitude + latDelta },
    'location.longitude': { $gte: longitude - lonDelta, $lte: longitude + lonDelta }
  };
  
  // Add any additional filters from options
  if (options.hazardType) query.hazardType = options.hazardType;
  if (options.startDate && options.endDate) {
    query.eventDate = { $gte: options.startDate, $lte: options.endDate };
  } else if (options.startDate) {
    query.eventDate = { $gte: options.startDate };
  } else if (options.endDate) {
    query.eventDate = { $lte: options.endDate };
  }
  
  return this.find(query);
};

const HistoricalData = mongoose.model('HistoricalData', historicalDataSchema);

module.exports = HistoricalData; 