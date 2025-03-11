import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  NotificationsNone as AlertIcon
} from '@mui/icons-material';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    location: 'New York, USA',
    description: 'Software Engineer',
    alertPreferences: ['Earthquakes', 'Tsunamis', 'Floods'],
    responsibleRegions: ['South Asia', 'Southeast Asia', 'Pacific Region']
  });

  const handleInputChange = (field: keyof typeof profile) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    // API call simulation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setLoading(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="#1f2937">
          Profile Settings
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleTimeString()}
        </Typography>
      </Box>

      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          mb: 3,
          border: '1px solid #e2e8f0',
          background: '#ffffff',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          gap: 3,
          pb: 3,
          mb: 3,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              background: "#bc1a1a",
              fontSize: '1.75rem'
            }}
          >

            {`${profile.firstName[0]}${profile.lastName[0]}`}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 1 }}>
              {`${profile.firstName} ${profile.lastName}`}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
              {profile.description} 
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {profile.responsibleRegions.map((region) => (
                <Chip 
                  key={region}
                  label={region}
                  size="small"
                  sx={{ 
                    bgcolor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #e2e8f0',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
            sx={{
              background: '#bc1a1a',
              '&:hover': { 
                background: '#bc1a1f'
              },
              px: 3
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> :
              isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} color="#1f2937" mb={3}>
              Personal Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="First Name"
                value={profile.firstName}
                onChange={handleInputChange('firstName')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={profile.lastName}
                onChange={handleInputChange('lastName')}
                disabled={!isEditing}
                fullWidth
              />
              <TextField
                label="Email"
                value={profile.email}
                onChange={handleInputChange('email')}
                disabled={!isEditing}
                fullWidth
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: '#bc1a1a' }} />
                }}
              />
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={handleInputChange('phone')}
                disabled={!isEditing}
                fullWidth
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: '#bc1a1a' }} />
                }}
              />
              <TextField
                label="Location"
                value={profile.location}
                onChange={handleInputChange('location')}
                disabled={!isEditing}
                fullWidth
                InputProps={{
                  startAdornment: <LocationIcon sx={{ mr: 1, color: '#bc1a1a' }} />
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight={600} color="#1f2937" mb={3}>
              Alert Preferences
            </Typography>
            <Box sx={{ 
              p: 2.5,
              borderRadius: 2,
              border: '1px solid #e2e8f0',
              bgcolor: '#f8fafc'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AlertIcon sx={{ color: '#bc1a1a' }} />
                <Typography variant="subtitle1" fontWeight={500}>
                  Notification Settings
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.alertPreferences.map((pref) => (
                  <Chip
                    key={pref}
                    label={pref}
                    onDelete={() => {}}
                    sx={{
                      bgcolor: 'white',
                      border: '1px solid #e2e8f0',
                      color: '#bc1a1a',
                      '& .MuiChip-deleteIcon': {
                        color: '#bc1a1a',
                        '&:hover': { color: '#1e40af' }
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;