import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import styles from './Layout.module.css';
import {
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Warning as HazardIcon,
  Settings as SettingsIcon,
  Map as MapIcon
} from '@mui/icons-material';
import axios from 'axios';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: <DashboardIcon />
    },
    {
      title: 'Hazard Monitoring',
      path: '/hazards',
      icon: <HazardIcon />,
      children: [
        { title: 'Active Alerts', path: '/hazards/alerts' },
        { title: 'Historical Data', path: '/hazards/history' },
        { title: 'Export Data', path: '/reports/export' }
      ]
    },
    {
      title: 'Map View',
      path: '/map',
      icon: <MapIcon />
    },
    {
      title: 'Notifications',
      path: '/notifications',
      icon: <NotificationsIcon />
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: <PersonIcon />
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: <SettingsIcon />
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const updateUserLocation = async (latitude: number, longitude: number) => {
    try {
      const token = localStorage.getItem('token');
      console.log("latitude", latitude);
      console.log("longitude", longitude);
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/location`, 
        { location: { latitude, longitude } },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );
      console.log("Location updated successfully");
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Use watchPosition to track user location changes
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log("Position updated");
        // Update the user's location in the backend
        updateUserLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
      },
      {
        
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );
    
    // Clean up by clearing the watch when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  return (
    <div className={styles.dashboardLayout}>
      <div className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <Sidebar 
          items={navigationItems} 
          logo="/logo.png"
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
      </div>
      <div className={styles.mainContent}>
        <Navbar />
        <main className={styles.dashboardMain}>
          {children}
        </main>
      </div>
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}
    </div>
  );
};

export default Layout;
