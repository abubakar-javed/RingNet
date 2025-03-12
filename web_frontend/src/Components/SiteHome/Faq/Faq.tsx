import { useState } from 'react';
import styles from './Faq.module.css';

interface FaqItem {
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  {
    question: "What is RingNet and how does it work?",
    answer: "RingNet is an AI-powered platform that provides real-time emergency alerts and updates for your locality. It collects data from satellites, sensors, and web sources to detect hazards such as earthquakes, floods, heatwaves, protests, and disease outbreaks."
  },
  {
    question: "How does RingNet detect emergencies?",
    answer: "RingNet uses machine learning and data analytics to process real-time data from multiple sources. It identifies patterns and anomalies to predict potential disasters and send timely alerts to users."
  },
  {
    question: "What types of alerts does RingNet provide?",
    answer: "RingNet provides instant notifications for various emergencies, including earthquakes, floods, extreme weather conditions, protests, and health outbreaks. It also offers live updates from official sources and community reports."
  },
  {
    question: "Can I customize the alerts I receive?",
    answer: "Yes, RingNet allows users to customize alerts based on their location and preferred alert categories. You can choose to receive notifications only for specific types of emergencies relevant to you."
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faqContainer}>
      <div className={styles.faqContent}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {faqData.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openIndex === index ? styles.active : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className={styles.questionRow}>
                <p className={styles.question}>{faq.question}</p>
                <span className={styles.icon}>{openIndex === index ? '−' : '+'}</span>
              </div>
              <div className={`${styles.answer} ${openIndex === index ? styles.show : ''}`}>
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;
