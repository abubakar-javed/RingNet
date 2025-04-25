import React from 'react';
import { 
  Box, Card, CardContent, Typography, Divider, Alert, 
   Chip, Paper, Grid 
} from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WavesIcon from '@mui/icons-material/Waves';
import OpacityIcon from '@mui/icons-material/Opacity';
import { alpha } from '@mui/material/styles';

interface FloodAlert {
  date: string;
  discharge: number;
  severity: string;
  message: string;
}

interface FloodData {
  location: {
    latitude: number;
    longitude: number;
  };
  clusterId: string;
  alerts: FloodAlert[];
}

interface FloodCardProps {
  floodData: FloodData | null;
}

const FloodCard: React.FC<FloodCardProps> = ({ floodData }) => {

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return '#d32f2f'; // Red
      case 'high':
        return '#f57c00'; // Orange
      case 'moderate':
        return '#fbc02d'; // Yellow
      case 'low':
        return '#2196f3'; // Blue
      default:
        return '#757575'; // Grey
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return <ErrorIcon color="error" />;
      case 'high':
        return <WarningIcon style={{ color: '#f57c00' }} />;
      case 'moderate':
        return <WarningIcon style={{ color: '#fbc02d' }} />;
      case 'low':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!floodData || !floodData.alerts || floodData.alerts.length === 0) {
    return (
      <Card elevation={3} sx={{ minWidth: 275, height: '100%', position: 'relative', overflow: 'hidden',marginBottom:'2rem' }}>
        {/* Background decoration element */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -15, 
            right: -15, 
            width: 120, 
            height: 120, 
            borderRadius: '50%',
            bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
            zIndex: 0
          }} 
        />
        
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <WaterIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="div">
              Flood Monitoring
            </Typography>
          </Box>
          
          <Alert severity="success" sx={{ mb: 2 }}>
            No flood alerts for your area
          </Alert>
          
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.05),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <OpacityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" align="center">
                  Normal Water Levels
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: theme => alpha(theme.palette.success.main, 0.05),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%'
                }}
              >
                <WavesIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" align="center">
                  Safe River Conditions
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            River conditions are normal at your location. The system is actively monitoring discharge levels.
          </Typography>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Chip 
              label="Live Monitoring" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // If there are alerts, show them with better styling
  const sortedAlerts = [...floodData.alerts].sort((a, b) => {
    const severityRank: { [key: string]: number } = { 'severe': 4, 'high': 3, 'moderate': 2, 'low': 1 };
    return (severityRank[b.severity.toLowerCase()] || 0) - (severityRank[a.severity.toLowerCase()] || 0);
  });

  const highestSeverity = sortedAlerts[0].severity;

  return (
    <Card elevation={0} sx={{ height: '100%', marginBottom: 2 }}>
      {/* Background decoration element */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -15, 
          right: -15, 
          width: 120, 
          height: 120, 
          borderRadius: '50%',
          bgcolor: theme => 
            highestSeverity.toLowerCase() === 'severe' ? alpha(theme.palette.error.main, 0.1) :
            highestSeverity.toLowerCase() === 'high' ? alpha(theme.palette.warning.main, 0.1) :
            alpha(theme.palette.primary.main, 0.1),
          zIndex: -1
        }} 
      />
      
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <WaterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="div">
            Flood Monitoring
          </Typography>
        </Box>
        
        {/* <Alert 
          severity={
            highestSeverity.toLowerCase() === 'severe' ? 'error' : 
            highestSeverity.toLowerCase() === 'high' ? 'warning' : 
            highestSeverity.toLowerCase() === 'moderate' ? 'warning' : 'info'
          } 
          sx={{ mb: 2 }}
        >
          {sortedAlerts[0].message}
        </Alert> */}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The following dates may experience high river discharge levels in your area.
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ maxHeight: 200, overflowY: 'auto', pr: 1 }}>
          {sortedAlerts.map((alert, index) => (
            <Paper 
              key={index} 
              elevation={0} 
              sx={{ 
                p: 1.5, 
                mb: 1.5, 
                bgcolor: theme => {
                  const severityColors: { [key: string]: string } = {
                    'severe': alpha(theme.palette.error.main, 0.08),
                    'high': alpha(theme.palette.warning.main, 0.08),
                    'moderate': alpha(theme.palette.warning.light, 0.08),
                    'low': alpha(theme.palette.info.main, 0.08)
                  };
                  return severityColors[alert.severity.toLowerCase()] || 'inherit';
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  {getSeverityIcon(alert.severity)}
                  <Typography variant="body2" fontWeight="medium" sx={{ ml: 1 }}>
                    {formatDate(alert.date)}
                  </Typography>
                </Box>
                <Chip 
                  label={alert.severity} 
                  size="small" 
                  sx={{ 
                    backgroundColor: getSeverityColor(alert.severity), 
                    color: 'white',
                    fontWeight: 'bold' 
                  }} 
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                River discharge: {alert.discharge.toFixed(1)} m³/s
              </Typography>
            </Paper>
          ))}
        </Box>
        
        <Box display="flex" justifyContent="flex-end" mt={1}>
          <Chip 
            label="Live Monitoring" 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default FloodCard;