import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Assessment as ReportsIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
} from '@mui/icons-material';

// Interface for historical data items
interface Location {
  placeName: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface Impact {
  affectedArea: number;
  affectedPopulation: number;
  casualties: number;
  economicLoss: number;
}

interface Measurements {
  [key: string]: number;
}

interface Source {
  name: string;
  url: string;
  retrievalDate: string;
  dataQuality: string;
}

interface Metadata {
  originalId: string;
  disasterType: string;
  description: string;
  additionalData: {
    [key: string]: any;
  };
}

interface HistoricalDataItem {
  _id: string;
  hazardType: string;
  eventDate: string;
  location: Location;
  severity: 'Low' | 'Moderate' | 'High' | 'Severe';
  impact: Impact;
  measurements: Measurements;
  source: Source;
  metadata: Metadata;
}

const ExportData = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const hazardTypes = [
    { type: 'Earthquake', icon: <EarthquakeIcon sx={{ color: '#cf1322' }} /> },
    { type: 'Tsunami', icon: <TsunamiIcon sx={{ color: '#d46b08' }} /> },
    { type: 'Flood', icon: <FloodIcon sx={{ color: '#096dd9' }} /> },
    { type: 'Heatwave', icon: <HeatwaveIcon sx={{ color: '#d46b08' }} /> }
  ];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Function to fetch historical data based on filters
  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params: any = {
        limit: 1000 // Request a large number of records for export
      };
      
      // Add date filters if provided
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      // Add hazard type filter if types are selected
      if (selectedTypes.length === 1) {
        params.hazardType = selectedTypes[0];
      }
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      // Use the correct backend URL and authorization pattern
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      // Fetch data for each selected hazard type or all at once
      let allData: HistoricalDataItem[] = [];
      
      if (selectedTypes.length > 1) {
        // Fetch data for each type separately and combine
        for (const hazardType of selectedTypes) {
          const response = await axios.get(
            `${backendUrl}/api/historical`,
            {
              params: { ...params, hazardType },
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.data && Array.isArray(response.data.data)) {
            allData = [...allData, ...response.data.data];
          }
        }
      } else {
        // Fetch all data or single type data
        const response = await axios.get(
          `${backendUrl}/api/historical`,
          {
            params,
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (response.data && Array.isArray(response.data.data)) {
          allData = response.data.data;
        }
      }
      
      console.log(`Retrieved ${allData.length} records for export`);
      
      // Process and export data
      if (allData.length > 0) {
        processAndDownloadData(allData, format);
        setNotification({
          open: true,
          message: `Successfully exported ${allData.length} records`,
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: 'No data found with the current filters',
          severity: 'warning'
        });
      }
      
    } catch (error: any) {
      console.error('Error fetching data for export:', error);
      setNotification({
        open: true,
        message: `Error: ${error.message || 'Failed to fetch data'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to process and download data in the selected format
  const processAndDownloadData = (data: HistoricalDataItem[], format: string) => {
    switch (format) {
      case 'csv':
        downloadCSV(data);
        break;
      case 'json':
        downloadJSON(data);
        break;
      case 'xlsx':
        downloadExcel(data);
        break;
      case 'pdf':
        downloadPDF(data);
        break;
      default:
        downloadCSV(data);
    }
  };

  // Helper to download as CSV
  const downloadCSV = (data: HistoricalDataItem[]) => {
    // Transform data to flat structure
    const flatData = data.map(item => ({
      'Hazard Type': item.hazardType,
      'Date': new Date(item.eventDate).toLocaleDateString(),
      'Severity': item.severity,
      'Location': item.location.placeName || `${item.location.region}, ${item.location.country}`,
      'Country': item.location.country,
      'Region': item.location.region,
      'Latitude': item.location.latitude,
      'Longitude': item.location.longitude,
      'Affected Population': item.impact.affectedPopulation,
      'Casualties': item.impact.casualties,
      'Economic Loss (USD)': item.impact.economicLoss,
      'Affected Area (sq km)': item.impact.affectedArea,
      'Description': item.metadata.description
    }));
    
    // Create CSV headers
    const headers = Object.keys(flatData[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    flatData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header as keyof typeof row];
        // Handle values that need to be quoted (e.g., if they contain commas)
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historical_data_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to download as JSON
  const downloadJSON = (data: HistoricalDataItem[]) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historical_data_export_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to download as Excel (XLSX)
  // Note: In a real app, you'd typically use a library like xlsx or exceljs
  const downloadExcel = (data: HistoricalDataItem[]) => {
    // For simplicity, fall back to CSV for now
    // In a production app, you'd implement proper Excel export
    downloadCSV(data);
    setNotification({
      open: true,
      message: 'Excel export implemented as CSV. For proper Excel files, please add the xlsx library.',
      severity: 'info'
    });
  };

  // Helper to download as PDF
  // Note: In a real app, you'd typically use a library like jsPDF
  const downloadPDF = (data: HistoricalDataItem[]) => {
    // For simplicity, fall back to CSV for now
    // In a production app, you'd implement proper PDF export
    downloadCSV(data);
    setNotification({
      open: true,
      message: 'PDF export implemented as CSV. For proper PDF files, please add the jsPDF library.',
      severity: 'info'
    });
  };

  const handleExport = () => {
    console.log('Exporting data...', { dateRange, selectedTypes, format });
    
    // Validate inputs
    if (selectedTypes.length === 0) {
      setNotification({
        open: true,
        message: 'Please select at least one hazard type',
        severity: 'warning'
      });
      return;
    }
    
    // Fetch and export data
    fetchHistoricalData();
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ReportsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Export Data
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          mb: 3
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Select Hazard Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {hazardTypes.map(({ type, icon }) => (
                <Chip
                  key={type}
                  icon={icon}
                  label={type}
                  onClick={() => handleTypeToggle(type)}
                  sx={{
                    bgcolor: selectedTypes.includes(type) ? '#fef2f2' : 'transparent',
                    border: '1px solid #fad4d4',
                    color: selectedTypes.includes(type) ? '#ef4444' : '#64748b',
                    '&:hover': {
                      bgcolor: '#fff5f5'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Export Format
            </Typography>
            <FormControl fullWidth>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                {/* <MenuItem value="xlsx">Excel (XLSX)</MenuItem> */}
                {/* <MenuItem value="pdf">PDF Report</MenuItem> */}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
              onClick={handleExport}
              disabled={loading}
              sx={{
                mt: 2,
                bgcolor: '#bc1a1a',
                '&:hover': {
                  bgcolor: '#a61616'
                }
              }}
            >
              {loading ? 'Exporting...' : 'Export Data'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeNotification}
          severity={notification.severity}
          sx={{ 
            width: '100%',
            ...(notification.severity === 'error' && {
              backgroundColor: 'rgba(188, 26, 26, 0.1)',
              color: '#bc1a1a',
              '.MuiAlert-icon': { color: '#bc1a1a' }
            })
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportData;