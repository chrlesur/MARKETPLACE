import React, { Component } from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

/**
 * Composant ErrorBoundary pour capturer les erreurs React
 * Ce composant attrape les erreurs qui se produisent dans ses composants enfants
 * et affiche un message d'erreur convivial au lieu de planter l'application
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Met à jour l'état lorsqu'une erreur est détectée
   * @param {Error} error - L'erreur capturée
   * @returns {Object} Nouvel état
   */
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  /**
   * Capture les détails de l'erreur et les stocke dans l'état
   * @param {Error} error - L'erreur capturée
   * @param {Object} errorInfo - Informations supplémentaires sur l'erreur
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
  }

  render() {
    // Si une erreur a été détectée, afficher un message d'erreur convivial
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h5" component="h2">
                Une erreur est survenue
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Nous sommes désolés, une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support si le problème persiste.
            </Typography>
            
            {/* Afficher les détails de l'erreur en mode développement uniquement */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, overflow: 'auto' }}>
                <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', mt: 2 }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Rafraîchir la page
              </Button>
              <Button 
                variant="contained" 
                onClick={() => window.history.back()}
              >
                Retour à la page précédente
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    // Si aucune erreur n'a été détectée, rendre les enfants normalement
    return this.props.children;
  }
}

export default ErrorBoundary;
