import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  IconButton,
  Tab,
  Tabs,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as HazardIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
  Delete as DeleteIcon,
  CheckCircle as ReadIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

interface Notification {
  _id: string;
  type: string;
  severity: string;
  location: string;
  message: string;
  sentAt: string;
  status: string;
}

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/user-notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Fetched notifications:', response.data);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to refresh notifications every minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60 seconds
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Earthquake': return <EarthquakeIcon sx={{ color: '#cf1322' }} />;
      case 'Tsunami': return <TsunamiIcon sx={{ color: '#d46b08' }} />;
      case 'Flood': return <FloodIcon sx={{ color: '#096dd9' }} />;
      case 'Heatwave': return <HeatwaveIcon sx={{ color: '#d46b08' }} />;
      default: return <HazardIcon />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}/read`,
        {}, // Empty body
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          notif._id === id ? {...notif, status: 'Read'} : notif
        )
      );
      
      setSuccessMessage('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      // Remove from local state first for immediate UI feedback
      setNotifications(prevNotifications => 
        prevNotifications.filter(notif => notif._id !== id)
      );
      
      // Call the backend API to delete the notification
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/notifications/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccessMessage('Notification removed successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      
      // Re-fetch notifications to ensure UI is in sync with backend
      fetchNotifications();
      
      // Show error message
      if (axios.isAxiosError(error) && error.response) {
        // Use the specific error message from the backend if available
        setError(error.response.data.message || 'Failed to delete notification');
      } else {
        setError('Failed to delete notification');
      }
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
    setSuccessMessage('Notifications refreshed');
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };

  const filteredNotifications = !notifications ? [] : 
    activeTab === 0 
      ? notifications 
      : activeTab === 1 
      ? notifications.filter(n => n.status !== 'Read')
      : notifications.filter(n => n.status === 'Read');

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
          <Typography variant="h5" fontWeight={600} color="#1f2937">
            Notifications
          </Typography>
        </Box>
        <IconButton 
          onClick={handleRefresh} 
          color="primary" 
          size="small"
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root.Mui-selected': {
              color: '#bc1a1a'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#bc1a1a'
            }
          }}
        >
          <Tab label="All" />
          <Tab label="Unread" />
          <Tab label="Read" />
        </Tabs>

        <List sx={{ p: 0 }}>
          {loading ? (
            <ListItem><ListItemText primary="Loading notifications..." /></ListItem>
          ) : !notifications || notifications.length === 0 ? (
            <ListItem><ListItemText primary="No notifications" /></ListItem>
          ) : filteredNotifications.length === 0 ? (
            <ListItem><ListItemText primary={`No ${activeTab === 1 ? 'unread' : 'read'} notifications`} /></ListItem>
          ) : (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    p: 2,
                    backgroundColor: notification.status !== 'Read' ? 'transparent' : '#f8f9fa',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    }
                  }}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {notification.status !== 'Read' && (
                        <IconButton 
                          onClick={() => handleMarkAsRead(notification._id)}
                          sx={{ color: '#bc1a1a' }}
                        >
                          <ReadIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        onClick={() => handleDelete(notification._id)}
                        sx={{ color: '#64748b' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={600} color="#1f2937">
                          {notification.location}
                        </Typography>
                        <Chip
                          size="small"
                          label={(notification.severity=="error"?"Severe":notification.severity).toUpperCase()}
                          sx={{
                            bgcolor: notification.severity === 'error' ? '#fef2f2' : 
                                    notification.severity === 'warning' ? '#fffbeb' : '#f0fdf4',
                            color: notification.severity === 'error' ? '#ef4444' : 
                                  notification.severity === 'warning' ? '#f59e0b' : '#22c55e',
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="#4b5563" mb={0.5}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="#64748b">
                          {new Date(notification.sentAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
      
      {/* Snackbar for success and error messages */}
      <Snackbar
        open={!!successMessage || !!error}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;