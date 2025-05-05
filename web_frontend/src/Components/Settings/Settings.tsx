import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  
  Palette as ThemeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

const switchStyle = {
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#bc1a1a',
    '&:hover': {
      backgroundColor: 'rgba(188, 26, 26, 0.08)',
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#bc1a1a',
  },
};

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      alertThreshold: 'medium',
    },
    display: {
      darkMode: false,
      language: 'en',
      timezone: 'UTC+0',
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
    }
  });

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: event.target.checked
      }
    }));
  };

  const handleSettingChange = (section: string, key: string) => (event: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
      }
    }));
  };

  return (
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h5" fontWeight={600} color="#1f2937" mb={3}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <NotificationsIcon sx={{ color: '#bc1a1a' }} />
                <Typography variant="h6" fontWeight={600} color="#1f2937">
                  Notification Preferences
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={handleNotificationChange('email')}
                      sx={switchStyle}
                    />
                  }
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={handleNotificationChange('push')}
                      sx={switchStyle}
                    />
                  }
                  label="Push Notifications"
                />
                {/* <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.sms}
                      onChange={handleNotificationChange('sms')}
                      sx={switchStyle}
                    />
                  }
                  label="SMS Alerts"
                /> */}
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="#4b5563" mb={1}>
                    Alert Threshold
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={settings.notifications.alertThreshold}
                    onChange={handleSettingChange('notifications', 'alertThreshold')}
                  >
                    <MenuItem value="low">Low (All Alerts)</MenuItem>
                    <MenuItem value="medium">Medium (Important Alerts)</MenuItem>
                    <MenuItem value="high">High (Critical Alerts Only)</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Display Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ThemeIcon sx={{ color: '#bc1a1a' }} />
                <Typography variant="h6" fontWeight={600} color="#1f2937">
                  Display Settings
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* <FormControlLabel
                  control={
                    <Switch
                      checked={settings.display.darkMode}
                      onChange={handleSettingChange('display', 'darkMode')}
                      sx={switchStyle}
                    />
                  }
                  label="Dark Mode"
                /> */}
                
                <Box>
                  <Typography variant="subtitle2" color="#4b5563" mb={1}>
                    Language
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={settings.display.language}
                    onChange={handleSettingChange('display', 'language')}
                  >
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="#4b5563" mb={1}>
                    Timezone
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={settings.display.timezone}
                    onChange={handleSettingChange('display', 'timezone')}
                  >
                    <MenuItem value="UTC+0">UTC+0</MenuItem>
                    <MenuItem value="UTC+5.5">UTC+5.5 (IST)</MenuItem>
                    <MenuItem value="UTC+8">UTC+8 (CST)</MenuItem>
                  </Select>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 2,
                border: '1px solid #e2e8f0',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SecurityIcon sx={{ color: '#bc1a1a' }} />
                <Typography variant="h6" fontWeight={600} color="#1f2937">
                  Security Settings
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactor}
                        onChange={handleSettingChange('security', 'twoFactor')}
                        sx={switchStyle}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="#4b5563" mb={1}>
                    Session Timeout (minutes)
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={handleSettingChange('security', 'sessionTimeout')}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: '#bc1a1a',
              '&:hover': {
                bgcolor: '#2563eb'
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
  );
};

export default Settings;