import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Composants personnalisés
import UserList from '../components/admin/UserList';
import UserForm from '../components/admin/UserForm';
import DeleteConfirmDialog from '../components/admin/DeleteConfirmDialog';

// Données fictives pour les utilisateurs
const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@example.com',
    role: 'admin',
    avatar: 'https://mui.com/static/images/avatar/1.jpg',
    isActive: true,
    createdAt: '2025-03-01T10:30:00Z',
    lastLogin: '2025-03-12T08:20:00Z'
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@example.com',
    role: 'user',
    avatar: 'https://mui.com/static/images/avatar/2.jpg',
    isActive: true,
    createdAt: '2025-03-02T14:45:00Z',
    lastLogin: '2025-03-11T16:40:00Z'
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre.durand@example.com',
    role: 'user',
    avatar: 'https://mui.com/static/images/avatar/3.jpg',
    isActive: true,
    createdAt: '2025-03-03T09:15:00Z',
    lastLogin: '2025-03-09T11:10:00Z'
  },
  {
    id: 4,
    name: 'Sophie Petit',
    email: 'sophie.petit@example.com',
    role: 'user',
    avatar: 'https://mui.com/static/images/avatar/4.jpg',
    isActive: false,
    createdAt: '2025-03-04T16:20:00Z',
    lastLogin: '2025-03-05T13:30:00Z'
  }
];

/**
 * Page d'administration des utilisateurs
 */
const AdminUsersPage = () => {
  // État des utilisateurs
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
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
  
  // État pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // État pour les notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Charger les données au montage du composant
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filtrer les utilisateurs lorsque le terme de recherche change
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setPage(0); // Réinitialiser la pagination
  }, [users, searchTerm]);
  
  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gestion de la recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Gestion du formulaire
  const handleOpenForm = (mode, user = null) => {
    setFormMode(mode);
    
    if (mode === 'edit' && user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
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
  
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Validation du formulaire
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
  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (formMode === 'add') {
      // Simuler l'ajout d'un utilisateur
      const newUser = {
        ...formData,
        id: Math.max(...users.map(u => u.id)) + 1,
        createdAt: new Date().toISOString(),
        lastLogin: null
      };
      
      // Supprimer les champs de mot de passe avant d'ajouter l'utilisateur
      delete newUser.password;
      delete newUser.confirmPassword;
      
      setUsers([...users, newUser]);
      
      setSnackbar({
        open: true,
        message: 'Utilisateur ajouté avec succès',
        severity: 'success'
      });
    } else {
      // Simuler la mise à jour d'un utilisateur
      const updatedUsers = users.map(user => {
        if (user.id === formData.id) {
          // Créer une copie de formData sans les champs de mot de passe
          const { password, confirmPassword, ...updatedUser } = formData;
          return updatedUser;
        }
        return user;
      });
      
      setUsers(updatedUsers);
      
      setSnackbar({
        open: true,
        message: 'Utilisateur mis à jour avec succès',
        severity: 'success'
      });
    }
    
    handleCloseForm();
  };
  
  // Gestion de la suppression
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
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
    
    // Simuler la suppression
    setUsers(users.filter(user => user.id !== userToDelete.id));
    setDeleteDialogOpen(false);
    setUserToDelete(null);
    
    setSnackbar({
      open: true,
      message: 'Utilisateur supprimé avec succès',
      severity: 'success'
    });
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };
  
  // Activer/désactiver un utilisateur
  const handleToggleActive = (user) => {
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
    const updatedUsers = users.map(u => 
      u.id === user.id ? { ...u, isActive: !u.isActive } : u
    );
    
    setUsers(updatedUsers);
    
    setSnackbar({
      open: true,
      message: `Utilisateur ${user.isActive ? 'désactivé' : 'activé'} avec succès`,
      severity: 'success'
    });
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
            Gestion des utilisateurs
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm('add')}
          >
            Ajouter un utilisateur
          </Button>
        </Box>
        
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Rechercher un utilisateur..."
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>
        </Card>
        
        <UserList
          users={filteredUsers}
          page={page}
          rowsPerPage={rowsPerPage}
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
