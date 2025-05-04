import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, Typography, Chip, IconButton, CircularProgress } from '@mui/material';
import {
  MyLocation as LocationIcon,
  Warning as HazardIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  // Tsunami as TsunamiIcon,
  // WaterDrop as FloodIcon,
  // Thermostat as HeatwaveIcon,
  // Public as EarthquakeIcon
} from '@mui/icons-material';
import axios from 'axios';

// Set the access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Hazard {
  id: string;
  type: 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave';
  location: [number, number]; // [longitude, latitude]
  severity: 'error' | 'warning' | 'info';
  details: string;
  timestamp: Date;
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
  severity: alert.severity as 'error' | 'warning' | 'info',
  location: [alert.coordinates.longitude, alert.coordinates.latitude],
  details: alert.details,
  timestamp: new Date(alert.timestamp)
});

// Function to check if two coordinates are very close to each other
// const areCoordinatesClose = (coord1: [number, number], coord2: [number, number], threshold = 0.005): boolean => {
//   const [lon1, lat1] = coord1;
//   const [lon2, lat2] = coord2;
  
//   // Calculate the approximate distance
//   const latDiff = Math.abs(lat1 - lat2);
//   const lonDiff = Math.abs(lon1 - lon2);
  
//   return latDiff < threshold && lonDiff < threshold;
// };

// Function to create a spiral pattern for spreading out markers
const spiralOffset = (index: number, spiralSpread = 0.0005): [number, number] => {
  // Create a spiral pattern with increasing distance
  const angle = index * 2.5; // Angle in radians
  const radius = spiralSpread * index; // Increasing radius
  
  const offsetLng = radius * Math.cos(angle);
  const offsetLat = radius * Math.sin(angle);
  
  return [offsetLng, offsetLat];
};

