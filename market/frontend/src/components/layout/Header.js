import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Apps as AppsIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

// Contextes
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // État pour le menu utilisateur
  const [anchorElUser, setAnchorElUser] = useState(null);
  
  // État pour le menu mobile
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Gestion du menu utilisateur
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Gestion du menu mobile
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Navigation
  const handleNavigation = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setDrawerOpen(false);
  };

  // Déconnexion
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  // Pages de navigation
  const pages = [
    { name: 'Applications', path: '/apps', icon: <AppsIcon /> },
    { name: 'Catégories', path: '/categories', icon: <CategoryIcon /> },
    { name: 'À propos', path: '/about', icon: <InfoIcon /> }
  ];

  // Menu mobile
  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            M
          </Box>
          Marketplace
        </Typography>
      </Box>
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem button key={page.name} onClick={() => handleNavigation(page.path)}>
            <ListItemIcon>
              {page.icon}
            </ListItemIcon>
            <ListItemText primary={page.name} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {currentUser ? (
          <>
            <ListItem button onClick={() => handleNavigation('/profile')}>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary="Profil" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Connexion" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemIcon>
                <RegisterIcon />
              </ListItemIcon>
              <ListItemText primary="Inscription" />
            </ListItem>
          </>
        )}
        <ListItem button onClick={toggleTheme}>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Mode clair" : "Mode sombre"} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo pour les écrans larges */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              M
            </Box>
            Marketplace
          </Typography>

          {/* Menu hamburger pour mobile */}
          {isMobile && (
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={toggleDrawer(true)}
              color="inherit"
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo pour mobile */}
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: 'flex', md: 'none' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box sx={{ width: 32, height: 32, bgcolor: 'primary.main', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              M
            </Box>
            Marketplace
          </Typography>

          {/* Navigation pour les écrans larges */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleNavigation(page.path)}
                sx={{ my: 2, color: 'text.primary', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Bouton de thème */}
          <IconButton onClick={toggleTheme} sx={{ ml: 1 }} color="inherit">
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Menu utilisateur */}
          <Box sx={{ flexGrow: 0, ml: 2 }}>
            {currentUser ? (
              <>
                <Tooltip title="Ouvrir les paramètres">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={currentUser.name} src="/static/images/avatar/2.jpg" />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={() => handleNavigation('/profile')}>
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Profil</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Déconnexion</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleNavigation('/login')}
                  startIcon={<LoginIcon />}
                >
                  Connexion
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleNavigation('/register')}
                  startIcon={<RegisterIcon />}
                >
                  Inscription
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Drawer pour mobile */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
    </AppBar>
  );
};

export default Header;
