import styles from './Success.module.css';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Success = () => {
    const navigate = useNavigate();
    return (
        <section className={styles.successContainer}>
            <div className={styles.successContent}>
                <div className={styles.textContent}>
                    <h2 className={styles.title}>Stay Informed, Stay Safe</h2>
                    <p className={styles.subtitle}>
                        Concerned about sudden disasters and local emergencies?
                        Let RingNet keep you updated with real-time alerts and critical information.
                    </p>
                    <p className={styles.subtitle}>
                        Our AI-powered platform continuously monitors and analyzes multiple data sources
                        to provide instant updates on earthquakes, floods, heatwaves, and other emergencies.
                    </p>
                </div>

                <div className={styles.metricsContainer}>
                    <div className={styles.metricsItem}>
                        <label>Emergency Alert Analytics</label>
                        <div className={styles.metricBar}>
                            <span className={styles.metricLabel}>Faster Alert Notifications</span>
                            <span className={styles.metricValue}>85%</span>
                            <div className={`${styles.metricProgress} ${styles.applications}`} style={{ width: '85%' }} />
                        </div>
                        <div className={styles.metricBar}>
                            <div className={`${styles.metricProgress} ${styles.matches}`} style={{ width: '70%' }} />
                            <span className={styles.metricLabel}>Accurate Disaster Predictions</span>
                            <span className={styles.metricValue}>70%</span>
                        </div>
                        <div className={styles.metricBar}>
                            <div className={`${styles.metricProgress} ${styles.responses}`} style={{ width: '60%' }} />
                            <span className={styles.metricLabel}>Improved Response Time</span>
                            <span className={styles.metricValue}>60%</span>
                        </div>
                    </div>
                    <div className={styles.actionButtons}>
                        <Button 
                            variant="contained"
                            size="small"
                            onClick={() => navigate('/login')}
                            sx={{
                                bgcolor: '#bc1a1a',
                                fontSize: '0.65rem',
                                color: 'white',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    bgcolor: '#bc1a1a',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Get Alerts Now
                        </Button>
                        <Button 
                            variant="contained"
                            size="small"
                            onClick={() => navigate('/login')}
                            sx={{
                                bgcolor: '#f3f4f6',
                                fontSize: '0.65rem',
                                padding: '0.5rem 0.5rem',
                                color: '#1f2937',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    bgcolor: '#f3f4f6',
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            View Analytics
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Success;
