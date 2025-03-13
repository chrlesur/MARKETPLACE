import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Card, CardContent, CardHeader, Divider, List, ListItem, ListItemText, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  Apps as AppsIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Download as DownloadIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Composant pour les statistiques
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

// Composant pour les applications récentes
const RecentApps = ({ apps }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Applications récentes" />
      <Divider />
      <List>
        {apps.map((app, i) => (
          <React.Fragment key={app.id}>
            <ListItem>
              <ListItemText
                primary={app.name}
                secondary={`Ajoutée le ${new Date(app.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
            {i < apps.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Card>
  );
};

// Composant pour les utilisateurs récents
const RecentUsers = ({ users }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Utilisateurs récents" />
      <Divider />
      <List>
        {users.map((user, i) => (
          <React.Fragment key={user.id}>
            <ListItem>
              <ListItemText
                primary={user.name}
                secondary={`Inscrit le ${new Date(user.createdAt).toLocaleDateString()}`}
              />
            </ListItem>
            {i < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Card>
  );
};

const AdminDashboardPage = () => {
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
  
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setStats({
        appsCount: 12,
        categoriesCount: 6,
        usersCount: 48,
        downloadsCount: 1250,
        averageRating: 4.2
      });
      
      setRecentApps([
        { id: 1, name: 'Transkryptor', createdAt: '2025-03-10T10:30:00Z' },
        { id: 2, name: 'DataVisualizer', createdAt: '2025-03-08T14:15:00Z' },
        { id: 3, name: 'Collaborator', createdAt: '2025-03-05T09:45:00Z' }
      ]);
      
      setRecentUsers([
        { id: 1, name: 'Jean Dupont', createdAt: '2025-03-12T08:20:00Z' },
        { id: 2, name: 'Marie Martin', createdAt: '2025-03-11T16:40:00Z' },
        { id: 3, name: 'Pierre Durand', createdAt: '2025-03-09T11:10:00Z' }
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);
  
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
        <Typography variant="h4" sx={{ mb: 3 }}>
          Tableau de bord d'administration
        </Typography>
        
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
            <RecentApps apps={recentApps} />
          </Grid>
          <Grid item xs={12} md={6}>
            <RecentUsers users={recentUsers} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboardPage;
