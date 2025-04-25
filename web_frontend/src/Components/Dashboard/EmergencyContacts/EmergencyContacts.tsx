import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Chip, CircularProgress } from '@mui/material';
import axios from 'axios';

interface EmergencyContact {
  dept: string;
  contact: string;
  status: 'Available' | 'Busy';
}

const EmergencyContacts = () => {
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get current user location from browser
      const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      };

      try {
        const position = await getCurrentPosition() as GeolocationPosition;
        const currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/emergency-contacts`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude
            }
          }
        );
        
        setEmergencyContacts(response.data);
      } catch (geoError) {
        console.log("Could not get current location:", geoError);
        // Fall back to API call without location
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/emergency-contacts`, 
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setEmergencyContacts(response.data);
      }
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      setError('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <CircularProgress color="primary" />
          </Paper>
        </Grid>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              height: '100%',
              color: '#ef4444'
            }}
          >
            <Typography variant="body1">{error}</Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={2} mb={3}>
      <Grid item xs={12} md={12}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            height: '100%'
          }}
        >
          <Typography variant="h6" fontWeight={600} color="#1f2937" mb={2}>
            Emergency Contacts
          </Typography>
          {emergencyContacts.length > 0 ? (
            emergencyContacts.map((contact, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                  mb: 2
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} color="#1f2937">
                    {contact.dept}
                  </Typography>
                  <Typography variant="body2" color="#4b5563">
                    {contact.contact}
                  </Typography>
                </Box>
                <Chip 
                  label={contact.status}
                  size="small"
                  sx={{
                    bgcolor: contact.status === 'Available' ? '#f0fdf4' : '#fef2f2',
                    color: contact.status === 'Available' ? '#22c55e' : '#ef4444',
                    fontWeight: 500
                  }}
                />
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="#4b5563" textAlign="center">
              No emergency contacts available for your location
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EmergencyContacts; 