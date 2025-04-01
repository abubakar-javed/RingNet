import { Box, Typography, Grid, Paper, Chip } from '@mui/material';


interface EmergencyContact {
  dept: string;
  contact: string;
  status: 'Available' | 'Busy';
}

const RegionalStats = () => {

  const emergencyContacts: EmergencyContact[] = [
    { dept: 'Rescue 1122', contact: '1122', status: 'Available' },
    { dept: 'PMD Islamabad', contact: '051-9250360', status: 'Available' },
    { dept: 'NDMA Control Room', contact: '051-111-157-157', status: 'Available' },
    { dept: 'ICT Police', contact: '15', status: 'Available' }
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {/* <Grid item xs={12} md={6}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            height: '100%'
          }}
        >
          <Typography variant="h6" fontWeight={600} color="#1f2937" mb={2}>
            Regional Statistics
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {stats.map((stat, index) => (
              <Box 
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: '#f8fafc'
                }}
              >
                <Typography variant="body2" color="#4b5563">
                  {stat.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: stat.trend.startsWith('+') ? '#22c55e' : '#ef4444',
                      fontWeight: 500
                    }}
                  >
                    {stat.trend}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid> */}

      <Grid item xs={12} md={12}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e2e8f0',
            height: '100%'
          }}
        >
          <Typography variant="h6" fontWeight={600} color="#1f2937" mb={2}>
            Emergency Contacts
          </Typography>
          {emergencyContacts.map((contact, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: 1,
                bgcolor: '#f8fafc',
                mb: 2
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="#1f2937">
                  {contact.dept}
                </Typography>
                <Typography variant="body2" color="#4b5563">
                  {contact.contact}
                </Typography>
              </Box>
              <Chip 
                label={contact.status}
                size="small"
                sx={{
                  bgcolor: contact.status === 'Available' ? '#f0fdf4' : '#fef2f2',
                  color: contact.status === 'Available' ? '#22c55e' : '#ef4444',
                  fontWeight: 500
                }}
              />
            </Box>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RegionalStats;