import React from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  Paper
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

/**
 * Composant pour le formulaire d'évaluation d'une application
 * @param {Object} props - Propriétés du composant
 * @param {number} props.userRating - Note de l'utilisateur
 * @param {string} props.userComment - Commentaire de l'utilisateur
 * @param {boolean} props.ratingSubmitting - Indique si l'envoi est en cours
 * @param {string|null} props.ratingError - Message d'erreur éventuel
 * @param {Function} props.setUserRating - Fonction pour mettre à jour la note
 * @param {Function} props.setUserComment - Fonction pour mettre à jour le commentaire
 * @param {Function} props.handleRatingSubmit - Fonction pour soumettre l'évaluation
 * @param {Function} props.handleRatingDelete - Fonction pour supprimer l'évaluation
 * @returns {JSX.Element} Composant RatingForm
 */
const RatingForm = ({
  userRating,
  userComment,
  ratingSubmitting,
  ratingError,
  setUserRating,
  setUserComment,
  handleRatingSubmit,
  handleRatingDelete
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <form onSubmit={handleRatingSubmit}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Note
          </Typography>
          <Rating
            name="user-rating"
            value={userRating}
            onChange={(event, newValue) => setUserRating(newValue)}
            precision={1}
            size="large"
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Commentaire (optionnel)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            placeholder="Partagez votre expérience avec cette application..."
            variant="outlined"
          />
        </Box>
        
        {ratingError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {ratingError}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {userRating > 0 && (
            <Button
              type="button"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleRatingDelete}
              disabled={ratingSubmitting}
            >
              Supprimer
            </Button>
          )}
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={userRating === 0 || ratingSubmitting}
            sx={{ ml: 'auto' }}
          >
            {ratingSubmitting ? 'Envoi en cours...' : 'Envoyer'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default RatingForm;
