import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logo from "../../Assets/logo.png";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearToken } from '../../State/authSlice';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import Search from '@mui/icons-material/Search';
import { Menu, MenuItem, InputBase, IconButton } from '@mui/material';
import { persistor } from '../../State/store';
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const token = useSelector((state: any) => state.auth.token);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearToken());
    persistor.purge();
    navigate('/login');
  };

  const handleDropdownClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = () => {
    // Simulate search logic
    console.log(`Searching for: ${searchQuery}`);
    //setSearchResults([`Result for ${searchQuery}`]); // Example response
  };

  return (
    <>
      <div className="nav">
        <nav className={`${styles.navbar} navbar`}>
          
            <button className={styles.menuButton} onClick={toggleSidebar}>&#9776;</button>
            <button className={styles.logoButton}>
              <img src={logo} alt="RingNet Logo" className={styles.logo} />
            </button>
            <span className={styles.navItemsLeft}>
            <Link to="/" className={styles.homeLink}>
            Home
            </Link>
            <div>
              <button onClick={handleDropdownClick} className={styles.dropdownButton}>
                Hazards <ArrowDropDownIcon/>
              </button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleDropdownClose}>
                <MenuItem onClick={() => navigate('/earthquake')}>Earthquake</MenuItem>
                <MenuItem onClick={() => navigate('/other-hazards')}>Other Hazards</MenuItem>
              </Menu>
            </div>
            <Link to="/about" className={styles.navLink}>About</Link>
            <Link to="/contact-us" className={styles.navLink}>Contact Us</Link>
            </span>
            <div className={styles.searchBar}>
              <InputBase
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                sx={{color:"#bc1a1a"}}
              />
              <IconButton onClick={handleSearch}>
                <Search  sx={{color:"#bc1a1a"}}/>
              </IconButton>
            </div>
            {token && location.pathname !== '/login' && (
            <div className={styles.rightmostNav}>
            <NotificationsOutlined
              sx={{
                marginLeft: 2,
                cursor: "pointer",
                "&:hover": { color: "#555" },
              }}
            />
            <PersonOutline
              sx={{
                marginLeft: 2,
                cursor: "pointer",
                "&:hover": { color: "#555" },
              }}
              onClick={() => navigate('/profile')}
            />
              <LogoutOutlined
                onClick={handleLogout}
                sx={{
                  marginLeft: 2,
                  cursor: "pointer",
                  "&:hover": { color: "#555" },
                }}
              />
            
            </div>
            )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
