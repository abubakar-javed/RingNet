import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchUserFloodData = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    console.log(`${API_BASE_URL}/api/flood/user/floods`);
    const response = await axios.get(`${API_BASE_URL}/api/flood/user/floods`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log("response",response.data);
    return response.data;
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