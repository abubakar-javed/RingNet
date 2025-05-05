import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Warning as HazardIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// Referencing the alert interface from RecentAlerts
interface Alert {
  type: string;
  severity: string;
  location: string;
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  details: string;
  distance?: number;
}

const ActiveAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/alerts/user-alerts`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Filter alerts to only include those from the last 3 hours
        const threeHoursAgo = new Date();
        threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);
        
        const recentAlerts = response.data.alerts.filter((alert: Alert) => 
          new Date(alert.timestamp) >= threeHoursAgo
        );
        
        setAlerts(recentAlerts);
        setError(null);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Set up polling to refresh alerts every minute for more real-time updates
    const intervalId = setInterval(fetchAlerts, 60 * 1000); // 1 minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Filter alerts based on search term
  const filteredAlerts = alerts.filter(alert => 
    alert.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
    alert.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
    alert.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Earthquake': return <EarthquakeIcon sx={{ color: '#cf1322' }} />;
      case 'Tsunami': return <TsunamiIcon sx={{ color: '#d46b08' }} />;
      case 'Flood': return <FloodIcon sx={{ color: '#096dd9' }} />;
      case 'Heatwave': return <HeatwaveIcon sx={{ color: '#d46b08' }} />;
      default: return <HazardIcon />;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HazardIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Active Alerts (Last 3 Hours)
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search alerts by type, location or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white'
              }
            }}
          />
          <IconButton sx={{ bgcolor: 'white', border: '1px solid #e2e8f0' }}>
            <FilterIcon />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress color="error" />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredAlerts.length === 0 ? (
          <Alert severity="info">
            {searchTerm ? 'No alerts match your search criteria' : 'No active alerts in the last 3 hours'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredAlerts.map((alert, index) => (
              <Grid item xs={12} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid #fad4d4',
                    bgcolor: alert.severity === 'error' ? '#fff5f5' : 
                             alert.severity === 'warning' ? '#fffbeb' : 'white',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{
                    p: 1,
                    borderRadius: '50%',
                    bgcolor: 'rgba(207, 19, 34, 0.1)'
                  }}>
                    {getAlertIcon(alert.type)}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600} color="#1f2937">
                        {alert.type} Alert
                      </Typography>
                      <Chip
                        size="small"
                        label={alert.severity.toUpperCase()}
                        sx={{
                          bgcolor: alert.severity === 'error' ? '#fef2f2' : 
                                  alert.severity === 'warning' ? '#fffbeb' : '#f0f9ff',
                          color: alert.severity === 'error' ? '#ef4444' : 
                                alert.severity === 'warning' ? '#f59e0b' : '#3b82f6',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="#4b5563" mb={1}>
                      {alert.details}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Typography variant="caption" color="#64748b">
                        Location: {alert.location}
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        Time: {new Date(alert.timestamp).toLocaleString()}
                      </Typography>
                      {alert.distance !== undefined && (
                        <Typography variant="caption" color="#64748b">
                          Distance: {alert.distance} km
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default ActiveAlerts;