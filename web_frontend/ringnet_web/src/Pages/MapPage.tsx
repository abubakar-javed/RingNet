import Layout from '../Components/Layout/Layout';
import Map from '../Components/Map/Map';
import { Box } from '@mui/material';

const MapPage = () => {
  return (
    <Layout>
      <Box sx={{ 
        width: '100%', 
        height: 'calc(100vh - 64px)',
        position: 'relative'
      }}>
        <Map />
      </Box>
    </Layout>
  );
};

export default MapPage;