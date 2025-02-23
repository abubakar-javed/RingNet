import React, { useState } from 'react';
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
