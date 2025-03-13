import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Données fictives pour les applications
const mockApps = [
  {
    id: 1,
    name: 'Transkryptor',
    slug: 'transkryptor',
    description: {
      short: 'Application de transcription audio et d\'analyse de contenu utilisant l\'IA.'
    },
    developer: {
      name: 'Christophe LESUR'
    },
    category: {
      name: 'Productivité',
      slug: 'productivity'
    },
    pricing: {
      type: 'free',
      price: 0
    },
    averageRating: 4.8,
    downloads: 1250,
    isActive: true,
    isFeatured: true,
    createdAt: '2025-03-10T10:30:00Z',
    updatedAt: '2025-03-12T14:45:00Z'
  },
  {
    id: 2,
    name: 'DataVisualizer',
    slug: 'data-visualizer',
    description: {
      short: 'Créez des visualisations de données interactives et des tableaux de bord personnalisés.'
    },
    developer: {
      name: 'DataViz Inc.'
    },
    category: {
      name: 'Analyse de données',
      slug: 'data-analysis'
    },
    pricing: {
      type: 'paid',
      price: 29.99
    },
    averageRating: 4.2,
    downloads: 850,
    isActive: true,
    isFeatured: false,
    createdAt: '2025-03-08T14:15:00Z',
    updatedAt: '2025-03-11T09:20:00Z'
  },
  {
    id: 3,
    name: 'Collaborator',
    slug: 'collaborator',
    description: {
      short: 'Plateforme de collaboration en temps réel pour les équipes distribuées.'
    },
    developer: {
      name: 'TeamWork Solutions'
    },
    category: {
      name: 'Communication',
      slug: 'communication'
    },
    pricing: {
      type: 'subscription',
      price: 19.99
    },
    averageRating: 4.5,
    downloads: 1120,
    isActive: true,
    isFeatured: false,
    createdAt: '2025-03-05T09:45:00Z',
    updatedAt: '2025-03-09T16:30:00Z'
  },
  {
    id: 4,
    name: 'CodeAssistant',
    slug: 'code-assistant',
    description: {
      short: 'Assistant de programmation alimenté par l\'IA pour les développeurs.'
    },
    developer: {
      name: 'DevTools Pro'
    },
    category: {
      name: 'Développement',
      slug: 'development'
    },
    pricing: {
      type: 'paid',
      price: 49.99
    },
    averageRating: 4.7,
    downloads: 980,
    isActive: false,
    isFeatured: false,
    createdAt: '2025-03-02T11:20:00Z',
    updatedAt: '2025-03-07T13:10:00Z'
  }
];

const AdminAppsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setApps(mockApps);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filtrer les applications en fonction du terme de recherche
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.description.short.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.developer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Recherche
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Suppression
  const handleDeleteClick = (app) => {
    setAppToDelete(app);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    // Simuler la suppression
    setApps(apps.filter(app => app.id !== appToDelete.id));
    setDeleteDialogOpen(false);
    setAppToDelete(null);
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setAppToDelete(null);
  };
  
  // Formatage du prix
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Gestion des applications
          </Typography>
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
              {filteredApps
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((app) => (
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
                        {app.averageRating.toFixed(1)}
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
              {filteredApps.length === 0 && (
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
            count={filteredApps.length}
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
      </Container>
    </Box>
  );
};

export default AdminAppsPage;