const Map = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Function to format date
  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to get marker color based on severity
  const getMarkerColor = (severity: string): string => {
    switch (severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#3b82f6';
    }
  };

  // Function to get hazard icon based on type
  // const getHazardIcon = (type: string) => {
  //   switch (type) {
  //     case 'Earthquake': return <EarthquakeIcon sx={{ color: '#ef4444' }} />;
  //     case 'Tsunami': return <TsunamiIcon sx={{ color: '#f59e0b' }} />;
  //     case 'Flood': return <FloodIcon sx={{ color: '#3b82f6' }} />;
  //     case 'Heatwave': return <HeatwaveIcon sx={{ color: '#f59e0b' }} />;
  //     default: return <HazardIcon />;
  //   }
  // };

  // Fetch all alerts for the map
  useEffect(() => {
    const fetchMapAlerts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/alerts/map-alerts`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Convert alerts to hazards format
        const alertHazards = response.data.alerts?.map(alertToHazard) || [];
        setHazards(alertHazards);
        console.log(`Fetched ${alertHazards.length} alerts for map`);
      } catch (error) {
        console.error('Error fetching alerts for map:', error);
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchMapAlerts();
  }, []);

  // Initialize map and add user location
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on South Asia
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

          // Fly to user location when it's available
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 8,
              speed: 1.2
            });

            // Add user location marker with custom style
            const userMarkerElement = document.createElement('div');
            userMarkerElement.className = 'user-location-marker';
            userMarkerElement.style.width = '24px';
            userMarkerElement.style.height = '24px';
            userMarkerElement.style.borderRadius = '50%';
            userMarkerElement.style.backgroundColor = '#bc1a1a';
            userMarkerElement.style.border = '3px solid white';
            userMarkerElement.style.boxShadow = '0 0 10px rgba(188, 26, 26, 0.6)';
            userMarkerElement.style.cursor = 'pointer';

            new mapboxgl.Marker(userMarkerElement)
              .setLngLat([longitude, latitude])
              .setPopup(new mapboxgl.Popup().setHTML(`
                <h3>Your Location</h3>
                <p>Latitude: ${latitude.toFixed(4)}, Longitude: ${longitude.toFixed(4)}</p>
              `))
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

  // Add hazard markers when hazards are loaded
  useEffect(() => {
    if (!map.current || hazards.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Track nearby hazards to spread them out
    const processedCoordinates: [number, number][] = [];
    const coordinateGroups: Record<string, number[]> = {};
    
    // Group alerts by location
    hazards.forEach((hazard, index) => {
      const locationKey = `${hazard.location[0].toFixed(4)},${hazard.location[1].toFixed(4)}`;
      
      if (!coordinateGroups[locationKey]) {
        coordinateGroups[locationKey] = [];
      }
      
      coordinateGroups[locationKey].push(index);
    });

    // Create markers with appropriate offsets for each hazard
    hazards.forEach((hazard, hazardIndex) => {
      const locationKey = `${hazard.location[0].toFixed(4)},${hazard.location[1].toFixed(4)}`;
      const group = coordinateGroups[locationKey] || [];
      const groupIndex = group.indexOf(hazardIndex);
      
      let offsetLocation: [number, number] = [...hazard.location];
      
      // Apply offset if there's more than one marker at this location
      if (group.length > 1 && groupIndex > 0) {
        const [offsetLng, offsetLat] = spiralOffset(groupIndex);
        offsetLocation = [hazard.location[0] + offsetLng, hazard.location[1] + offsetLat];
      }
      
      const el = document.createElement('div');
      el.className = 'hazard-marker';
      el.style.backgroundColor = getMarkerColor(hazard.severity);
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.cursor = 'pointer';
      
      // Add a small indicator if this marker has been offset
      if (offsetLocation[0] !== hazard.location[0] || offsetLocation[1] !== hazard.location[1]) {
        el.style.background = `radial-gradient(circle at center, ${getMarkerColor(hazard.severity)} 70%, white 70%, ${getMarkerColor(hazard.severity)} 75%)`;
      }

      // Create popup with detailed information
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        maxWidth: '300px'
      }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="margin-top: 0; font-weight: 600; color: #1f2937;">${hazard.type} Alert</h3>
          <p style="margin: 5px 0;"><strong>Location:</strong> ${hazard.location[1].toFixed(4)}, ${hazard.location[0].toFixed(4)}</p>
          <p style="margin: 5px 0;"><strong>Severity:</strong> ${hazard.severity.toUpperCase()}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${formatDate(hazard.timestamp)}</p>
          <p style="margin: 5px 0;"><strong>Details:</strong> ${hazard.details}</p>
          ${offsetLocation[0] !== hazard.location[0] ? '<p style="margin: 5px 0; font-style: italic; font-size: 0.85em; color: #666;">*Marker position slightly adjusted to prevent overlap</p>' : ''}
        </div>
      `);

      // Create marker and add to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat(offsetLocation)
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.getPopup()?.addTo(map.current!);
      });

      // Hide popup on leave
      el.addEventListener('mouseleave', () => {
        marker.getPopup()?.remove();
      });

      // Keep track of markers for cleanup
      markersRef.current.push(marker);
      processedCoordinates.push(offsetLocation);
    });
  }, [hazards, map.current]);

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
          Hazard Map View
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Showing all alerts from the past 3 days
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<HazardIcon sx={{ color: '#ef4444' }} />}
            label="High Risk"
            sx={{ bgcolor: '#fef2f2', color: '#ef4444' }}
          />
          <Chip
            icon={<HazardIcon sx={{ color: '#f59e0b' }} />}
            label="Medium Risk"
            sx={{ bgcolor: '#fffbeb', color: '#f59e0b' }}
          />
          <Chip
            icon={<HazardIcon sx={{ color: '#3b82f6' }} />}
            label="Low Risk"
            sx={{ bgcolor: '#eff6ff', color: '#3b82f6' }}
          />
          <Chip
            icon={<LocationIcon sx={{ color: '#bc1a1a' }} />}
            label="Your Location"
            sx={{ bgcolor: '#fff5f5', color: '#bc1a1a' }}
          />
        </Box>
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Loading alerts...</Typography>
          </Box>
        )}
        {error && (
          <Typography variant="body2" color="error" mt={2}>
            {error}
          </Typography>
        )}
        {!loading && !error && (
          <Typography variant="body2" mt={2}>
            {hazards.length} alerts displayed
          </Typography>
        )}
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
          disabled={!userLocation}
        >
          <LocationIcon sx={{ color: userLocation ? '#bc1a1a' : 'grey' }} />
        </IconButton>
      </Box>

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default Map;