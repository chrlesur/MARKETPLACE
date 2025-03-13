import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Chip,
  Tooltip,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importer le service des applications
import { getApps, deleteApp } from '../services/apps.service';

/**
 * Page d'administration des applications
 * 
 * Cette page permet de gérer les applications de la marketplace :
 * - Afficher la liste des applications avec pagination et filtrage
 * - Ajouter, modifier et supprimer des applications
 * - Voir les détails d'une application
 */
const AdminAppsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [totalApps, setTotalApps] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  /**
   * Charge les applications depuis l'API
   */
  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel au service des applications
      const result = await getApps({
        page: page + 1, // L'API commence à 1, MUI commence à 0
        limit: rowsPerPage,
        search: searchTerm
      });
      
      setApps(result.apps || []);
      setTotalApps(result.pagination?.total || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des applications:', err);
      setError(err.message || 'Erreur lors du chargement des applications');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les applications au chargement du composant et lorsque les paramètres changent
  useEffect(() => {
    loadApps();
  }, [page, rowsPerPage, searchTerm]);
  
  /**
   * Gère le changement de page
   */
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  /**
   * Gère le changement du nombre de lignes par page
   */
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  /**
   * Gère la recherche
   */
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  /**
   * Gère le clic sur le bouton de suppression
   */
  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setDeleteDialogOpen(true);
  };
  
  /**
   * Confirme la suppression d'une application
   */
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      
      // Appel au service des applications pour supprimer l'application
      await deleteApp(appToDelete.id);
      
      // Recharger les applications
      await loadApps();
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Application supprimée avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'application:', err);
      setError(err.message || 'Erreur lors de la suppression de l\'application');
      
      // Afficher un message d'erreur
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la suppression de l\'application',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setAppToDelete(null);
    }
  };
  
  /**
   * Annule la suppression d'une application
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppToDelete(null);
  };
  
  /**
   * Ferme le snackbar
   */
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  /**
   * Rafraîchit la liste des applications
   */
  const handleRefresh = () => {
    loadApps();
  };
  
  /**
   * Formate le prix d'une application
   */
  const formatPrice = (app) => {
    switch (app.pricing.type) {
      case 'free':
        return 'Gratuit';
      case 'paid':
        return `${app.pricing.price.toFixed(2)} €`;
      case 'subscription':
        return `${app.pricing.price.toFixed(2)} €/mois`;
      default:
        return 'N/A';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        {/* En-tête de la page */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Gestion des applications
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mr: 1 }}
            >
              Rafraîchir
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/admin/apps/new"
            >
              Ajouter une application
            </Button>
          </Box>
        </Box>
        
        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {/* Barre de recherche */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Rechercher une application..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </Card>
        
        {/* Tableau des applications */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Développeur</TableCell>
                <TableCell>Prix</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Téléchargements</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {app.name}
                      {app.isFeatured && (
                        <Tooltip title="Application vedette">
                          <StarIcon sx={{ ml: 1, color: 'warning.main', fontSize: 18 }} />
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{app.category.name}</TableCell>
                  <TableCell>{app.developer.name}</TableCell>
                  <TableCell>{formatPrice(app)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {app.averageRating ? app.averageRating.toFixed(1) : 'N/A'}
                      <StarIcon sx={{ ml: 0.5, color: 'warning.main', fontSize: 18 }} />
                    </Box>
                  </TableCell>
                  <TableCell>{app.downloads}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.isActive ? 'Actif' : 'Inactif'}
                      color={app.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Voir">
                      <IconButton
                        component={RouterLink}
                        to={`/apps/${app.slug}`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        component={RouterLink}
                        to={`/admin/apps/${app.id}/edit`}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => handleDeleteClick(app)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {apps.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucune application trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalApps}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </TableContainer>
        
        {/* Dialogue de confirmation de suppression */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer l'application "{appToDelete?.name}" ? Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Annuler</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar pour les messages de succès/erreur */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AdminAppsPage;
