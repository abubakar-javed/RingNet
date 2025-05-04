import { useEffect, useState } from "react";
import { Box, Alert, CircularProgress,  } from "@mui/material";
import axios from "axios";

// import { useSelector } from "react-redux";
// import { RootState } from "../State/store";
import Layout from "../Components/Layout/Layout";
import StatsCards from "../Components/Dashboard/StatsCards/StatsCards";
import RecentAlerts from "../Components/Dashboard/RecentAlerts/RecentAlerts";
import WeatherCard from '../Components/Dashboard/WeatherCard/WeatherCard';
import FloodCard from '../Components/Dashboard/FloodCard/FloodCard';
import TsunamiWidget from "../Components/Dashboard/TsunamiWidget/TsunamiWidget";
import { fetchUserFloodData } from "../services/floodService";
import EmergencyContacts from "../Components/Dashboard/EmergencyContacts/EmergencyContacts";






const DashboardPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAlerts, setUserAlerts] = useState([]);
  const [floodData, setFloodData] = useState<any>(null);

 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const weatherData = await fetchUserWeather();
        console.log("weatherData",weatherData);
        setWeatherData(weatherData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setError("Failed to load weather statistics");
        setLoading(false);
      }
    };

    fetchData();
    // Set up periodic refresh if needed
    const interval = setInterval(fetchData, 30 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const getFloodData = async () => {
      try {
        setLoading(true);
        const data = await fetchUserFloodData();
        console.log("floodData",data);
        setFloodData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching flood data:', err);
        setError('Failed to load flood data');
        setFloodData({ location: { latitude: 0, longitude: 0 }, clusterId: '', alerts: [] });
      } finally {
        setLoading(false);
      }
    };

    getFloodData();
    // Refresh data every 30 minutes
    const intervalId = setInterval(getFloodData, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    const fetchUserAlerts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/alerts/user-alerts`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            params: {
              limit: 5 // Explicitly request only 5 alerts
            }
          }
        );
        console.log("here are recent alerts",response.data);
        // Take only the first 5 alerts as a safety measure in case the backend doesn't respect the limit
        const recentAlerts = response.data.alerts.slice(0, 5);
        setUserAlerts(recentAlerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };

    if (weatherData && floodData) {
      fetchUserAlerts();
    }
  }, [weatherData, floodData]);

 


  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ width: '100%', p: 3 }}>
        <StatsCards  />
        {weatherData && <WeatherCard weatherData={weatherData} />}
        {floodData && <FloodCard floodData={floodData} />}
        <TsunamiWidget />
        {/* <HazardForecast /> */}
        {loading ? (
          <CircularProgress />
        ) : (
          <RecentAlerts alerts={userAlerts} />
        )}
        <EmergencyContacts />
      </Box>
    </Layout>
  );
};

// Add this function to your API utilities or directly in DashboardPage
async function fetchUserWeather() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (!token || !userId) {
    throw new Error('Not authenticated');
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

    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/weather/user-weather`, {
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
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/weather/user-weather`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
}

export default DashboardPage;
