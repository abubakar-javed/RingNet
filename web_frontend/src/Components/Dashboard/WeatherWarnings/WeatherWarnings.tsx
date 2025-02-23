import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import {
  Warning as WarningIcon,
  Thermostat as HeatwaveIcon,
  WaterDrop as FloodIcon,
  Public as EarthquakeIcon,
} from '@mui/icons-material';

interface Warning {
  icon: React.ReactElement;
  region: string;
  warning: string;
  details: string;
  severity: 'high' | 'medium' | 'low';
}

const WeatherWarnings = () => {
  const warnings: Warning[] = [
    {
      icon: <HeatwaveIcon />,
      region: 'South Asia',
      warning: 'Heatwave expected',
      details: 'Temperatures exceeding 40°C expected',
      severity: 'high'
    },
    {
      icon: <FloodIcon />,
      region: 'Southeast Asia',
      warning: 'Coastal flood warnings',
      details: 'High tide levels predicted',
      severity: 'medium'
    },
    {
      icon: <EarthquakeIcon />,
      region: 'Pacific region',
      warning: 'Seismic activity monitoring',
      details: 'Multiple aftershocks detected',
      severity: 'low'
    }
  ];

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3, 
        borderRadius: 2,
        mb: 3,
        border: '1px solid #fad4d4',
        background: 'linear-gradient(to right, #fff5f5, #ffffff)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <WarningIcon sx={{ color: '#d46b08' }} />
        <Typography variant="h6" fontWeight={600} color="#1f2937">
          Active Weather Warnings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {warnings.map((warning, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid #f0f0f0',
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateX(4px)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderColor: '#fad4d4'
              }
            }}
          >
            <Box sx={{ 
              p: 1,
              borderRadius: '50%',
              bgcolor: warning.severity === 'high' ? 'rgba(239, 68, 68, 0.1)' : 
                       warning.severity === 'medium' ? 'rgba(245, 158, 11, 0.1)' :
                       'rgba(59, 130, 246, 0.1)',
            }}>
              {React.cloneElement(warning.icon, { 
                sx: { 
                  color: warning.severity === 'high' ? '#ef4444' : 
                         warning.severity === 'medium' ? '#f59e0b' : 
                         '#3b82f6',
                  fontSize: 24 
                } 
              })}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="subtitle1" fontWeight={600} color="#1f2937">
                  {warning.warning}
                </Typography>
                <Chip 
                  label={warning.severity.toUpperCase()} 
                  size="small"
                  sx={{ 
                    bgcolor: warning.severity === 'high' ? '#fef2f2' : 
                             warning.severity === 'medium' ? '#fffbeb' : 
                             '#eff6ff',
                    color: warning.severity === 'high' ? '#ef4444' : 
                           warning.severity === 'medium' ? '#f59e0b' : 
                           '#3b82f6',
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              <Typography variant="body2" color="#4b5563" mb={0.5}>
                {warning.details}
              </Typography>
              <Typography variant="caption" color="#6b7280">
                Region: {warning.region}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default WeatherWarnings;