import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchCurrentWeather = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/weather/current`);
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchHistoricalWeather = async (params: {
  startDate?: string;
  endDate?: string;
  location?: string;
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/weather/historical`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    throw error;
  }
}; 