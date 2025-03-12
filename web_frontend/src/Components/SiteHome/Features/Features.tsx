import styles from './Features.module.css';

const featuresData = [
    {
        title: "Real-Time Disaster Alerts",
        description: "Stay informed with instant alerts on natural disasters in your area.",
        preview: {
            title: "Earthquake Alert",
            stats: "Magnitude 6.5 Detected",
            location: "San Francisco, CA",
            time: "2 minutes ago",
            impact: "Potential damage expected, stay cautious"
        }
    },
    {
        title: "AI-Powered Risk Assessment",
        description: "Our AI analyzes data to predict potential risks in your location.",
        preview: {
            platform: "Risk Analysis Dashboard",
            status: "Current Risk Level",
            assessment: "Moderate",
            factors: "Recent seismic activity, high tide warnings",
            recommendations: "Prepare an emergency kit, stay updated"
        }
    },
    {
        title: "Community Updates & Reports",
        description: "Receive updates from local sources and contribute reports.",
        preview: {
            latest: "Flood Warning Issued",
            severity: "High",
            source: "Meteorological Department",
            response: "Evacuation advised in affected areas",
            contributions: "100+ reports from users"
        }
    }
];

const Features = () => {
    return (
        <section className={styles.featuresContainer}>
            <h2 className={styles.mainTitle}><span className={styles.highlight}>Powerful Features</span> to Keep You Safe</h2>
            <p className={styles.subtitle}>Stay ahead with real-time emergency alerts and risk analysis</p>
            
            <div className={styles.cardContainer}>
                {featuresData.map((feature, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardContent}>
                            <div className={styles.paperPreview}>
                                {Object.entries(feature.preview).map(([key, value], idx) => (
                                    <div key={idx} className={styles.previewItem}>
                                        <span className={styles.previewLabel}>{key}:</span>
                                        <span className={styles.previewValue}>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <h3 className={styles.cardTitle}>{feature.title}</h3>
                        <p className={styles.cardDescription}>{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Features;