import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer, Collapse } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/material/styles';

interface SidebarProps {
  items: {
    title: string;
    path: string;
    icon: React.ReactNode;
    children?: {
      title: string;
      path: string;
    }[];
  }[];
  logo: string;
  isOpen: boolean;
  onToggle: () => void;
}

const StyledDrawer = styled(Drawer)(() => ({
  width: '100%',
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    position: 'relative',
    borderRight: '1px solid #f0f0f0',
  },
}));

const StyledListItemButton = styled(ListItemButton)(() => ({
  '&:hover': {
    backgroundColor: '#fce8e8',
  },
  '&.Mui-selected': {
    backgroundColor: '#bc1a1a',
    color: 'white',
    '&:hover': {
      backgroundColor: '#a31616',
    },
    '& .MuiListItemIcon-root': {
      color: 'white',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(() => ({
  color: 'black',
  minWidth: 40,
}));

const StyledSubListItemButton = styled(ListItemButton)(() => ({
  paddingLeft: '2rem',
  '&:hover': {
    backgroundColor: '#fce8e8',
  },
  '&.Mui-selected': {
    backgroundColor: '#fce8e8',
    color: '#bc1a1a',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#fad4d4',
    },
  },
}));

const Sidebar: React.FC<SidebarProps> = ({ items, logo }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = React.useState<string | null>(null);

  return (
    <StyledDrawer variant="permanent">
      <Box sx={{ p: 2 }}>
        <img src={logo} alt="Logo" style={{ width: '5rem', height: '5rem' }} />
      </Box>
      <List>
        {items.map((item) => (
          <React.Fragment key={item.path}>
            <ListItem disablePadding>
              <StyledListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  if (item.children) {
                    setOpenSubMenu(openSubMenu === item.title ? null : item.title);
                  } else {
                    navigate(item.path || '');
                  }
                }}
              >
                <StyledListItemIcon>
                  {item.icon}
                </StyledListItemIcon>
                <ListItemText primary={item.title} />
                {item.children && (
                  <KeyboardArrowDownIcon 
                    sx={{ 
                      color: location.pathname === item.path ? 'white' : '#bc1a1a',
                      transform: openSubMenu === item.title ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s'
                    }} 
                  />
                )}
              </StyledListItemButton>
            </ListItem>
            {item.children && (
              <Collapse in={openSubMenu === item.title}>
                <List>
                  {item.children.map((child) => (
                    <StyledSubListItemButton
                      key={child.path}
                      selected={location.pathname === child.path}
                      onClick={() => navigate(child.path)}
                    >
                      <ListItemText primary={child.title} />
                    </StyledSubListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar;
