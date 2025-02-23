import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Divider
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Assessment as ReportsIcon,
  Public as EarthquakeIcon,
  Tsunami as TsunamiIcon,
  WaterDrop as FloodIcon,
  Thermostat as HeatwaveIcon,
} from '@mui/icons-material';

const ExportData = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [format, setFormat] = useState('csv');

  const hazardTypes = [
    { type: 'Earthquake', icon: <EarthquakeIcon sx={{ color: '#cf1322' }} /> },
    { type: 'Tsunami', icon: <TsunamiIcon sx={{ color: '#d46b08' }} /> },
    { type: 'Flood', icon: <FloodIcon sx={{ color: '#096dd9' }} /> },
    { type: 'Heatwave', icon: <HeatwaveIcon sx={{ color: '#d46b08' }} /> }
  ];

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleExport = () => {
    console.log('Exporting data...', { dateRange, selectedTypes, format });
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ReportsIcon sx={{ color: '#bc1a1a', fontSize: 28 }} />
        <Typography variant="h5" fontWeight={600} color="#1f2937">
          Export Data
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          mb: 3
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Select Hazard Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {hazardTypes.map(({ type, icon }) => (
                <Chip
                  key={type}
                  icon={icon}
                  label={type}
                  onClick={() => handleTypeToggle(type)}
                  sx={{
                    bgcolor: selectedTypes.includes(type) ? '#fef2f2' : 'transparent',
                    border: '1px solid #fad4d4',
                    color: selectedTypes.includes(type) ? '#ef4444' : '#64748b',
                    '&:hover': {
                      bgcolor: '#fff5f5'
                    }
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Date Range
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="date"
                label="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight={600} color="#1f2937" mb={2}>
              Export Format
            </Typography>
            <FormControl fullWidth>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                sx={{ bgcolor: 'white' }}
              >
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="xlsx">Excel (XLSX)</MenuItem>
                <MenuItem value="pdf">PDF Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              sx={{
                mt: 2,
                bgcolor: '#bc1a1a',
                '&:hover': {
                  bgcolor: '#a61616'
                }
              }}
            >
              Export Data
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ExportData;