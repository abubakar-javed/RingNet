import  { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon
} from '@mui/icons-material';

interface HistoricalEvent {
  id: string;
  type: 'Earthquake' | 'Tsunami' | 'Flood' | 'Heatwave';
  location: string;
  date: string;
  magnitude: string;
  impact: 'High' | 'Medium' | 'Low';
  details: string;
}

const HistoricalData = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');

  const historicalEvents: HistoricalEvent[] = [
    {
      id: '1',
      type: 'Earthquake',
      location: 'Nepal, Kathmandu',
      date: '2024-01-15',
      magnitude: '6.2',
      impact: 'High',
      details: 'Major seismic activity'
    },
    {
      id: '2',
      type: 'Tsunami',
      location: 'Indonesia, Jakarta',
      date: '2024-02-20',
      magnitude: '5.0',
      impact: 'Medium',
      details: 'Coastal areas affected'
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Earthquake': return <EarthquakeIcon sx={{ color: '#cf1322' }} />;
      case 'Tsunami': return <TsunamiIcon sx={{ color: '#d46b08' }} />;
      case 'Flood': return <FloodIcon sx={{ color: '#096dd9' }} />;
      case 'Heatwave': return <HeatwaveIcon sx={{ color: '#d46b08' }} />;
      default: return null;
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ReportsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Historical Data
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0'
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            select
            label="Hazard Type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="earthquake">Earthquake</MenuItem>
            <MenuItem value="tsunami">Tsunami</MenuItem>
            <MenuItem value="flood">Flood</MenuItem>
            <MenuItem value="heatwave">Heatwave</MenuItem>
          </TextField>

          <TextField
            select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2023">2023</MenuItem>
            <MenuItem value="2022">2022</MenuItem>
          </TextField>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Magnitude</TableCell>
                <TableCell>Impact</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historicalEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEventIcon(event.type)}
                      <Typography>{event.type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                  <TableCell>{event.magnitude}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.impact}
                      size="small"
                      sx={{
                        bgcolor: event.impact === 'High' ? '#fef2f2' : 
                                event.impact === 'Medium' ? '#fff7ed' : '#f0f9ff',
                        color: event.impact === 'High' ? '#ef4444' : 
                               event.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
                      }}
                    />
                  </TableCell>
                  <TableCell>{event.details}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default HistoricalData;