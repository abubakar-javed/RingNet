import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  Map as MapIcon,
  CalendarMonth as CalendarIcon,
  FloodOutlined as FloodIcon,
  WavesOutlined as TsunamiIcon,
  LocalFireDepartmentOutlined as HeatwaveIcon,
  TerrainOutlined as EarthquakeIcon,
  FilterAlt as FilterIcon,
  RestartAlt as ResetIcon
} from '@mui/icons-material';

// Define TypeScript interfaces
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
  [key: string]: number; // Generic for different hazard types
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

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse {
  data: HistoricalDataItem[];
  pagination: PaginationInfo;
}

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format large numbers
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to get icon by hazard type
const getHazardIcon = (hazardType: string) => {
  switch (hazardType.toLowerCase()) {
    case 'earthquake':
      return <EarthquakeIcon sx={{ color: '#bc1a1a' }} />;
    case 'tsunami':
      return <TsunamiIcon sx={{ color: '#1976d2' }} />;
    case 'flood':
      return <FloodIcon sx={{ color: '#2196f3' }} />;
    case 'heatwave':
      return <HeatwaveIcon sx={{ color: '#ff9800' }} />;
    default:
      return <ReportsIcon sx={{ color: '#9c27b0' }} />;
  }
};

// Helper function to get color by severity
const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Severe':
      return '#bc1a1a'; // Main brand red
    case 'High':
      return '#e74c3c'; // Lighter red
    case 'Moderate':
      return '#f39c12'; // Orange
    case 'Low':
      return '#27ae60'; // Green
    default:
      return '#9e9e9e';
  }
};

// Determine if we're in development mode
const isDevelopmentMode = import.meta.env.DEV === true;

