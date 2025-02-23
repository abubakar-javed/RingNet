import React, { useState } from 'react';
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

interface Notification {
  id: string;
  type: 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
}

const Notifications = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'Earthquake',
      title: 'High Magnitude Earthquake Alert',
      message: 'Magnitude 6.2 earthquake detected in Nepal region',
      severity: 'high',
      timestamp: '2024-03-20T10:30:00Z',
      isRead: false
    },
    {
      id: '2',
      type: 'Tsunami',
      title: 'Tsunami Warning',
      message: 'Potential tsunami threat detected in Indonesian waters',
      severity: 'high',
      timestamp: '2024-03-20T09:15:00Z',
      isRead: true
    },
    {
      id: '3',
      type: 'Flood',
      title: 'Flood Alert',
      message: 'Rising water levels in Bangladesh coastal areas',
      severity: 'medium',
      timestamp: '2024-03-19T23:45:00Z',
      isRead: false
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Earthquake': return <EarthquakeIcon sx={{ color: '#cf1322' }} />;
      case 'Tsunami': return <TsunamiIcon sx={{ color: '#d46b08' }} />;
      case 'Flood': return <FloodIcon sx={{ color: '#096dd9' }} />;
      case 'Heatwave': return <HeatwaveIcon sx={{ color: '#d46b08' }} />;
      default: return <HazardIcon />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const filteredNotifications = activeTab === 0 
    ? notifications 
    : activeTab === 1 
    ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.isRead);

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
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              {index > 0 && <Divider />}
              <ListItem
                sx={{
                  p: 2,
                  backgroundColor: notification.isRead ? 'transparent' : '#fff5f5',
                  '&:hover': {
                    backgroundColor: '#f8fafc'
                  }
                }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!notification.isRead && (
                      <IconButton 
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{ color: '#bc1a1a' }}
                      >
                        <ReadIcon />
                      </IconButton>
                    )}
                    <IconButton 
                      onClick={() => handleDelete(notification.id)}
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
                        {notification.title}
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
                        {new Date(notification.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Notifications;