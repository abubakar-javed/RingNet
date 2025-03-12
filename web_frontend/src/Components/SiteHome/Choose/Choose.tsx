import styles from './Choose.module.css';

const Choose = () => {
    return (
        <section className={styles.chooseContainer}>
            <div className={styles.chooseContent}>
                <div className={styles.leftContent}>
                    <div className={styles.decorativeCircle}>
                        <div className={styles.star}>★</div>
                    </div>
                    <div className={`${styles.decorativeCircle} ${styles.decorativeCircle2}`}>
                        <div className={styles.star}>★</div>
                    </div>
                </div>
                <div className={styles.rightContent}>
                    <h2 className={styles.title}>Why you should choose <span className={styles.highlight}>RingNet</span></h2>
                    
                    <div className={styles.features}>
                        <div className={styles.featureItem}>
                            <h3>Real-Time Alerts</h3>
                            <p>Stay ahead of emergencies with instant notifications about earthquakes, floods, heatwaves, and other critical situations in your area.</p>
                        </div>

                        <div className={styles.featureItem}>
                            <h3>24/7 Monitoring</h3>
                            <p>Our intelligent system continuously analyzes data sources, providing non-stop surveillance to keep you informed at all times.</p>
                        </div>

                        <div className={styles.featureItem}>
                            <h3>AI-Powered Predictions</h3>
                            <p>Leveraging advanced AI models, we predict potential disasters based on real-time data, helping communities prepare in advance.</p>
                        </div>

                        <div className={styles.featureItem}>
                            <h3>Comprehensive Coverage</h3>
                            <p>We aggregate information from multiple sources, including satellites, sensors, and news reports, to provide the most accurate updates.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Choose;