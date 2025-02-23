import { useEffect, useState } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";

// import { useSelector } from "react-redux";
// import { RootState } from "../State/store";
import Layout from "../Components/Layout/Layout";
import StatsCards from "../Components/Dashboard/StatsCards/StatsCards";
import HazardForecast from "../Components/Dashboard/HazardForecast/HazardForecast";
import RecentAlerts from "../Components/Dashboard/RecentAlerts/RecentAlerts";
import WeatherWarnings from "../Components/Dashboard/WeatherWarnings/WeatherWarnings";
import RegionalStats from "../Components/Dashboard/RegionalStats/RegionalStats";



interface HazardStats {
  earthquakes: number;
  tsunamis: number;
  floods: number;
  heatwaves: number;
  recentAlerts: Array<{
    type: string;
    severity: string;
    location: string;
    timestamp: string;
  }>;
}

const MOCK_HAZARD_STATS: HazardStats = {
  earthquakes: 12,
  tsunamis: 3,
  floods: 8,
  heatwaves: 5,
  recentAlerts: [
    {
      type: "Earthquake",
      severity: "error",
      location: "Nepal, Kathmandu",
      timestamp: "2024-03-15T08:30:00Z"
    },
    {
      type: "Tsunami",
      severity: "warning",
      location: "Indonesia, Jakarta",
      timestamp: "2024-03-14T15:45:00Z"
    },
    {
      type: "Flood",
      severity: "warning",
      location: "Bangladesh, Dhaka",
      timestamp: "2024-03-14T12:20:00Z"
    },
    {
      type: "Heatwave",
      severity: "info",
      location: "India, New Delhi",
      timestamp: "2024-03-13T09:15:00Z"
    }
  ]
};

const DashboardPage = () => {
  const [hazardStats, setHazardStats] = useState<HazardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchHazardStats = async () => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHazardStats(MOCK_HAZARD_STATS);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch hazard data", error);
        setError("Failed to load hazard statistics");
        setLoading(false);
      }
    };

    fetchHazardStats();
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

        <StatsCards hazardStats={hazardStats} />
        <HazardForecast />
        <RecentAlerts alerts={hazardStats?.recentAlerts || []} />
        <WeatherWarnings />
        <RegionalStats />
      </Box>
    </Layout>
  );
};

export default DashboardPage;
