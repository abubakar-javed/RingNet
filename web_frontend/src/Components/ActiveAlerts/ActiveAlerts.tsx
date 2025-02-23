import { useState } from 'react';
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
  id: string;
  type: 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave';
  severity: 'high' | 'medium' | 'low';
  location: string;
  timestamp: string;
  details: string;
}

const ActiveAlerts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const alerts: Alert[] = [
    {
      id: '1',
      type: 'Earthquake',
      severity: 'high',
      location: 'Nepal, Kathmandu',
      timestamp: '2024-03-15T08:30:00Z',
      details: 'Magnitude 6.2 earthquake detected'
    },
    {
      id: '2',
      type: 'Tsunami',
      severity: 'high',
      location: 'Indonesia, Jakarta',
      timestamp: '2024-03-14T15:45:00Z',
      details: 'Potential tsunami threat detected'
    }
  ];

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
          {alerts.map((alert) => (
            <Grid item xs={12} key={alert.id}>
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