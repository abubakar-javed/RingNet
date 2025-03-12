import  { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Alert } from '@mui/material';
import WavesIcon from '@mui/icons-material/Waves';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define interfaces for type safety
interface TsunamiAlert {
  title: string;
  date: string;
  message: string;
  severity: 'Severe' | 'High' | 'Moderate' | 'Low';
  distance?: number;
  link?: string;
}

interface TsunamiData {
  location?: {
    latitude: number;
    longitude: number;
  };
  alerts: TsunamiAlert[];
}

const severityColors: Record<string, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
  'Severe': 'error',
  'High': 'warning',
  'Moderate': 'info',
  'Low': 'success'
};

const TsunamiWidget = () => {
  const [tsunamiData, setTsunamiData] = useState<TsunamiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTsunamiAlerts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        const response = await axios.get(`${API_BASE_URL}/api/tsunami/user/alerts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setTsunamiData(response.data);
        console.log("tsunami data",response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tsunami data:', err);
        setError('Failed to load tsunami data');
      } finally {
        setLoading(false);
      }
    };

    fetchTsunamiAlerts();
  }, []);

  if (loading) {
    return (
      <Card sx={{ minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ minHeight: 200 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <WavesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tsunami Alerts
          </Typography>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minHeight: 200 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <WavesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Tsunami Alerts
        </Typography>
        
        {tsunamiData && tsunamiData.alerts && tsunamiData.alerts.length > 0 ? (
          <Box>
            {tsunamiData.alerts.map((alert, index) => (
              <Box key={index} sx={{ mb: 2, p: 1, borderRadius: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">{alert.title}</Typography>
                  <Chip 
                    label={alert.severity} 
                    color={severityColors[alert.severity] || 'default'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(alert.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">{alert.message}</Typography>
                {alert.distance && (
                  <Typography variant="body2" color="text.secondary">
                    Distance: {Math.round(alert.distance)} km
                  </Typography>
                )}
                {alert.link && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <a href={alert.link} target="_blank" rel="noopener noreferrer">
                      More information
                    </a>
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
            <Typography variant="body1" color="text.secondary">
              No tsunami alerts for your area
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TsunamiWidget;