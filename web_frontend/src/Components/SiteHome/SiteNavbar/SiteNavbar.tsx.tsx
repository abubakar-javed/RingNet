import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';
import logo from '/logo.png';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const SiteNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

 
 

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/site" className={styles.logo}>
          <img src={logo} height={"60px"} width={"90px"} alt="Ringnet" className={styles.logo} />
        </Link>


        <Link to="/login" className={`${styles.ctaButton} ${styles.authButton}`}>
          Get Started <span className={styles.arrow}>↗</span>
        </Link>
        <button className={styles.menuButton} onClick={toggleMenu}>
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
    </nav>
  );
};

export default SiteNavbar;
