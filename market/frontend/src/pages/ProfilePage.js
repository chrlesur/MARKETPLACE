import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Rating,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getUserById, updateUser } from '../services/users.service';
import TabPanel from '../components/common/TabPanel';

/**
 * Page de profil utilisateur
 * @returns {JSX.Element} Page ProfilePage
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, logout } = useAuth();
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [isLoggedIn, navigate]);
  
  // États pour les données
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le formulaire
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // État pour les onglets
  const [tabValue, setTabValue] = useState(0);
  
  // Charger les données au chargement du composant
  useEffect(() => {
    if (isLoggedIn() && currentUser) {
      fetchUserData();
    }
  }, [currentUser]);
  
  // Fonction pour récupérer les données de l'utilisateur
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel à l'API
      const userData = await getUserById(currentUser._id);
      
      setUser(userData);
      
      // Initialiser les champs du formulaire
      setName(userData.name || '');
      setEmail(userData.email || '');
      setAvatar(userData.avatar || '');
      
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setError(err.message || 'Erreur lors du chargement des données utilisateur');
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      // Préparer les données à envoyer
      const userData = {
        name,
        email,
        avatar
      };
      
      // Appel à l'API
      await updateUser(currentUser._id, userData);
      
      // Mettre à jour les données locales
      setUser({ ...user, ...userData });
      
      // Désactiver le mode édition
      setEditMode(false);
      setSaveSuccess(true);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setSaveError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };
  
  // Fonction pour annuler l'édition
  const handleCancel = () => {
    // Réinitialiser les champs du formulaire
    setName(user.name || '');
    setEmail(user.email || '');
    setAvatar(user.avatar || '');
    
    // Désactiver le mode édition
    setEditMode(false);
    setSaveError(null);
  };
  
  // Fonction pour changer d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Si l'utilisateur n'est pas connecté, ne rien afficher (la redirection sera gérée par useEffect)
  if (!isLoggedIn()) {
    return null;
  }
  
  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Afficher un message d'erreur
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchUserData}
        >
          Réessayer
        </Button>
      </Container>
    );
  }
  
  // Si l'utilisateur n'est pas trouvé
  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          Utilisateur non trouvé
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Grid container spacing={4}>
        {/* Profil utilisateur */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 100, height: 100, mb: 2 }}
              >
                {!user.avatar && <PersonIcon fontSize="large" />}
              </Avatar>
              
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              
              {user.role && (
                <Chip
                  label={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  color={user.role === 'admin' ? 'primary' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Date d'inscription
              </Typography>
              <Typography variant="body2">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Non disponible'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Dernière connexion
              </Typography>
              <Typography variant="body2">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Non disponible'}
              </Typography>
            </Box>
            
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => setEditMode(true)}
              startIcon={<EditIcon />}
              disabled={editMode}
            >
              Modifier le profil
            </Button>
          </Paper>
        </Grid>
        
        {/* Contenu principal */}
        <Grid item xs={12} md={8}>
          {/* Messages de succès/erreur */}
          {saveSuccess && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Profil mis à jour avec succès
            </Alert>
          )}
          
          {/* Formulaire d'édition */}
          {editMode ? (
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Modifier le profil
              </Typography>
              
              {saveError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {saveError}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Nom"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                
                <TextField
                  label="URL de l'avatar"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  helperText="Laissez vide pour utiliser l'avatar par défaut"
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleCancel}
                    startIcon={<CancelIcon />}
                    disabled={saving}
                  >
                    Annuler
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? <CircularProgress size={24} /> : 'Enregistrer'}
                  </Button>
                </Box>
              </form>
            </Paper>
          ) : (
            <>
              {/* Onglets */}
              <Paper elevation={2} sx={{ borderRadius: 2, mb: 4 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="profile tabs"
                  >
                    <Tab label="Mes téléchargements" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                    <Tab label="Mes évaluations" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
                  </Tabs>
                </Box>
                
                {/* Onglet Téléchargements */}
                <TabPanel value={tabValue} index={0}>
                  {user.downloads && user.downloads.length > 0 ? (
                    <Grid container spacing={3}>
                      {user.downloads.map((download, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Card sx={{ display: 'flex', height: '100%' }}>
                            <CardMedia
                              component="img"
                              sx={{ width: 100, height: 100, objectFit: 'cover' }}
                              image={download.app?.images?.icon || `https://via.placeholder.com/100x100/4f46e5/ffffff?text=${download.app?.name?.charAt(0) || 'A'}`}
                              alt={download.app?.name || 'Application'}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                              <CardContent sx={{ flex: '1 0 auto' }}>
                                <Typography variant="h6" component="div">
                                  {download.app?.name || 'Application non disponible'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Téléchargé le {new Date(download.date).toLocaleDateString()}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <Button
                                  size="small"
                                  onClick={() => navigate(`/apps/${download.app?._id || download.appId}`)}
                                >
                                  Voir détails
                                </Button>
                              </CardActions>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Vous n'avez pas encore téléchargé d'applications.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/apps')}
                      >
                        Explorer les applications
                      </Button>
                    </Box>
                  )}
                </TabPanel>
                
                {/* Onglet Évaluations */}
                <TabPanel value={tabValue} index={1}>
                  {user.ratings && user.ratings.length > 0 ? (
                    <Grid container spacing={3}>
                      {user.ratings.map((rating, index) => (
                        <Grid item xs={12} key={index}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {rating.app?.name || 'Application non disponible'}
                                </Typography>
                                <Rating value={rating.rating} readOnly />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Évalué le {new Date(rating.createdAt).toLocaleDateString()}
                              </Typography>
                              {rating.comment && (
                                <Typography variant="body1">
                                  {rating.comment}
                                </Typography>
                              )}
                            </CardContent>
                            <CardActions>
                              <Button
                                size="small"
                                onClick={() => navigate(`/apps/${rating.app?._id || rating.appId}`)}
                              >
                                Voir l'application
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body1" color="text.secondary">
                        Vous n'avez pas encore évalué d'applications.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/apps')}
                      >
                        Explorer les applications
                      </Button>
                    </Box>
                  )}
                </TabPanel>
              </Paper>
            </>
          )}
          
          {/* Bouton de déconnexion */}
          <Box sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={logout}
            >
              Se déconnecter
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
