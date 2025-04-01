import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchUserFloodData = async () => {
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
      console.log('currentLocation', currentLocation);
      const response = await axios.get(`${API_BASE_URL}/api/flood/user/floods`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude
        }
      });
      return response.data;
    } catch (geoError) {
      console.log("Could not get current location:", geoError);
      // Fall back to API call without location
      const response = await axios.get(`${API_BASE_URL}/api/flood/user/floods`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching user flood data:', error);
    throw error;
  }
};

export const fetchFloodAlerts = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/floods/user/alerts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching flood alerts:', error);
    throw error;
  }
};