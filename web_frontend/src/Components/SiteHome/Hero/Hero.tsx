import styles from './Hero.module.css';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>
        Stay Informed, Stay Safe with <span className={styles.titleHighlight}> RingNet</span>
        </h1>
        <p className={styles.subtitle}>
        RingNet is your AI-powered platform for staying ahead of emergencies. Our intelligent system continuously monitors your locality, providing instant alerts on natural disasters, protests, disease outbreaks, and more. Using advanced web scraping, satellite imaging, and AI-driven predictions, we ensure you receive timely and relevant information to keep you and your community safe.
        </p>
        <div className={styles.ctaContainer}>
          <Button 
            variant="contained"
            size='medium' 
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#bc1a1a',
              color: 'white',
              borderRadius: '0.5rem',
              transition: 'transform 0.2s',
              padding: '0.5rem 1rem',
              '&:hover': {
                bgcolor: '#bc1a1a',
                transform: 'translateY(-2px)',
                cursor: 'pointer'
              }
            }}
          >
            Start Getting Alerts
          </Button>
          <Button 
            variant="outlined" 
            size='medium'  
            href='#contact-section'
            sx={{
              bgcolor: 'transparent',
              border: '2px solid #bc1a1a',
              color: '#bc1a1a',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              transition: 'transform 0.2s',
              '&:hover': {
                border: '2px solid #bc1a1a',
                transform: 'translateY(-2px)',
                cursor: 'pointer'
              }
            }}
          >
            Contact Us
          </Button>
        </div>
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>5+</span>
            <span className={styles.statLabel}>Data Sources</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>60%</span>
            <span className={styles.statLabel}>Time efficient</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>24/7</span>
            <span className={styles.statLabel}>Automated Monitoring</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
