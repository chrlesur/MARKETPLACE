import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          textAlign: 'center',
          py: 8
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 2,
            maxWidth: 600,
            width: '100%'
          }}
        >
          <Typography
            variant="h1"
            color="primary"
            sx={{
              fontSize: { xs: '6rem', md: '8rem' },
              fontWeight: 800,
              mb: 2,
              opacity: 0.8
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2
            }}
          >
            Page non trouvée
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 450,
              mx: 'auto'
            }}
          >
            La page que vous recherchez n'existe pas ou a été déplacée. Veuillez vérifier l'URL ou retourner à la page d'accueil.
          </Typography>
          <Button
            component={RouterLink}
            to="/"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            sx={{ px: 4 }}
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
