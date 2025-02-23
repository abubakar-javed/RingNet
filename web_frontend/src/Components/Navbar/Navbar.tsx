import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearToken } from '../../State/authSlice';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import { persistor } from '../../State/store';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  styled,
  Box,
  Stack,
  Menu,
  MenuItem,
  Typography,
  Button,
  ListItemIcon
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Warning as HazardIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const NotificationMenu = styled(Menu)(() => ({
  '& .MuiPaper-root': {
    width: '360px',
    maxHeight: '480px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0'
  }
}));

const Navbar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
 const [notifications] = useState([
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
    }
  ]);

  
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearToken());
    persistor.purge();
    navigate('/login');
  };

 

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    handleNotificationClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Earthquake': return <EarthquakeIcon sx={{ color: '#cf1322' }} />;
      case 'Tsunami': return <TsunamiIcon sx={{ color: '#d46b08' }} />;
      case 'Flood': return <FloodIcon sx={{ color: '#096dd9' }} />;
      case 'Heatwave': return <HeatwaveIcon sx={{ color: '#d46b08' }} />;
      default: return <HazardIcon />;
    }
  };

 const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMouseLeave = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileOptionClick = (path: string) => {
    navigate(path);
    setProfileAnchorEl(null);
  };

  return (
    <AppBar
      position="relative"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        height: '64px'
      }}
    >
      <Toolbar sx={{ height: '100%' }}>
        <Search>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: '#666' }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search..."
            sx={{
              '& .MuiInputBase-input': {
                padding: '8px 8px 8px 40px',
                borderRadius: '8px',
                bgcolor: '#f5f6fa',
                '&::placeholder': {
                  color: '#666',
                  opacity: 1
                }
              }
            }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton size="large" onClick={handleNotificationClick}>
            <Badge badgeContent={notifications.filter(n => !n.isRead).length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <NotificationMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={600}>Notifications</Typography>
            </Box>
            
            <Box sx={{ maxHeight: '320px', overflow:'visible' }}>
              {notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  sx={{
                    py: 2,
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: notification.isRead ? 'transparent' : '#fff5f5',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
                      <Box sx={{ 
                        p: 1, 
                        borderRadius: '50%', 
                        bgcolor: 'rgba(207, 19, 34, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(notification.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
              <Button 
                fullWidth 
                onClick={handleViewAllNotifications}
                sx={{ 
                  color: '#bc1a1a',
                  '&:hover': {
                    backgroundColor: '#fff5f5'
                  }
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </NotificationMenu>
          
          <Box 
            onMouseEnter={handleProfileMouseEnter}
            onMouseLeave={handleProfileMouseLeave}
          >
            <IconButton>
              <Avatar sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileMouseLeave}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  width: '200px',
                  mt: 1,
                  '& .MuiMenuItem-root': {
                    py: 1.5,
                    px: 2,
                  }
                }
              }}
              MenuListProps={{
                onMouseLeave: handleProfileMouseLeave
              }}
            >
              <MenuItem onClick={() => handleProfileOptionClick('/profile')}>
                <ListItemIcon>
                  <PersonIcon sx={{ color: '#bc1a1a' }} />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleProfileOptionClick('/')}>
                <ListItemIcon>
                  <DashboardIcon sx={{ color: '#bc1a1a' }} />
                </ListItemIcon>
                <Typography variant="body2">Dashboard</Typography>
              </MenuItem>
              <MenuItem onClick={() => handleProfileOptionClick('/hazards/alerts')}>
                <ListItemIcon>
                  <HazardIcon sx={{ color: '#bc1a1a' }} />
                </ListItemIcon>
                <Typography variant="body2">Alerts</Typography>
              </MenuItem>
            </Menu>
          </Box>
          
          <IconButton onClick={handleLogout}>
            <LogoutOutlined />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;