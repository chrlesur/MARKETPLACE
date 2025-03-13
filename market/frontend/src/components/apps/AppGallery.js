import React from 'react';
import {
  Box,
  Paper
} from '@mui/material';

/**
 * Composant pour afficher la galerie d'images d'une application
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.app - Données de l'application
 * @param {Function} props.handleOpenGallery - Fonction pour ouvrir la galerie en plein écran
 * @returns {JSX.Element} Composant AppGallery
 */
const AppGallery = ({ app, handleOpenGallery }) => {
  if (!app) return null;

  return (
    <>
      {/* Image principale */}
      <Paper
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
          cursor: 'pointer'
        }}
        onClick={() => handleOpenGallery(0)}
      >
        <Box
          component="img"
          src={app.images?.banner || app.images?.icon || `https://via.placeholder.com/800x400/4f46e5/ffffff?text=${app.name}`}
          alt={app.name}
          sx={{
            width: '100%',
            height: 'auto',
            maxHeight: 400,
            objectFit: 'cover'
          }}
        />
      </Paper>
      
      {/* Miniatures */}
      {app.images?.screenshots && app.images.screenshots.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {app.images.screenshots.map((screenshot, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{
                width: 80,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
              onClick={() => handleOpenGallery(index + 2)} // +2 pour tenir compte de la bannière et de l'icône
            >
              <Box
                component="img"
                src={screenshot.url}
                alt={screenshot.caption || `Capture d'écran ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Paper>
          ))}
        </Box>
      )}
    </>
  );
};

export default AppGallery;
