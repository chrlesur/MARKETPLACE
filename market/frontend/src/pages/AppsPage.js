import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Paper,
  IconButton,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  TuneRounded as TuneIcon
} from '@mui/icons-material';

// Import des services API
import { getApps } from '../services/apps.service';
import { getCategories } from '../services/categories.service';

// Fonction utilitaire pour extraire les paramètres de l'URL
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const AppsPage = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // États pour les données
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApps, setTotalApps] = useState(0);
  const [limit, setLimit] = useState(9);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState(query.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(query.get('category') || '');
  const [priceFilter, setPriceFilter] = useState(query.get('price') || 'all');
  const [sortBy, setSortBy] = useState(query.get('sort') || 'popular');
  
  // État pour le drawer de filtres sur mobile
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Charger les données au chargement du composant et lorsque les filtres changent
  useEffect(() => {
    fetchApps();
    fetchCategories();
  }, [page, limit, selectedCategory, priceFilter, sortBy]);
  
  // Mettre à jour l'URL lorsque les filtres changent
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    if (priceFilter !== 'all') params.append('price', priceFilter);
    if (sortBy !== 'popular') params.append('sort', sortBy);
    
    const queryString = params.toString();
    const newUrl = queryString ? `/apps?${queryString}` : '/apps';
    
    navigate(newUrl, { replace: true });
  }, [searchTerm, selectedCategory, priceFilter, sortBy]);
  
  // Fonction pour récupérer les applications
  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Préparer les paramètres pour l'API
      const params = {
        page,
        limit,
        sort: sortBy
      };
      
      // Ajouter les filtres si nécessaire
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (priceFilter !== 'all') params.pricingType = priceFilter;
      
      // Appel à l'API
      const result = await getApps(params);
      
      setApps(result.apps || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalApps(result.pagination?.total || 0);
      
    } catch (err) {
      console.error('Erreur lors du chargement des applications:', err);
      setError(err.message || 'Erreur lors du chargement des applications');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      setCategories(result || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      // Ne pas afficher d'erreur pour les catégories, ce n'est pas critique
    }
  };
  
  // Gérer la recherche
  const handleSearch = (event) => {
    event.preventDefault();
    const term = event.target.search.value;
    setSearchTerm(term);
    setPage(1); // Réinitialiser la page lors d'une nouvelle recherche
  };
  
  // Gérer le changement de catégorie
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1); // Réinitialiser la page lors d'un changement de filtre
  };
  
  // Gérer le changement de filtre de prix
  const handlePriceFilterChange = (event) => {
    setPriceFilter(event.target.value);
    setPage(1); // Réinitialiser la page lors d'un changement de filtre
  };
  
  // Gérer le changement de tri
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Réinitialiser la page lors d'un changement de tri
  };
  
  // Gérer le changement de page
  const handlePageChange = (event, value) => {
    setPage(value);
    // Faire défiler vers le haut de la page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Naviguer vers la page de détail d'une application
  const handleAppClick = (appId) => {
    navigate(`/apps/${appId}`);
  };
  
  // Réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceFilter('all');
    setSortBy('popular');
    setPage(1);
  };
  
  // Ouvrir/fermer le drawer de filtres sur mobile
  const toggleFilterDrawer = () => {
    setFilterDrawerOpen(!filterDrawerOpen);
  };
  
  // Composant pour les filtres
  const FiltersComponent = () => (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Filtres
      </Typography>
      
      {/* Filtre par catégorie */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="category-select-label">Catégorie</InputLabel>
        <Select
          labelId="category-select-label"
          id="category-select"
          value={selectedCategory}
          label="Catégorie"
          onChange={handleCategoryChange}
        >
          <MenuItem value="">Toutes les catégories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category._id || category.id} value={category._id || category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Filtre par prix */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="price-select-label">Prix</InputLabel>
        <Select
          labelId="price-select-label"
          id="price-select"
          value={priceFilter}
          label="Prix"
          onChange={handlePriceFilterChange}
        >
          <MenuItem value="all">Tous les prix</MenuItem>
          <MenuItem value="free">Gratuit</MenuItem>
          <MenuItem value="paid">Payant</MenuItem>
          <MenuItem value="subscription">Abonnement</MenuItem>
        </Select>
      </FormControl>
      
      {/* Tri */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="sort-select-label">Trier par</InputLabel>
        <Select
          labelId="sort-select-label"
          id="sort-select"
          value={sortBy}
          label="Trier par"
          onChange={handleSortChange}
        >
          <MenuItem value="popular">Popularité</MenuItem>
          <MenuItem value="newest">Plus récent</MenuItem>
          <MenuItem value="oldest">Plus ancien</MenuItem>
          <MenuItem value="name_asc">Nom (A-Z)</MenuItem>
          <MenuItem value="name_desc">Nom (Z-A)</MenuItem>
          <MenuItem value="rating">Meilleure note</MenuItem>
        </Select>
      </FormControl>
      
      {/* Bouton de réinitialisation */}
      <Button
        variant="outlined"
        color="primary"
        fullWidth
        onClick={handleResetFilters}
        startIcon={<RefreshIcon />}
      >
        Réinitialiser les filtres
      </Button>
    </Box>
  );
  
  // Afficher un skeleton loader pendant le chargement
  if (loading && page === 1) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* En-tête */}
          <Grid item xs={12}>
            <Box sx={{ mb: 4 }}>
              <Skeleton variant="text" width="50%" height={60} />
              <Skeleton variant="text" width="70%" height={30} />
            </Box>
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 4, borderRadius: 1 }} />
          </Grid>
          
          {/* Filtres (desktop) */}
          {!isMobile && (
            <Grid item xs={12} md={3}>
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          )}
          
          {/* Liste des applications */}
          <Grid item xs={12} md={isMobile ? 12 : 9}>
            <Grid container spacing={3}>
              {[...Array(9)].map((_, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchApps}
              startIcon={<RefreshIcon />}
            >
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* En-tête */}
        <Grid item xs={12}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Applications
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Découvrez notre catalogue d'applications web innovantes
          </Typography>
          
          {/* Barre de recherche */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              width: '100%',
              mb: 4
            }}
          >
            <TextField
              name="search"
              placeholder="Rechercher une application..."
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: isMobile ? '8px' : '8px 0 0 8px',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear search"
                      onClick={() => setSearchTerm('')}
                      edge="end"
                    >
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {!isMobile && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: '0 8px 8px 0',
                  px: 3
                }}
              >
                Rechercher
              </Button>
            )}
          </Box>
          
          {/* Bouton de filtres (mobile) */}
          {isMobile && (
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={toggleFilterDrawer}
              startIcon={<TuneIcon />}
              sx={{ mb: 3 }}
            >
              Filtres et tri
            </Button>
          )}
          
          {/* Drawer de filtres (mobile) */}
          <Drawer
            anchor="bottom"
            open={filterDrawerOpen}
            onClose={toggleFilterDrawer}
            PaperProps={{
              sx: {
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                maxHeight: '80vh'
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Filtres et tri
                </Typography>
                <IconButton onClick={toggleFilterDrawer}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <FiltersComponent />
            </Box>
          </Drawer>
          
          {/* Affichage des filtres actifs */}
          {(searchTerm || selectedCategory || priceFilter !== 'all' || sortBy !== 'popular') && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {searchTerm && (
                <Chip
                  label={`Recherche: ${searchTerm}`}
                  onDelete={() => setSearchTerm('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedCategory && (
                <Chip
                  label={`Catégorie: ${categories.find(c => (c._id || c.id) === selectedCategory)?.name || selectedCategory}`}
                  onDelete={() => setSelectedCategory('')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {priceFilter !== 'all' && (
                <Chip
                  label={`Prix: ${priceFilter === 'free' ? 'Gratuit' : priceFilter === 'paid' ? 'Payant' : 'Abonnement'}`}
                  onDelete={() => setPriceFilter('all')}
                  color="primary"
                  variant="outlined"
                />
              )}
              {sortBy !== 'popular' && (
                <Chip
                  label={`Tri: ${
                    sortBy === 'newest' ? 'Plus récent' :
                    sortBy === 'oldest' ? 'Plus ancien' :
                    sortBy === 'name_asc' ? 'Nom (A-Z)' :
                    sortBy === 'name_desc' ? 'Nom (Z-A)' :
                    sortBy === 'rating' ? 'Meilleure note' : sortBy
                  }`}
                  onDelete={() => setSortBy('popular')}
                  color="primary"
                  variant="outlined"
                />
              )}
              <Chip
                label="Réinitialiser tous les filtres"
                onDelete={handleResetFilters}
                color="secondary"
              />
            </Box>
          )}
        </Grid>
        
        {/* Filtres (desktop) */}
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
              <FiltersComponent />
            </Paper>
          </Grid>
        )}
        
        {/* Liste des applications */}
        <Grid item xs={12} md={isMobile ? 12 : 9}>
          {/* Résultats et tri (desktop) */}
          {!isMobile && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {totalApps} résultat{totalApps !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          
          {/* Grille d'applications */}
          {apps.length > 0 ? (
            <Grid container spacing={3}>
              {apps.map((app) => (
                <Grid item xs={12} sm={6} md={4} key={app._id || app.id}>
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
                    onClick={() => handleAppClick(app._id || app.id)}
                  >
                    <CardMedia
                      component="img"
                      height="180"
                      image={app.images?.icon || app.images?.banner || `https://via.placeholder.com/300x180/${app._id ? app._id.substring(0, 6) : '4f46e5'}/ffffff?text=${app.name}`}
                      alt={app.name}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {app.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {app.description?.short || app.description?.full || app.description || 'Aucune description disponible'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={app.averageRating || 0}
                          precision={0.1}
                          readOnly
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {app.averageRating ? app.averageRating.toFixed(1) : 'N/A'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {app.category?.name || 'Non catégorisé'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                        {app.pricing?.type === 'free' ? 'Gratuit' : 
                         app.pricing?.type === 'paid' ? `${app.pricing.price || 0} ${app.pricing.currency || '€'}` : 
                         app.pricing?.type === 'subscription' ? `${app.pricing.price || 0} ${app.pricing.currency || '€'}/mois` : 
                         'Gratuit'}
                      </Typography>
                      <Button size="small" color="primary">
                        Voir détails
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Aucune application trouvée
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Essayez de modifier vos filtres ou votre recherche.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetFilters}
                startIcon={<RefreshIcon />}
              >
                Réinitialiser les filtres
              </Button>
            </Paper>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? 'small' : 'medium'}
                showFirstButton
                showLastButton
              />
            </Box>
          )}
          
          {/* Affichage du nombre de résultats (mobile) */}
          {isMobile && apps.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Affichage de {(page - 1) * limit + 1}-{Math.min(page * limit, totalApps)} sur {totalApps} résultat{totalApps !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default AppsPage;
