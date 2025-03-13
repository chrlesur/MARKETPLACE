import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  
  // Année courante pour le copyright
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.mode === 'light' 
          ? theme.palette.grey[100] 
          : theme.palette.grey[900]
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Colonne Marketplace */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Marketplace
            </Typography>
            <Link component={RouterLink} to="/about" color="text.secondary" display="block" sx={{ mb: 1 }}>
              À propos
            </Link>
            <Link component={RouterLink} to="/careers" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Carrières
            </Link>
            <Link component={RouterLink} to="/blog" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Blog
            </Link>
            <Link component={RouterLink} to="/news" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Actualités
            </Link>
          </Grid>

          {/* Colonne Produits */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Produits
            </Typography>
            <Link component={RouterLink} to="/apps" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Applications
            </Link>
            <Link component={RouterLink} to="/categories" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Catégories
            </Link>
            <Link component={RouterLink} to="/new" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Nouveautés
            </Link>
            <Link component={RouterLink} to="/popular" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Populaires
            </Link>
          </Grid>

          {/* Colonne Support */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Support
            </Typography>
            <Link component={RouterLink} to="/help" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Centre d'aide
            </Link>
            <Link component={RouterLink} to="/contact" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Contact
            </Link>
            <Link component={RouterLink} to="/faq" color="text.secondary" display="block" sx={{ mb: 1 }}>
              FAQ
            </Link>
            <Link component={RouterLink} to="/community" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Communauté
            </Link>
          </Grid>

          {/* Colonne Légal */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
              Légal
            </Typography>
            <Link component={RouterLink} to="/terms" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Conditions d'utilisation
            </Link>
            <Link component={RouterLink} to="/privacy" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Politique de confidentialité
            </Link>
            <Link component={RouterLink} to="/cookies" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Cookies
            </Link>
            <Link component={RouterLink} to="/licenses" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Licences
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: { xs: 2, sm: 0 } }}>
            &copy; {currentYear} Marketplace. Tous droits réservés.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" aria-label="Facebook" size="small">
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton color="inherit" aria-label="Twitter" size="small">
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton color="inherit" aria-label="LinkedIn" size="small">
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton color="inherit" aria-label="GitHub" size="small">
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
