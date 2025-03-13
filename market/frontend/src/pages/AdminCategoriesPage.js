import React, { useState, useEffect } from 'react';
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
  Cancel as CancelIcon
} from '@mui/icons-material';

// Données fictives pour les catégories
const mockCategories = [
  { 
    id: 1, 
    name: 'Productivité', 
    slug: 'productivity',
    description: 'Applications pour améliorer votre productivité et votre organisation.',
    appsCount: 24
  },
  { 
    id: 2, 
    name: 'Créativité', 
    slug: 'creativity',
    description: 'Outils pour exprimer votre créativité et créer du contenu.',
    appsCount: 18
  },
  { 
    id: 3, 
    name: 'Communication', 
    slug: 'communication',
    description: 'Applications pour communiquer et collaborer avec d\'autres personnes.',
    appsCount: 15
  },
  { 
    id: 4, 
    name: 'Analyse de données', 
    slug: 'data-analysis',
    description: 'Outils pour analyser et visualiser des données.',
    appsCount: 12
  },
  { 
    id: 5, 
    name: 'Intelligence artificielle', 
    slug: 'ai',
    description: 'Applications utilisant l\'intelligence artificielle pour diverses tâches.',
    appsCount: 9
  },
  { 
    id: 6, 
    name: 'Développement', 
    slug: 'development',
    description: 'Outils pour les développeurs et les programmeurs.',
    appsCount: 21
  }
];

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Formulaire
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
  
  const handleCloseForm = () => {
    setFormOpen(false);
  };
  
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
  
  // Génération automatique du slug à partir du nom
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
  
  // Validation du formulaire
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
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (formMode === 'add') {
      // Simuler l'ajout d'une catégorie
      const newCategory = {
        ...formData,
        id: Math.max(...categories.map(c => c.id)) + 1,
        appsCount: 0
      };
      
      setCategories([...categories, newCategory]);
      
      setSnackbar({
        open: true,
        message: 'Catégorie ajoutée avec succès',
        severity: 'success'
      });
    } else {
      // Simuler la mise à jour d'une catégorie
      const updatedCategories = categories.map(category => 
        category.id === formData.id ? { ...category, ...formData } : category
      );
      
      setCategories(updatedCategories);
      
      setSnackbar({
        open: true,
        message: 'Catégorie mise à jour avec succès',
        severity: 'success'
      });
    }
    
    handleCloseForm();
  };
  
  // Suppression
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
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
    
    // Simuler la suppression
    setCategories(categories.filter(category => category.id !== categoryToDelete.id));
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    
    setSnackbar({
      open: true,
      message: 'Catégorie supprimée avec succès',
      severity: 'success'
    });
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  // Fermeture du snackbar
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm('add')}
          >
            Ajouter une catégorie
          </Button>
        </Box>
        
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
                        label={`${category.appsCount} app${category.appsCount !== 1 ? 's' : ''}`}
                        color={category.appsCount > 0 ? 'primary' : 'default'}
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
                          disabled={category.appsCount > 0}
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
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm} startIcon={<CancelIcon />}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
              >
                {formMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
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
            <Button onClick={handleDeleteCancel}>Annuler</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Supprimer
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