// Remove the custom apiClient and use the pattern consistent with the rest of the application
const HistoricalData = () => {
  // State for filters
  const [hazardType, setHazardType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [minSeverity, setMinSeverity] = useState<string>('');
  
  // State for pagination
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  
  // State for data
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'table' | 'cards'>('table');
  
  // Function to fetch data with filters
  const fetchHistoricalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params: any = {
        page: page + 1, // API pagination is 1-indexed
        limit: rowsPerPage
      };
      
      // Add filters if they exist
      if (hazardType) params.hazardType = hazardType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (country) params.country = country;
      if (region) params.region = region;
      if (minSeverity) params.minSeverity = minSeverity;
      
      console.log('Fetching historical data with params:', params);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      // Use the correct backend URL and authorization pattern
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      console.log('API base URL:', backendUrl);
      
      // Make the API request
      const response = await axios.get<ApiResponse>(
        `${backendUrl}/api/historical`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Received API response:', response.data);
      
      // Check if response has the expected structure
      if (response.data && Array.isArray(response.data.data)) {
        setHistoricalData(response.data.data);
        setPagination(response.data.pagination || { total: 0, page: 1, limit: rowsPerPage, pages: 0 });
      } else {
        console.error('Unexpected API response format:', response.data);
        
        // For development/testing - generate some sample data if API response isn't as expected
        if (isDevelopmentMode) {
          console.log('Generating sample data for development');
          generateSampleData();
        } else {
          setHistoricalData([]);
          setPagination({ total: 0, page: 1, limit: rowsPerPage, pages: 0 });
          setError('Received unexpected data format from server');
        }
      }
    } catch (err: any) {
      console.error('Error fetching historical data:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        responseData: err.response?.data
      });
      
      // For development/testing - generate some sample data if API fails
      if (isDevelopmentMode) {
        console.log('Generating sample data for development due to API error');
        generateSampleData();
      } else {
        setHistoricalData([]);
        setPagination({ total: 0, page: 1, limit: rowsPerPage, pages: 0 });
        setError(err.response?.data?.message || err.message || 'Failed to fetch historical data');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle page change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(0); // Reset to first page when applying new filters
    fetchHistoricalData();
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setHazardType('');
    setStartDate('');
    setEndDate('');
    setCountry('');
    setRegion('');
    setMinSeverity('');
    setPage(0);
    // Fetch data with reset filters
    fetchHistoricalData();
  };
  
  // Add debugging effect to log when component mounts
  useEffect(() => {
    console.log('HistoricalData component mounted');
    console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL || 'Not set - fallback to localhost:3000');
    
    // Initialize with empty data to avoid undefined errors
    setHistoricalData([]);
    setPagination({ total: 0, page: 1, limit: rowsPerPage, pages: 0 });
    
    // Then fetch the data
    fetchHistoricalData();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Fetch data when pagination changes (separate from initial load)
  useEffect(() => {
    // Skip on initial render since we already fetch in the mount effect
    if (historicalData.length > 0 || error) {
      console.log('Fetching data due to pagination change:', { page, rowsPerPage });
      fetchHistoricalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);
  
  // Helper function to generate sample data for development
  const generateSampleData = () => {
    const sampleData: HistoricalDataItem[] = [];
    const hazardTypes = ['Earthquake', 'Tsunami', 'Flood', 'Heatwave'];
    const severities = ['Low', 'Moderate', 'High', 'Severe'];
    const countries = ['United States', 'Japan', 'India', 'Brazil', 'Australia'];
    
    // Generate 20 sample records
    for (let i = 0; i < 20; i++) {
      const hazardType = hazardTypes[Math.floor(Math.random() * hazardTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      
      sampleData.push({
        _id: `sample-${i}`,
        hazardType,
        eventDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        location: {
          placeName: `Sample Location ${i}`,
          country,
          region: `Region ${i}`,
          latitude: (Math.random() * 180) - 90,
          longitude: (Math.random() * 360) - 180
        },
        severity: severity as any,
        impact: {
          affectedArea: Math.floor(Math.random() * 10000),
          affectedPopulation: Math.floor(Math.random() * 1000000),
          casualties: Math.floor(Math.random() * 1000),
          economicLoss: Math.floor(Math.random() * 1000000000)
        },
        measurements: {
          magnitude: Math.random() * 9,
          durationHours: Math.random() * 24
        },
        source: {
          name: 'Sample Data',
          url: 'https://example.com',
          retrievalDate: new Date().toISOString(),
          dataQuality: 'Medium'
        },
        metadata: {
          originalId: `generated-${i}`,
          disasterType: hazardType,
          description: `Sample ${hazardType} event in ${country}`,
          additionalData: {}
        }
      });
    }
    
    setHistoricalData(sampleData);
    setPagination({
      total: 100, // Simulate more pages
      page: page + 1,
      limit: rowsPerPage,
      pages: 10
    });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ReportsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Historical Data
        </Typography>
      </Box>

      {/* Filters Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon fontSize="small" />
            Filter Historical Data
          </Typography>
          
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Hazard Type</InputLabel>
              <Select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value)}
                label="Hazard Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Earthquake">Earthquake</MenuItem>
                <MenuItem value="Tsunami">Tsunami</MenuItem>
                <MenuItem value="Flood">Flood</MenuItem>
                <MenuItem value="Heatwave">Heatwave</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          {/* <Grid item xs={12} sm={6} md={4} lg={2}>
            <TextField
              fullWidth
              size="small"
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </Grid> */}
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Min Severity</InputLabel>
              <Select
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
                label="Min Severity"
              >
                <MenuItem value="">Any Severity</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Severe">Severe</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              variant="contained" 
              fullWidth
              size="small"
              onClick={handleApplyFilters}
              disabled={loading}
              sx={{
                background: '#bc1a1a',
                '&:hover': { 
                  background: '#bc1a1f'
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
            </Button>
            
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ResetIcon />}
            variant="outlined"
            color="secondary"
            onClick={handleResetFilters}
            size="small"
            sx={{
              color: '#bc1a1a',
              borderColor: '#bc1a1a'
            }}
          >
            Reset
          </Button>
            
          </Grid>
        </Grid>
      </Paper>

      {/* View Type Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant={viewType === 'table' ? 'contained' : 'outlined'}
          onClick={() => setViewType('table')}
          sx={{ 
            mr: 1,
            ...(viewType === 'table' 
              ? { 
                  background: '#bc1a1a', 
                  '&:hover': { background: '#bc1a1f' }
                } 
              : { 
                  color: '#bc1a1a', 
                  borderColor: '#bc1a1a',
                  '&:hover': { borderColor: '#bc1a1f', color: '#bc1a1f' } 
                }
            )
          }}
          size="small"
        >
          Table
        </Button>
        <Button
          variant={viewType === 'cards' ? 'contained' : 'outlined'}
          onClick={() => setViewType('cards')}
          sx={{ 
            ...(viewType === 'cards' 
              ? { 
                  background: '#bc1a1a', 
                  '&:hover': { background: '#bc1a1f' }
                } 
              : { 
                  color: '#bc1a1a', 
                  borderColor: '#bc1a1a',
                  '&:hover': { borderColor: '#bc1a1f', color: '#bc1a1f' } 
                }
            )
          }}
          size="small"
        >
          Cards
        </Button>
      </Box>

      {/* Data Display Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        {loading && (!historicalData || historicalData.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: '#bc1a1a' }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                color: '#bc1a1a', 
                borderColor: '#bc1a1a',
                '&:hover': { 
                  borderColor: '#bc1a1f', 
                  color: '#bc1a1f' 
                } 
              }}
              onClick={fetchHistoricalData}
              size="small"
            >
              Retry
            </Button>
          </Box>
        ) : !historicalData || historicalData.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="#64748b">
              No historical data found with the current filters
            </Typography>
          </Box>
        ) : viewType === 'table' ? (
          /* Table View */
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="historical data table">
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Affected</TableCell>
                    <TableCell>Casualties</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historicalData.map((item) => (
                    <TableRow
                      key={item._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getHazardIcon(item.hazardType)}
                          {item.hazardType}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(item.eventDate)}</TableCell>
                      <TableCell>
                        {item.location.placeName || `${item.location.region}, ${item.location.country}`}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.severity}
                          size="small"
                          sx={{ 
                            backgroundColor: getSeverityColor(item.severity),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatNumber(item.impact.affectedPopulation)}</TableCell>
                      <TableCell>{formatNumber(item.impact.casualties)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '.MuiTablePagination-selectIcon': { color: '#bc1a1a' },
                '.MuiTablePagination-actions button': { 
                  color: '#bc1a1a',
                  '&.Mui-disabled': { color: 'rgba(188, 26, 26, 0.3)' }
                }
              }}
            />
          </>
        ) : (
          /* Cards View */
          <>
            <Grid container spacing={2}>
              {historicalData.map((item) => (
                <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%', 
                      border: '1px solid #e2e8f0',
                      ':hover': {
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getHazardIcon(item.hazardType)}
                          <Typography variant="subtitle1" fontWeight="bold">
                            {item.hazardType}
                          </Typography>
                        </Box>
                        <Chip 
                          label={item.severity}
                          size="small"
                          sx={{ 
                            backgroundColor: getSeverityColor(item.severity),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {formatDate(item.eventDate)}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <MapIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {item.location.placeName || `${item.location.region}, ${item.location.country}`}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Affected</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(item.impact.affectedPopulation)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Casualties</Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(item.impact.casualties)}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {/* Display hazard-specific measurement if available */}
                      {item.measurements && Object.keys(item.measurements).length > 0 && (
                        <>
                          <Divider sx={{ my: 1 }} />
                          <Grid container spacing={1}>
                            {Object.entries(item.measurements).slice(0, 2).map(([key, value]) => (
                              <Grid item xs={6} key={key}>
                                <Typography variant="caption" color="text.secondary">
                                  {key.charAt(0).toUpperCase() + key.slice(1)}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {typeof value === 'number' ? value.toFixed(1) : value}
                                </Typography>
                              </Grid>
                            ))}
                          </Grid>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <TablePagination
              rowsPerPageOptions={[8, 16, 32, 64]}
              component="div"
              count={pagination?.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                '.MuiTablePagination-selectIcon': { color: '#bc1a1a' },
                '.MuiTablePagination-actions button': { 
                  color: '#bc1a1a',
                  '&.Mui-disabled': { color: 'rgba(188, 26, 26, 0.3)' }
                }
              }}
            />
          </>
        )}
      </Paper>
      
      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ 
            width: '100%',
            backgroundColor: 'rgba(188, 26, 26, 0.1)',
            color: '#bc1a1a',
            '.MuiAlert-icon': { color: '#bc1a1a' }
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistoricalData;