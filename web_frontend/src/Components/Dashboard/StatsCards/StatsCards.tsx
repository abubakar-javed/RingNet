import React from 'react';
import { Grid, Paper, Box, Typography } from "@mui/material";
import {
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
} from '@mui/icons-material';

interface StatsCardsProps {
  hazardStats: {
    earthquakes: number;
    tsunamis: number;
    floods: number;
    heatwaves: number;
  } | null;
}

const StatsCards = ({ hazardStats }: StatsCardsProps) => {
  const stats = [
    {
      title: 'Earthquakes',
      value: hazardStats?.earthquakes || 0,
      icon: <EarthquakeIcon />,
      subtitle: 'Active seismic zones'
    },
    {
      title: 'Tsunamis',
      value: hazardStats?.tsunamis || 0,
      icon: <TsunamiIcon />,
      subtitle: 'Coastal warnings active'
    },
    {
      title: 'Floods',
      value: hazardStats?.floods || 0,
      icon: <FloodIcon />,
      subtitle: 'Regions affected'
    },
    {
      title: 'Heatwaves',
      value: hazardStats?.heatwaves || 0,
      icon: <HeatwaveIcon />,
      subtitle: 'High temperature alerts'
    }
  ];

  return (
    <Grid container spacing={2} mb={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ff4d4f 0%,rgb(90, 19, 24) 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                {React.cloneElement(stat.icon, { sx: { fontSize: 24 } })}
                <Typography variant="subtitle1" fontWeight={600}>{stat.title}</Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} mb={0.5}>
                {stat.value}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {stat.subtitle}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;