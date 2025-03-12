import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  NotificationsNone as AlertIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

// Define the profile data interface
interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  locationString: string;
  description: string;
  alertPreferences: string[];
}

// Define the allowed alert types as a constant
const ALERT_TYPES = [
  'Earthquakes',
  'Tsunamis',
  'Floods',
  'Heatwaves'
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState('');
  
  // Split the name into first and last name for display purposes
  const [profile, setProfile] = useState<ProfileData>({
    _id: '',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    locationString: 'New York, USA',
    description: 'Software Engineer',
    alertPreferences: ['Earthquakes', 'Tsunamis', 'Floods'],
  });

  // Computed properties for first and last name
  const firstName = profile.name.split(' ')[0] || '';
  const lastName = profile.name.split(' ').slice(1).join(' ') || '';

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setFetchLoading(true);
    try {
      const token = localStorage.getItem('token'); 
      console.log("token",token);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("profile data",response.data);
      // Transform backend data to match our frontend structure
      const userData = response.data;
      setProfile({
        _id: userData._id,
        name: userData.name || 'User',
        email: userData.email || '',
        phone: userData.phone || '',
        locationString: `${Math.round(userData.location.latitude * 100) / 100}, ${Math.round(userData.location.longitude * 100) / 100}` || '',
        description: userData.description || '',
        alertPreferences: userData.alertPreferences || [],
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.locationString,
        description: profile.description,
        alertPreferences: profile.alertPreferences
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlert = () => {
    if (selectedAlert && !profile.alertPreferences.includes(selectedAlert)) {
      setProfile(prev => ({
        ...prev,
        alertPreferences: [...prev.alertPreferences, selectedAlert]
      }));
      setSelectedAlert('');
      setDialogOpen(false);
    }
  };

  const handleRemoveAlert = (alertToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      alertPreferences: prev.alertPreferences.filter(alert => alert !== alertToRemove)
    }));
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#bc1a1a' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="#1f2937">
          Profile Settings
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
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
            {`${firstName[0] || ''}${lastName[0] || ''}`}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 1 }}>
              {profile.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#4b5563', mb: 2 }}>
              {profile.description} 
            </Typography>
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
                label="Full Name"
                value={profile.name}
                onChange={handleInputChange('name')}
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
                value={profile.locationString}
                onChange={handleInputChange('locationString')}
                disabled={true}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AlertIcon sx={{ color: '#bc1a1a' }} />
                  <Typography variant="subtitle1" fontWeight={500}>
                    Notification Settings
                  </Typography>
                </Box>
                {isEditing && (
                  <IconButton 
                    size="small" 
                    onClick={() => setDialogOpen(true)}
                    sx={{ color: '#bc1a1a' }}
                  >
                    <AddIcon />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {profile.alertPreferences.map((pref) => (
                  <Chip
                    key={pref}
                    label={pref}
                    onDelete={isEditing ? () => handleRemoveAlert(pref) : undefined}
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
                {profile.alertPreferences.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No alert preferences set. {isEditing && 'Click the + button to add some.'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog for adding new alert preferences - updated to use Select instead of TextField */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Alert Preference</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="alert-type-label">Alert Type</InputLabel>
            <Select
              labelId="alert-type-label"
              value={selectedAlert}
              label="Alert Type"
              onChange={(e) => setSelectedAlert(e.target.value)}
              fullWidth
            >
              {ALERT_TYPES
                .filter(type => !profile.alertPreferences.includes(type))
                .map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddAlert} 
            color="primary" 
            variant="contained" 
            disabled={!selectedAlert}
            sx={{ bgcolor: '#bc1a1a', '&:hover': { bgcolor: '#a51717' } }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;