import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Apps as AppsIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Importer les services
import { getApps } from '../services/apps.service';
import { getCategories } from '../services/categories.service';
import { getUsers } from '../services/users.service';

/**
 * Composant pour les statistiques
 */
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Grid item>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography color="textPrimary" variant="h4">
              {value}
            </Typography>
          </Grid>
          <Grid item>
            <Box
              sx={{
                backgroundColor: color,
                borderRadius: 2,
                p: 1,
                color: 'white'
              }}
            >
              {icon}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * Composant pour les applications récentes
 */
const RecentApps = ({ apps, loading }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Applications récentes" />
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List>
          {apps.length > 0 ? (
            apps.map((app, i) => (
              <React.Fragment key={app.id}>
                <ListItem>
                  <ListItemText
                    primary={app.name}
                    secondary={`Ajoutée le ${new Date(app.createdAt).toLocaleDateString()}`}
                  />
                </ListItem>
                {i < apps.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Aucune application récente" />
            </ListItem>
          )}
        </List>
      )}
    </Card>
  );
};

/**
 * Composant pour les utilisateurs récents
 */
const RecentUsers = ({ users, loading }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Utilisateurs récents" />
      <Divider />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <List>
          {users.length > 0 ? (
            users.map((user, i) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={user.name}
                    secondary={`Inscrit le ${new Date(user.createdAt).toLocaleDateString()}`}
                  />
                </ListItem>
                {i < users.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="Aucun utilisateur récent" />
            </ListItem>
          )}
        </List>
      )}
    </Card>
  );
};

/**
 * Page du tableau de bord d'administration
 * 
 * Cette page affiche les statistiques globales et les données récentes
 * de la marketplace.
 */
const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  
  const [stats, setStats] = useState({
    appsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    downloadsCount: 0,
    averageRating: 0
  });
  
  const [recentApps, setRecentApps] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  /**
   * Charge les données du tableau de bord
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les applications
      const appsResult = await getApps({ 
        limit: 100, // Récupérer un grand nombre pour calculer les statistiques
        sort: 'newest' 
      });
      
      const apps = appsResult.apps || [];
      
      // Récupérer les catégories
      const categories = await getCategories();
      
      // Récupérer les utilisateurs
      const usersResult = await getUsers({ 
        limit: 100, // Récupérer un grand nombre pour calculer les statistiques
        sort: 'newest' 
      });
      
      const users = usersResult.users || [];
      
      // Calculer les statistiques
      const totalDownloads = apps.reduce((sum, app) => sum + (app.downloads || 0), 0);
      
      const appsWithRatings = apps.filter(app => app.averageRating);
      const averageRating = appsWithRatings.length > 0
        ? appsWithRatings.reduce((sum, app) => sum + app.averageRating, 0) / appsWithRatings.length
        : 0;
      
      setStats({
        appsCount: apps.length,
        categoriesCount: categories.length,
        usersCount: users.length,
        downloadsCount: totalDownloads,
        averageRating: averageRating
      });
      
      // Récupérer les applications récentes (5 dernières)
      const sortedApps = [...apps].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentApps(sortedApps.slice(0, 5));
      
      // Récupérer les utilisateurs récents (5 derniers)
      const sortedUsers = [...users].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentUsers(sortedUsers.slice(0, 5));
    } catch (err) {
      console.error('Erreur lors du chargement des données du tableau de bord:', err);
      setError(err.message || 'Erreur lors du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les données au chargement du composant
  useEffect(() => {
    loadDashboardData();
  }, []);
  
  /**
   * Rafraîchit les données du tableau de bord
   */
  const handleRefresh = () => {
    loadDashboardData();
  };
  
  if (loading && !recentApps.length && !recentUsers.length) {
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
            Tableau de bord d'administration
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Rafraîchir
          </Button>
        </Box>
        
        {/* Message d'erreur */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Statistiques */}
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="APPLICATIONS"
              value={stats.appsCount}
              icon={<AppsIcon />}
              color="#4f46e5"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="CATÉGORIES"
              value={stats.categoriesCount}
              icon={<CategoryIcon />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="UTILISATEURS"
              value={stats.usersCount}
              icon={<PeopleIcon />}
              color="#f59e0b"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="TÉLÉCHARGEMENTS"
              value={stats.downloadsCount}
              icon={<DownloadIcon />}
              color="#3b82f6"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <StatCard
              title="NOTE MOYENNE"
              value={stats.averageRating.toFixed(1)}
              icon={<StarIcon />}
              color="#ef4444"
            />
          </Grid>
          
          {/* Applications et utilisateurs récents */}
          <Grid item xs={12} md={6}>
            <RecentApps apps={recentApps} loading={loading} />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentUsers users={recentUsers} loading={loading} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
