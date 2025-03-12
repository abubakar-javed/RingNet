import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchUserTsunamiAlerts = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/tsunami/user/alerts`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user tsunami alerts:', error);
    throw error;
  }
};

export const fetchActiveTsunamiEvents = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await axios.get(`${API_BASE_URL}/api/tsunami/active`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data.events;
  } catch (error) {
    console.error('Error fetching active tsunami events:', error);
    throw error;
  }
};