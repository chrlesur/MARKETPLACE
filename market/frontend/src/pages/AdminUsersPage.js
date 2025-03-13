import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Composants personnalisés
import UserList from '../components/admin/UserList';
import UserForm from '../components/admin/UserForm';
import DeleteConfirmDialog from '../components/admin/DeleteConfirmDialog';

// Importer les services
import { getUsers, updateUser, deleteUser } from '../services/users.service';
import { register } from '../services/auth.service';

/**
 * Page d'administration des utilisateurs
 * 
 * Cette page permet de gérer les utilisateurs de la marketplace :
 * - Afficher la liste des utilisateurs avec pagination et filtrage
 * - Ajouter, modifier et supprimer des utilisateurs
 * - Activer/désactiver des utilisateurs
 */
const AdminUsersPage = () => {
  const { currentUser } = useAuth();
  
  // État des utilisateurs
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // État de la pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // État de la recherche
  const [searchTerm, setSearchTerm] = useState('');
  
  // État du formulaire
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' ou 'edit'
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    role: 'user',
    avatar: '',
    isActive: true,
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  /**
   * Charge les utilisateurs depuis l'API
   */
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel au service des utilisateurs
      const result = await getUsers({
        page: page + 1, // L'API commence à 1, MUI commence à 0
        limit: rowsPerPage,
        search: searchTerm,
        role: ''
      });
      
      setUsers(result.users || []);
      setTotalUsers(result.pagination?.total || 0);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les utilisateurs au chargement du composant et lorsque les paramètres changent
  useEffect(() => {
    loadUsers();
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
   * Rafraîchit la liste des utilisateurs
   */
  const handleRefresh = () => {
    loadUsers();
  };
  
  /**
   * Ouvre le formulaire d'ajout ou de modification
   */
  const handleOpenForm = (mode, user = null) => {
    setFormMode(mode);
    
    if (mode === 'edit' && user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || '',
        isActive: user.isActive,
        password: '',
        confirmPassword: ''
      });
    } else {
      setFormData({
        id: null,
        name: '',
        email: '',
        role: 'user',
        avatar: '',
        isActive: true,
        password: '',
        confirmPassword: ''
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
   * Gère les changements pour les switches
   */
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  /**
   * Validation du formulaire
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validation des champs requis
    if (!formData.name) newErrors.name = 'Le nom est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    
    // Validation de l'email
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    // Validation du mot de passe (requis uniquement pour l'ajout)
    if (formMode === 'add') {
      if (!formData.password) newErrors.password = 'Le mot de passe est requis';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    }
    
    // Vérifier si les mots de passe correspondent
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
      
      // Vérifier la complexité du mot de passe
      if (formData.password && formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }
    
    // Vérifier si l'email est déjà utilisé (sauf pour l'utilisateur en cours d'édition)
    const emailExists = users.some(
      user => user.email === formData.email && user.id !== formData.id
    );
    
    if (emailExists) {
      newErrors.email = 'Cet email est déjà utilisé';
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
        // Créer un nouvel utilisateur
        await register(formData.name, formData.email, formData.password, {
          role: formData.role,
          avatar: formData.avatar,
          isActive: formData.isActive
        });
        
        setSnackbar({
          open: true,
          message: 'Utilisateur ajouté avec succès',
          severity: 'success'
        });
      } else {
        // Mettre à jour un utilisateur existant
        const { password, confirmPassword, ...userData } = formData;
        
        // Ajouter le mot de passe uniquement s'il est fourni
        if (password) {
          userData.password = password;
        }
        
        await updateUser(userData.id, userData);
        
        setSnackbar({
          open: true,
          message: 'Utilisateur mis à jour avec succès',
          severity: 'success'
        });
      }
      
      // Recharger les utilisateurs
      await loadUsers();
      
      // Fermer le formulaire
      handleCloseForm();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', err);
      setError(err.message || 'Erreur lors de l\'enregistrement de l\'utilisateur');
      
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de l\'enregistrement de l\'utilisateur',
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  /**
   * Ouvre le dialogue de confirmation de suppression
   */
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  /**
   * Confirme la suppression d'un utilisateur
   */
  const handleDeleteConfirm = async () => {
    try {
      setDeleteLoading(true);
      setError(null);
      
      // Vérifier si c'est le dernier administrateur
      if (userToDelete.role === 'admin') {
        const adminCount = users.filter(user => user.role === 'admin').length;
        
        if (adminCount <= 1) {
          setSnackbar({
            open: true,
            message: 'Impossible de supprimer le dernier administrateur',
            severity: 'error'
          });
          setDeleteDialogOpen(false);
          setUserToDelete(null);
          return;
        }
      }
      
      // Supprimer l'utilisateur
      await deleteUser(userToDelete.id);
      
      // Recharger les utilisateurs
      await loadUsers();
      
      setSnackbar({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
      
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la suppression de l\'utilisateur',
        severity: 'error'
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };
  
  /**
   * Annule la suppression d'un utilisateur
   */
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  /**
   * Activer/désactiver un utilisateur
   */
  const handleToggleActive = async (user) => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si c'est le dernier administrateur actif
      if (user.role === 'admin' && user.isActive) {
        const activeAdminCount = users.filter(u => u.role === 'admin' && u.isActive).length;
        
        if (activeAdminCount <= 1) {
          setSnackbar({
            open: true,
            message: 'Impossible de désactiver le dernier administrateur actif',
            severity: 'error'
          });
          return;
        }
      }
      
      // Mettre à jour l'état de l'utilisateur
      await updateUser(user.id, { ...user, isActive: !user.isActive });
      
      // Recharger les utilisateurs
      await loadUsers();
      
      setSnackbar({
        open: true,
        message: `Utilisateur ${user.isActive ? 'désactivé' : 'activé'} avec succès`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Erreur lors de la modification de l\'utilisateur:', err);
      setError(err.message || 'Erreur lors de la modification de l\'utilisateur');
      
      setSnackbar({
        open: true,
        message: err.message || 'Erreur lors de la modification de l\'utilisateur',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
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
  
  if (loading && users.length === 0) {
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
            Gestion des utilisateurs
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
              Ajouter un utilisateur
            </Button>
          </Box>
        </Box>
        
        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Rechercher un utilisateur..."
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
        
        <UserList
          users={users}
          page={page}
          rowsPerPage={rowsPerPage}
          totalUsers={totalUsers}
          loading={loading}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEditClick={(user) => handleOpenForm('edit', user)}
          handleDeleteClick={handleDeleteClick}
          handleToggleActive={handleToggleActive}
        />
        
        <UserForm
          open={formOpen}
          onClose={handleCloseForm}
          formMode={formMode}
          formData={formData}
          formErrors={formErrors}
          formLoading={formLoading}
          handleFormChange={handleFormChange}
          handleSwitchChange={handleSwitchChange}
          handleFormSubmit={handleFormSubmit}
        />
        
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          title="Confirmer la suppression"
          content={`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userToDelete?.name}" ? Cette action est irréversible.`}
          onCancel={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
        
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

export default AdminUsersPage;
