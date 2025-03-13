import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
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
  CircularProgress,
  Chip,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importer le service des catégories
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../services/categories.service';

/**
 * Page d'administration des catégories
 * 
 * Cette page permet de gérer les catégories de la marketplace :
 * - Afficher la liste des catégories
 * - Ajouter, modifier et supprimer des catégories
 */
const AdminCategoriesPage = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // État pour le formulaire d'ajout/modification
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' ou 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    slug: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  /**
   * Charge les catégories depuis l'API
   */
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel au service des catégories
      const data = await getCategories();
      
      setCategories(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les catégories au chargement du composant
  useEffect(() => {
    loadCategories();
  }, []);
  
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
   * Rafraîchit la liste des catégories
   */
  const handleRefresh = () => {
    loadCategories();
  };
  
  /**
   * Ouvre le formulaire d'ajout ou de modification
   */
  const handleOpenForm = (mode, category = null) => {
    setFormMode(mode);
    
    if (mode === 'edit' && category) {
      setFormData({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      });
    } else {
      setFormData({
        id: null,
        name: '',
        slug: '',
        description: ''
      });
    }
    
    setFormErrors({});
    setFormOpen(true);
  };
  
  /**
   * Ferme le formulaire
   */
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  
  /**
   * Gère les changements dans le formulaire
   */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Effacer l'erreur pour ce champ
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  /**
   * Génération automatique du slug à partir du nom
   */
  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    setFormData({
      ...formData,
      slug
    });
  };
  
  /**
   * Validation du formulaire
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.slug) newErrors.slug = 'Le slug est requis';
    if (!formData.description) newErrors.description = 'La description est requise';
    
    // Vérifier si le slug est déjà utilisé (sauf pour la catégorie en cours d'édition)
    const slugExists = categories.some(
      category => category.slug === formData.slug && category.id !== formData.id
    );
    
    if (slugExists) {
      newErrors.slug = 'Ce slug est déjà utilisé';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Soumission du formulaire
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setFormLoading(true);
      setError(null);
      
      if (formMode === 'add') {
        // Créer une nouvelle catégorie
        await createCategory(formData);
        
        setSnackbar({
          open: true,
          message: 'Catégorie ajoutée avec succès',
          severity: 'success'
        });
      } else {
        // Mettre à jour une catégorie existante
        await updateCategory(formData.id, formData);
        
        setSnackbar({
          open: true,
          message: 'Catégorie mise à jour avec succès',
          severity: 'success'
        });
      }
      
      // Recharger les catégories
      await loadCategories();
      
      // Fermer le formulaire
      handleCloseForm();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de la catégorie:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement de la catégorie');
      
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de l\'enregistrement de la catégorie',
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  /**
   * Ouvre le dialogue de confirmation de suppression
   */
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  /**
   * Confirme la suppression d'une catégorie
   */
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      // Vérifier si la catégorie contient des applications
      if (categoryToDelete.appsCount > 0) {
        setSnackbar({
          open: true,
          message: `Impossible de supprimer la catégorie "${categoryToDelete.name}" car elle contient ${categoryToDelete.appsCount} application(s)`,
          severity: 'error'
        });
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
        return;
      }
      
      // Supprimer la catégorie
      await deleteCategory(categoryToDelete.id);
      
      // Recharger les catégories
      await loadCategories();
      
      setSnackbar({
        open: true,
        message: 'Catégorie supprimée avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      setError(err.message || 'Erreur lors de la suppression de la catégorie');
      
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la suppression de la catégorie',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };
  
  /**
   * Annule la suppression d'une catégorie
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Gestion des catégories
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
              onClick={() => handleOpenForm('add')}
            >
              Ajouter une catégorie
            </Button>
          </Box>
        </Box>
        
        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={`${category.appsCount || 0} app${(category.appsCount || 0) !== 1 ? 's' : ''}`}
                        color={(category.appsCount || 0) > 0 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleOpenForm('edit', category)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleDeleteClick(category)}
                          size="small"
                          color="error"
                          disabled={(category.appsCount || 0) > 0}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={categories.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
          />
        </TableContainer>
        
        {/* Formulaire d'ajout/modification */}
        <Dialog
          open={formOpen}
          onClose={handleCloseForm}
          maxWidth="sm"
          fullWidth
        >
          <form onSubmit={handleFormSubmit}>
            <DialogTitle>
              {formMode === 'add' ? 'Ajouter une catégorie' : 'Modifier la catégorie'}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    onBlur={() => !formData.slug && generateSlug()}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    required
                    disabled={formLoading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleFormChange}
                    error={!!formErrors.slug}
                    helperText={formErrors.slug || 'Identifiant unique pour l\'URL'}
                    required
                    disabled={formLoading}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    required
                    multiline
                    rows={3}
                    disabled={formLoading}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={handleCloseForm} 
                startIcon={<CancelIcon />}
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                disabled={formLoading}
              >
                {formLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  formMode === 'add' ? 'Ajouter' : 'Mettre à jour'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
        
        {/* Dialogue de confirmation de suppression */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ? Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleDeleteCancel}
              disabled={deleteLoading}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              autoFocus
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar pour les notifications */}
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

export default AdminCategoriesPage;
