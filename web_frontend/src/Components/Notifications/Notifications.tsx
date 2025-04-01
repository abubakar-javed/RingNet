import React, { useState, useEffect } from 'react';
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
  Tabs
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as HazardIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
  Delete as DeleteIcon,
  CheckCircle as ReadIcon
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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/notifications/user-notifications`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/notifications/${id}/read`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setNotifications(notifications.map(notif => 
        notif._id === id ? {...notif, status: 'Read'} : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif._id !== id));
  };

  const filteredNotifications = !notifications ? [] : 
    activeTab === 0 
      ? notifications 
      : activeTab === 1 
      ? notifications.filter(n => n.status !== 'Read')
      : notifications.filter(n => n.status === 'Read');

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <NotificationsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Notifications
        </Typography>
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
          ) : (
            filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                {index > 0 && <Divider />}
                <ListItem
                  sx={{
                    p: 2,
                    backgroundColor: notification.status !== 'Read' ? 'transparent' : '#fff5f5',
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
                          label={notification.severity.toUpperCase()}
                          sx={{
                            bgcolor: notification.severity === 'high' ? '#fef2f2' : 
                                    notification.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                            color: notification.severity === 'high' ? '#ef4444' : 
                                  notification.severity === 'medium' ? '#f59e0b' : '#22c55e',
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
    </Box>
  );
};

export default Notifications;