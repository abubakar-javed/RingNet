import React, { useState } from 'react';
import styles from './Navbar.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearToken } from '../../State/authSlice';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import LogoutOutlined from '@mui/icons-material/LogoutOutlined';
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import { Menu, MenuItem } from '@mui/material';
import { persistor } from '../../State/store';
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase,
  Badge,
  Avatar,
  styled,
  Box,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  GitHub as GitHubIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const token = useSelector((state: any) => state.auth.token);

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
    <AppBar
      position="relative"
      color="default"
      elevation={0}
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e0e0e0',
        height: '64px'
      }}
    >
      <Toolbar sx={{ height: '100%' }}>
        <Search>
          <SearchIconWrapper>
            <SearchIcon sx={{ color: '#666' }} />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search..."
            sx={{
              '& .MuiInputBase-input': {
                padding: '8px 8px 8px 40px',
                borderRadius: '8px',
                bgcolor: '#f5f6fa',
                '&::placeholder': {
                  color: '#666',
                  opacity: 1
                }
              }
            }}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton size="large">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton>
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
          
          <IconButton onClick={handleLogout}>
            <LogoutOutlined />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;