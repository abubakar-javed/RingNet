import { useEffect, useState } from "react";
import { Box, Alert, CircularProgress,  } from "@mui/material";
import axios from "axios";

// import { useSelector } from "react-redux";
// import { RootState } from "../State/store";
import Layout from "../Components/Layout/Layout";
import StatsCards from "../Components/Dashboard/StatsCards/StatsCards";
import HazardForecast from "../Components/Dashboard/HazardForecast/HazardForecast";
import RecentAlerts from "../Components/Dashboard/RecentAlerts/RecentAlerts";
import WeatherWarnings from "../Components/Dashboard/WeatherWarnings/WeatherWarnings";
import RegionalStats from "../Components/Dashboard/RegionalStats/RegionalStats";
import WeatherCard from '../Components/Dashboard/WeatherCard/WeatherCard';
import FloodCard from '../Components/Dashboard/FloodCard/FloodCard';
import TsunamiWidget from "../Components/Dashboard/TsunamiWidget/TsunamiWidget";



interface WeatherAlert {
  severity: string;
  start: string;
}



const DashboardPage = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [hazardStats, setHazardStats] = useState({
    earthquakes: 0,
    tsunamis: 0,
    floods: 0,
    heatwaves: 0,
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const token = useSelector((state: RootState) => state.auth.token);
  // useEffect(() => {
  //   const fetchHazardStats = async () => {
  //     try {
  //       // Simulate API delay
  //       await new Promise(resolve => setTimeout(resolve, 1000));
  //       setHazardStats(MOCK_HAZARD_STATS);
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Failed to fetch hazard data", error);
  //       setError("Failed to load hazard statistics");
  //       setLoading(false);
  //     }
  //   };

  //   fetchHazardStats();
  // }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const weatherData = await fetchUserWeather();
        
        // Update hazard stats based on user's local weather
        setHazardStats({
          earthquakes: 1,
          tsunamis: 0,
          floods: 2,
          heatwaves: weatherData.temperature > 35 ? 1 : 0,
          recentAlerts: weatherData.alerts?.map((alert: WeatherAlert) => ({
            type: 'Weather',
            severity: alert.severity,
            location: weatherData.location.placeName,
            timestamp: alert.start
          })) || []
        });
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
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

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
        <FloodCard />
        <TsunamiWidget />
        <HazardForecast />
        <RecentAlerts alerts={hazardStats?.recentAlerts || []} />
        <WeatherWarnings />
        <RegionalStats />
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

  const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/weather/user-weather`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
}

export default DashboardPage;
