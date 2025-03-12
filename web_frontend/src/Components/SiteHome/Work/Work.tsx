import styles from './Work.module.css';

const workSteps = [
  {
    title: "Collect Real-Time Data",
    description: "RingNet continuously gathers live data from multiple sources to detect potential hazards."
  },
  {
    title: "AI-Powered Risk Analysis",
    description: "Our system processes and analyzes data using machine learning to assess the severity and likelihood of disasters."
  },
  {
    title: "Instant Alerts & Updates",
    description: "Receive real-time notifications for earthquakes, floods, heatwaves, protests, and disease outbreaks in your locality."
  },
  {
    title: "Community & Safety Insights",
    description: "Stay informed with live reports, expert insights, and community updates to ensure preparedness and safety."
  }
];

const Work = () => {
  return (
    <section className={styles.workContainer}>
      <div className={styles.workContent}>
        <div className={styles.leftSection}>
          <h2 className={styles.title}>
            How <span className={styles.highlight}>RingNet</span><br />
            Works
          </h2>
          <p className={styles.subtitle}>
            Get real-time emergency alerts and safety updates, powered by AI-driven analysis.
          </p>
        </div>
        
        <div className={styles.rightSection}>
          {workSteps.map((step, index) => (
            <div key={index} className={styles.stepCard}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
