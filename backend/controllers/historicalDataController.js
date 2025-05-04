const HistoricalData = require('../models/historicalDataModel');
const { calculateDistance } = require('../utils/geoUtils');

// Get historical data with filtering options
const getHistoricalData = async (req, res) => {
  try {
    const {
      hazardType,
      startDate,
      endDate,
      country,
      region,
      minSeverity,
      limit = 50,
      page = 1
    } = req.query;

    // Build query object
    const query = {};
    
    // Apply filters if provided
    if (hazardType) query.hazardType = hazardType;
    
    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) query.eventDate.$gte = new Date(startDate);
      if (endDate) query.eventDate.$lte = new Date(endDate);
    }
    
    if (country) query['location.country'] = country;
    if (region) query['location.region'] = region;
    
    if (minSeverity) {
      const severityLevels = ['Low', 'Moderate', 'High', 'Severe'];
      const minIndex = severityLevels.indexOf(minSeverity);
      if (minIndex >= 0) {
        query.severity = { $in: severityLevels.slice(minIndex) };
      }
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const data = await HistoricalData.find(query)
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination info
    const total = await HistoricalData.countDocuments(query);
    
    res.json({
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get nearby historical events
const getNearbyEvents = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 100, // Default 100km radius
      hazardType,
      startDate,
      endDate,
      limit = 20
    } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Parse coordinates
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    // Create options object for findNearby
    const options = {};
    if (hazardType) options.hazardType = hazardType;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    
    // Find events near the specified location
    let events = await HistoricalData.findNearby(lat, lon, parseInt(radius), options);
    
    // Calculate actual distance for each event
    events = events.map(event => {
      const distance = calculateDistance(
        lat,
        lon,
        event.location.latitude,
        event.location.longitude
      );
      
      // Add distance to the result
      return {
        ...event.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });
    
    // Sort by distance and limit results
    events.sort((a, b) => a.distance - b.distance);
    if (events.length > parseInt(limit)) {
      events = events.slice(0, parseInt(limit));
    }
    
    res.json({ events, total: events.length });
  } catch (error) {
    console.error('Error fetching nearby historical events:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get statistics about historical data
const getHistoricalStats = async (req, res) => {
  try {
    const { startYear, endYear, hazardType } = req.query;
    
    // Default to last 5 years if not specified
    const currentYear = new Date().getFullYear();
    const start = startYear ? parseInt(startYear) : currentYear - 5;
    const end = endYear ? parseInt(endYear) : currentYear;
    
    const startDate = new Date(`${start}-01-01`);
    const endDate = new Date(`${end}-12-31`);
    
    // Base aggregation pipeline
    const aggregationPipeline = [
      {
        $match: {
          eventDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$eventDate" },
            hazardType: "$hazardType"
          },
          count: { $sum: 1 },
          avgImpactArea: { $avg: "$impact.affectedArea" },
          maxSeverity: { $max: "$severity" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.hazardType": 1 }
      }
    ];
    
    // Apply hazard type filter if specified
    if (hazardType) {
      aggregationPipeline[0].$match.hazardType = hazardType;
    }
    
    const stats = await HistoricalData.aggregate(aggregationPipeline);
    
    // Transform stats into a more usable format
    const formattedStats = {};
    stats.forEach(stat => {
      const year = stat._id.year;
      const type = stat._id.hazardType;
      
      if (!formattedStats[year]) {
        formattedStats[year] = {};
      }
      
      formattedStats[year][type] = {
        count: stat.count,
        avgImpactArea: Math.round(stat.avgImpactArea || 0),
        maxSeverity: stat.maxSeverity
      };
    });
    
    res.json({
      timeRange: { startYear: start, endYear: end },
      stats: formattedStats
    });
  } catch (error) {
    console.error('Error getting historical stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new historical data entry
const addHistoricalData = async (req, res) => {
  try {
    const newData = new HistoricalData(req.body);
    
    // Set source retrieval date if not provided
    if (!newData.source.retrievalDate) {
      newData.source.retrievalDate = new Date();
    }
    
    await newData.save();
    
    res.status(201).json({
      message: 'Historical data added successfully',
      data: newData
    });
  } catch (error) {
    console.error('Error adding historical data:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: 'Validation error', errors: messages });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk import historical data
const bulkImportHistoricalData = async (req, res) => {
  try {
    const { data } = req.body;
    
    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'No data provided for import' });
    }
    
    // Set source retrieval date if not provided
    const dataWithDefaults = data.map(item => ({
      ...item,
      source: {
        ...item.source,
        retrievalDate: item.source?.retrievalDate || new Date()
      }
    }));
    
    // Use insertMany for better performance with large datasets
    const result = await HistoricalData.insertMany(dataWithDefaults, { 
      ordered: false // Continue processing documents even if some fail
    });
    
    res.status(201).json({
      message: 'Historical data imported successfully',
      count: result.length
    });
  } catch (error) {
    console.error('Error bulk importing historical data:', error);
    
    // For bulk operations, we might get a BulkWriteError
    if (error.name === 'BulkWriteError') {
      return res.status(400).json({ 
        message: 'Bulk import partially failed',
        insertedCount: error.insertedDocs?.length || 0,
        error: error.message
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getHistoricalData,
  getNearbyEvents,
  getHistoricalStats,
  addHistoricalData,
  bulkImportHistoricalData
}; 