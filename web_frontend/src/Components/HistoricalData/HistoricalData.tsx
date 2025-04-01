import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem
} from '@mui/material';
import {
  Assessment as ReportsIcon,
} from '@mui/icons-material';

const HistoricalData = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024');

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

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px'
          }}
        >
          <Typography variant="body1" color="#64748b">
            No historical data to show
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default HistoricalData;