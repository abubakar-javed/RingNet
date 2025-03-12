import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3>Get Started</h3>
          <ul>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/login">Create Account</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} RingNet. All rights reserved.
        </div>
        <div className={styles.socialLinks}>
          <a href="#"  rel="noopener noreferrer">Twitter</a>
          <a href="#" rel="noopener noreferrer">LinkedIn</a>
          <a href="#" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
