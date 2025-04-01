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
  InputAdornment
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
        setAlerts(response.data.alerts);
        setError(null);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    
    // Optional: Set up polling to refresh alerts every few minutes
    const intervalId = setInterval(fetchAlerts, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div>Loading active alerts...</div>;
  if (error) return <div>Error: {error}</div>;
  if (alerts.length === 0) return <div>No active alerts in your area</div>;

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
          Active Alerts
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
            placeholder="Search alerts..."
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

        <Grid container spacing={2}>
          {alerts.map((alert, index) => (
            <Grid item xs={12} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid #fad4d4',
                  bgcolor: alert.severity === 'high' ? '#fff5f5' : 'white',
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
                        bgcolor: alert.severity === 'high' ? '#fef2f2' : '#f0f9ff',
                        color: alert.severity === 'high' ? '#ef4444' : '#3b82f6',
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="#4b5563" mb={1}>
                    {alert.details}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography variant="caption" color="#64748b">
                      Location: {alert.location}
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      Time: {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ActiveAlerts;