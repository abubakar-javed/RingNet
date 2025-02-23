import { Box, Typography, Grid, Paper } from '@mui/material';
import {
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  Thermostat as HeatwaveIcon,
  Warning as HazardIcon,
} from '@mui/icons-material';

const HazardForecast = () => {
  return (
    <Paper 
      elevation={2}
      sx={{ 
        p: 3, 
        borderRadius: 2, 
        mb: 4,
        background: 'linear-gradient(to right, #ffffff, #f8f9fa)'
      }}
    >
      <Typography variant="h6" mb={3} sx={{ color: '#1a1a1a', fontWeight: 600 }}>
        10-Day Hazard Forecast
      </Typography>
      <Grid container spacing={2}>
        {/* Today's Forecast */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)',
            p: 2.5,
            borderRadius: 2,
            border: '1px solid rgba(207, 19, 34, 0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}>
            <Box>
              <Typography variant="h6" fontWeight={600} color="#2d3748" mb={1}>Today</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Box sx={{
                  bgcolor: 'rgba(207, 19, 34, 0.1)',
                  p: 1,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <EarthquakeIcon sx={{ color: '#cf1322', fontSize: 28 }} />
                </Box>
                <Typography variant="subtitle1" color="#2d3748" fontWeight={500}>
                  High Seismic Activity Warning
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <span>•</span> Magnitude Range: 4.5-5.2 expected
                <span>•</span> Depth: 10-15km
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h3" sx={{ color: '#2d3748', fontWeight: 700 }}>22°</Typography>
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 0.5,
                bgcolor: 'rgba(207, 19, 34, 0.1)',
                color: '#cf1322',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                mt: 1
              }}>
                <HazardIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight={600}>High Risk Level</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Forecast Grid */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            overflowX: 'auto', 
            pb: 1,
            '::-webkit-scrollbar': {
              height: '8px',
            },
            '::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '4px',
            },
            '::-webkit-scrollbar-thumb': {
              background: '#cbd5e0',
              borderRadius: '4px',
            }
          }}>
            {[...Array(5)].map((_, index) => (
              <Paper
                key={index}
                elevation={1}
                sx={{
                  p: 2.5,
                  minWidth: 220,
                  bgcolor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.06)'
                  }
                }}
              >
                <Typography variant="h6" mb={2} color="#2d3748" fontWeight={600}>
                  {new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000)
                    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5, 
                  mb: 2,
                  bgcolor: index % 2 === 0 ? 'rgba(9, 109, 217, 0.1)' : 'rgba(212, 107, 8, 0.1)',
                  p: 1,
                  borderRadius: 1
                }}>
                  {index % 2 === 0 ? (
                    <TsunamiIcon sx={{ color: '#096dd9', fontSize: 24 }} />
                  ) : (
                    <HeatwaveIcon sx={{ color: '#d46b08', fontSize: 24 }} />
                  )}
                </Box>
                <Typography variant="h5" color="#2d3748" fontWeight={600} mb={1}>
                  {index % 2 === 0 ? '18°' : '25°'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {index % 2 === 0 ? 'Coastal Warnings' : 'Heat Advisory'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  {index % 2 === 0 ? 'Wave Height: 2.5-3.0m' : 'Humidity: 65%'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default HazardForecast;