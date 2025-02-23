import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
  Warning as HazardIcon,
} from '@mui/icons-material';

interface Alert {
  type: string;
  severity: string;
  location: string;
  timestamp: string;
}

interface RecentAlertsProps {
  alerts: Alert[];
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ alerts }) => {
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
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        mb: 4,
        border: '1px solid #e2e8f0',
        background: '#ffffff'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="#2d3748">
          Recent Alerts
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>
      
      <Grid container spacing={2}>
        {alerts.map((alert, index) => (
          <Grid item xs={12} key={index}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                borderRadius: 1,
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#cbd5e0',
                  backgroundColor: '#f8fafc'
                }
              }}
            >
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: alert.severity === 'error' ? 'rgba(207, 19, 34, 0.1)' : 
                               alert.severity === 'warning' ? 'rgba(212, 107, 8, 0.1)' : 
                               'rgba(9, 109, 217, 0.1)',
              }}>
                {getAlertIcon(alert.type)}
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} color="#2d3748">
                    {alert.type} Alert
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(alert.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="#4a5568" mb={1}>
                  {alert.location}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <HazardIcon sx={{ fontSize: 16 }} />
                    {alert.severity === 'error' ? 'High Risk' : 
                     alert.severity === 'warning' ? 'Medium Risk' : 'Low Risk'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RecentAlerts;