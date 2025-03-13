import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Button,
  Alert,
  Skeleton,
  Grid,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

// Import des services API
import { getAppById, addRating, deleteRating, incrementDownloads } from '../services/apps.service';
import { useAuth } from '../contexts/AuthContext';

// Import des composants
import AppGallery from '../components/apps/AppGallery';
import AppInfo from '../components/apps/AppInfo';
import AppTabs from '../components/apps/AppTabs';

/**
 * Page de détail d'une application
 * @returns {JSX.Element} Page AppDetailPage
 */
const AppDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { currentUser, isLoggedIn } = useAuth();
  
  // États pour les données
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les évaluations
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState(null);
  
  // État pour les onglets
  const [tabValue, setTabValue] = useState(0);
  
  // État pour la galerie d'images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  // État pour les messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Charger les données au chargement du composant
  useEffect(() => {
    fetchAppDetails();
  }, [appId]);
  
  // Fonction pour récupérer les détails de l'application
  const fetchAppDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel à l'API
      const result = await getAppById(appId);
      
      setApp(result);
      
      // Vérifier si l'utilisateur a déjà évalué cette application
      if (isLoggedIn() && result.ratings) {
        const userRatingObj = result.ratings.find(
          rating => rating.user === currentUser._id || rating.user._id === currentUser._id
        );
        
        if (userRatingObj) {
          setUserRating(userRatingObj.rating);
          setUserComment(userRatingObj.comment || '');
        }
      }
      
    } catch (err) {
      console.error('Erreur lors du chargement des détails de l\'application:', err);
      setError(err.message || 'Erreur lors du chargement des détails de l\'application');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour soumettre une évaluation
  const handleRatingSubmit = async (event) => {
    event.preventDefault();
    
    if (!isLoggedIn()) {
      // Rediriger vers la page de connexion
      navigate('/login', { state: { from: `/apps/${appId}` } });
      return;
    }
    
    try {
      setRatingSubmitting(true);
      setRatingError(null);
      
      // Appel à l'API
      await addRating(appId, userRating, userComment);
      
      // Recharger les détails de l'application
      await fetchAppDetails();
      
      setSnackbar({
        open: true,
        message: 'Votre évaluation a été ajoutée avec succès',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout de l\'évaluation:', err);
      setRatingError(err.message || 'Erreur lors de l\'ajout de l\'évaluation');
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de l\'ajout de l\'évaluation',
        severity: 'error'
      });
    } finally {
      setRatingSubmitting(false);
    }
  };
  
  // Fonction pour supprimer une évaluation
  const handleRatingDelete = async () => {
    if (!isLoggedIn()) return;
    
    try {
      setRatingSubmitting(true);
      
      // Appel à l'API
      await deleteRating(appId);
      
      // Réinitialiser les états
      setUserRating(0);
      setUserComment('');
      
      // Recharger les détails de l'application
      await fetchAppDetails();
      
      setSnackbar({
        open: true,
        message: 'Votre évaluation a été supprimée avec succès',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'évaluation:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la suppression de l\'évaluation',
        severity: 'error'
      });
    } finally {
      setRatingSubmitting(false);
    }
  };
  
  // Fonction pour télécharger l'application
  const handleDownload = async () => {
    try {
      // Incrémenter le compteur de téléchargements
      await incrementDownloads(appId);
      
      // Rediriger vers l'URL de l'application
      if (app.url) {
        window.open(app.url, '_blank');
      }
      
      setSnackbar({
        open: true,
        message: 'Téléchargement démarré',
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors du téléchargement',
        severity: 'error'
      });
    }
  };
  
  // Fonction pour changer d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Fonction pour ouvrir la galerie d'images
  const handleOpenGallery = (index) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };
  
  // Fonction pour fermer la galerie d'images
  const handleCloseGallery = () => {
    setGalleryOpen(false);
  };
  
  // Fonction pour naviguer dans la galerie d'images
  const handleNavigateGallery = (direction) => {
    if (!app || !app.images) return;
    
    // Calculer le nombre total d'images
    let totalImages = 0;
    if (app.images.banner) totalImages++;
    if (app.images.icon) totalImages++;
    if (app.images.screenshots) totalImages += app.images.screenshots.length;
    
    if (totalImages === 0) return;
    
    let newIndex = currentImageIndex + direction;
    
    if (newIndex < 0) newIndex = totalImages - 1;
    if (newIndex >= totalImages) newIndex = 0;
    
    setCurrentImageIndex(newIndex);
  };
  
  // Fonction pour fermer le snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Préparer les images pour la galerie
  const getGalleryImages = () => {
    const images = [];
    if (!app || !app.images) return images;
    
    if (app.images.banner) images.push({ url: app.images.banner, caption: 'Bannière' });
    if (app.images.icon) images.push({ url: app.images.icon, caption: 'Icône' });
    if (app.images.screenshots) images.push(...app.images.screenshots);
    
    return images;
  };
  
  // Afficher un skeleton loader pendant le chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mr: 1 }} />
          <Skeleton variant="text" width="50%" height={40} />
        </Box>
        
        <Grid container spacing={4}>
          {/* Image principale */}
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {[...Array(3)].map((_, index) => (
                <Skeleton key={index} variant="rectangular" width={80} height={60} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          </Grid>
          
          {/* Informations */}
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={100} sx={{ mb: 3 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={30} sx={{ mb: 1 }} />
          </Grid>
          
          {/* Onglets */}
          <Grid item xs={12}>
            <Skeleton variant="rectangular" width="100%" height={48} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
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
              onClick={fetchAppDetails}
              startIcon={<RefreshIcon />}
            >
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/apps')}
        >
          Retour à la liste des applications
        </Button>
      </Container>
    );
  }
  
  // Si l'application n'est pas trouvée
  if (!app) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Application non trouvée
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/apps')}
        >
          Retour à la liste des applications
        </Button>
      </Container>
    );
  }
  
  // Préparer les propriétés pour le formulaire d'évaluation
  const ratingProps = {
    userRating,
    userComment,
    ratingSubmitting,
    ratingError,
    setUserRating,
    setUserComment,
    handleRatingSubmit,
    handleRatingDelete
  };
  
  // Obtenir les images pour la galerie
  const galleryImages = getGalleryImages();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Bouton de retour */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/apps')}
        sx={{ mb: 3 }}
      >
        Retour à la liste des applications
      </Button>
      
      <Grid container spacing={4}>
        {/* Image principale et galerie */}
        <Grid item xs={12} md={6}>
          <AppGallery app={app} handleOpenGallery={handleOpenGallery} />
        </Grid>
        
        {/* Informations de l'application */}
        <Grid item xs={12} md={6}>
          <AppInfo app={app} handleDownload={handleDownload} />
        </Grid>
        
        {/* Onglets */}
        <Grid item xs={12}>
          <AppTabs 
            app={app} 
            tabValue={tabValue} 
            handleTabChange={handleTabChange} 
            ratingProps={ratingProps}
            isLoggedIn={isLoggedIn()}
          />
        </Grid>
      </Grid>
      
      {/* Galerie d'images (modal) */}
      <Dialog
        open={galleryOpen}
        onClose={handleCloseGallery}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {galleryImages[currentImageIndex]?.caption || `Image ${currentImageIndex + 1}`}
            </span>
            <IconButton onClick={handleCloseGallery}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ position: 'relative', width: '100%', textAlign: 'center' }}>
            {galleryImages[currentImageIndex] && (
              <Box
                component="img"
                src={galleryImages[currentImageIndex].url}
                alt={galleryImages[currentImageIndex].caption || `Image ${currentImageIndex + 1}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            )}
            
            {galleryImages.length > 1 && (
              <>
                <IconButton
                  onClick={() => handleNavigateGallery(-1)}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }}
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleNavigateGallery(1)}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }}
                >
                  <NavigateNextIcon />
                </IconButton>
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Snackbar pour les messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AppDetailPage;
