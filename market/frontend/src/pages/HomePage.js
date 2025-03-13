import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Données fictives pour les applications
const featuredApps = [
  {
    id: 'transkryptor',
    name: 'Transkryptor',
    description: 'Application de transcription audio et d\'analyse de contenu utilisant l\'IA.',
    image: 'https://via.placeholder.com/300x180/4f46e5/ffffff?text=Transkryptor',
    rating: 4.8,
    price: 'Gratuit',
    category: 'Productivité',
    developer: 'Christophe LESUR'
  },
  {
    id: 'datavisualizer',
    name: 'DataVisualizer',
    description: 'Créez des visualisations de données interactives et des tableaux de bord personnalisés.',
    image: 'https://via.placeholder.com/300x180/10b981/ffffff?text=DataVisualizer',
    rating: 4.2,
    price: '29,99 €',
    category: 'Analyse de données',
    developer: 'DataViz Inc.'
  },
  {
    id: 'collaborator',
    name: 'Collaborator',
    description: 'Plateforme de collaboration en temps réel pour les équipes distribuées.',
    image: 'https://via.placeholder.com/300x180/f59e0b/ffffff?text=Collaborator',
    rating: 4.5,
    price: '19,99 €/mois',
    category: 'Communication',
    developer: 'TeamWork Solutions'
  }
];

// Catégories populaires
const popularCategories = [
  { id: 'productivity', name: 'Productivité', count: 24 },
  { id: 'creativity', name: 'Créativité', count: 18 },
  { id: 'communication', name: 'Communication', count: 15 },
  { id: 'data-analysis', name: 'Analyse de données', count: 12 },
  { id: 'ai', name: 'Intelligence artificielle', count: 9 },
  { id: 'development', name: 'Développement', count: 21 }
];

const HomePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  // Naviguer vers la page de détail d'une application
  const handleAppClick = (appId) => {
    navigate(`/apps/${appId}`);
  };

  // Naviguer vers la page des applications d'une catégorie
  const handleCategoryClick = (categoryId) => {
    navigate(`/apps?category=${categoryId}`);
  };

  // Gérer la recherche
  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = event.target.search.value;
    navigate(`/apps?search=${searchTerm}`);
  };

  return (
    <Box>
      {/* Section Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontWeight: 800,
                  mb: 2
                }}
              >
                Découvrez des applications web innovantes
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 400,
                  mb: 4,
                  opacity: 0.9
                }}
              >
                Explorez notre catalogue d'applications web de haute qualité, conçues pour améliorer votre productivité et votre créativité.
              </Typography>
              <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                  display: 'flex',
                  width: '100%',
                  mb: 2
                }}
              >
                <TextField
                  name="search"
                  placeholder="Rechercher une application..."
                  variant="outlined"
                  fullWidth
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px 0 0 8px',
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  sx={{
                    borderRadius: '0 8px 8px 0',
                    px: 3
                  }}
                >
                  Rechercher
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ borderColor: 'white', color: 'white' }}
                  onClick={() => navigate('/apps')}
                >
                  Toutes les applications
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  sx={{ borderColor: 'white', color: 'white' }}
                  onClick={() => navigate('/categories')}
                >
                  Parcourir les catégories
                </Button>
              </Box>
            </Grid>
            {!isMobile && (
              <Grid item xs={12} md={6}>
                <Box
                  component="img"
                  src="https://via.placeholder.com/600x400/ffffff33/ffffff?text=Marketplace"
                  alt="Marketplace Hero"
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Section Catégories */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Catégories populaires
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/categories')}
          >
            Voir toutes
          </Button>
        </Box>
        <Grid container spacing={2}>
          {popularCategories.map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category.id}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  }
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.count} apps
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section Application Vedette */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Application vedette
          </Typography>
        </Box>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }
          }}
        >
          <Grid container>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: { xs: 200, md: '100%' },
                  backgroundImage: `url(${featuredApps[0].image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 4 }}>
                <Chip
                  label="Application vedette"
                  color="error"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {featuredApps[0].name}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {featuredApps[0].description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Développeur
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {featuredApps[0].developer}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Catégorie
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {featuredApps[0].category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Note
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mr: 0.5 }}>
                        {featuredApps[0].rating}
                      </Typography>
                      <StarIcon sx={{ fontSize: 16, color: '#fbbf24' }} />
                    </Box>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAppClick(featuredApps[0].id)}
                >
                  Voir l'application
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Section Applications Populaires */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
            Applications populaires
          </Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/apps')}
          >
            Voir toutes
          </Button>
        </Box>
        <Grid container spacing={3}>
          {featuredApps.map((app) => (
            <Grid item xs={12} sm={6} md={4} key={app.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleAppClick(app.id)}
              >
                <CardMedia
                  component="img"
                  height="180"
                  image={app.image}
                  alt={app.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                    {app.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {app.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating
                      value={app.rating}
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {app.rating}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {app.category}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {app.price}
                  </Typography>
                  <Button size="small" color="primary">
                    Voir détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Section CTA */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 8
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              Prêt à découvrir plus d'applications ?
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, mb: 4, opacity: 0.9 }}>
              Explorez notre catalogue complet d'applications web innovantes.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/apps')}
              sx={{ px: 4, py: 1.5 }}
            >
              Explorer le catalogue
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
