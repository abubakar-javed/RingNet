import styles from './Navbar.module.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '/logo.png';
import { Button, Avatar } from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const SiteNavbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleServicesClick = (e: React.MouseEvent) => {
    if (window.innerWidth <= 768) {
      e.preventDefault(); // Prevent navigation on mobile
      setIsServicesOpen(!isServicesOpen);
    }
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
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
