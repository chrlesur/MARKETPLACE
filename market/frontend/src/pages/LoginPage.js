import React, { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page de connexion
 * @returns {JSX.Element} Page LoginPage
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Récupérer l'URL de redirection si elle existe
  // Vérifier d'abord le paramètre redirect dans l'URL, puis location.state.from, sinon utiliser '/'
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || location.state?.from || '/';
  
  // Logs pour déboguer les redirections
  console.log('LoginPage - Paramètres de redirection:', {
    redirectParam,
    locationState: location.state,
    finalRedirection: from
  });
  
  // États pour le formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Appel au service d'authentification
      await login(email, password);
      
      // Redirection après connexion réussie
      console.log('Redirection après connexion réussie vers:', from);
      navigate(from, { replace: true });
      
    } catch (err) {
      console.error('Erreur lors de la connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            Connexion
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Connectez-vous pour accéder à votre compte
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          
          <TextField
            label="Mot de passe"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <Box sx={{ mt: 1, mb: 3, textAlign: 'right' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Mot de passe oublié ?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
          
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Vous n'avez pas de compte ?{' '}
              <Link component={RouterLink} to="/register" variant="body2">
                Créer un compte
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginPage;
