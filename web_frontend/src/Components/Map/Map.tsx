import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, Typography, Chip, IconButton } from '@mui/material';
import {
  MyLocation as LocationIcon,
  Warning as HazardIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Set the access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Hazard {
  id: string;
  type: 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave';
  location: [number, number]; // [longitude, latitude]
  severity: 'high' | 'medium' | 'low';
  details: string;
}

interface Alert {
  _id: string;
  type: string;
  severity: string;
  location: string;
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  details: string;
}

// Convert Alert to Hazard format
const alertToHazard = (alert: Alert): Hazard => ({
  id: alert._id,
  type: alert.type as 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave',
  severity: alert.severity as 'high' | 'medium' | 'low',
  location: [alert.coordinates.longitude, alert.coordinates.latitude],
  details: alert.details
});

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/alerts/user-alerts');
        
        // Convert alerts to hazards format
        const alertHazards = response.data.alerts?.map(alertToHazard);
        console.log("alertHazards",alertHazards);
        setHazards(alertHazards);
      } catch (error) {
        console.error('Error fetching alerts for map:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Add hazard markers
    hazards.forEach(hazard => {
      const el = document.createElement('div');
      el.className = 'hazard-marker';
      el.style.backgroundColor = hazard.severity === 'high' ? '#ef4444' : 
                                hazard.severity === 'medium' ? '#f59e0b' : '#3b82f6';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

      new mapboxgl.Marker(el)
        .setLngLat(hazard.location)
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3>${hazard.type}</h3>
          <p>${hazard.details}</p>
        `))
        .addTo(map.current!);
    });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Islamabad
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [85, 23], // Centered on South Asia
      zoom: 4
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setUserLocation([longitude, latitude]);

          // Add user location marker
          if (map.current) {
            new mapboxgl.Marker({ color: '#bc1a1a' })
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
        },
        (error) => console.error('Error getting location:', error)
      );
    }

    

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, []);

  const handleZoomIn = () => {
    if (map.current) map.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (map.current) map.current.zoomOut();
  };

  const handleLocateMe = () => {
    if (map.current && userLocation) {
      map.current.flyTo({
        center: userLocation,
        zoom: 12
      });
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: 'calc(100vh - 64px)', // Subtract navbar height
      position: 'relative',
      '& .mapboxgl-map': {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    }}>
      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1,
          p: 2,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#1f2937" mb={2}>
          Hazard Map
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<HazardIcon sx={{ color: '#ef4444' }} />}
            label="High Risk Areas"
            sx={{ bgcolor: '#fef2f2', color: '#ef4444' }}
          />
          <Chip
            icon={<LocationIcon sx={{ color: '#bc1a1a' }} />}
            label="Your Location"
            sx={{ bgcolor: '#fff5f5', color: '#bc1a1a' }}
          />
        </Box>
      </Paper>

      <Box
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <IconButton
          onClick={handleZoomIn}
          sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f8fafc' } }}
        >
          <ZoomInIcon />
        </IconButton>
        <IconButton
          onClick={handleZoomOut}
          sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f8fafc' } }}
        >
          <ZoomOutIcon />
        </IconButton>
        <IconButton
          onClick={handleLocateMe}
          sx={{ bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#f8fafc' } }}
        >
          <LocationIcon sx={{ color: '#bc1a1a' }} />
        </IconButton>
      </Box>

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default Map;