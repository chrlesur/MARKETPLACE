import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Rating,
  Divider,
  Paper
} from '@mui/material';

/**
 * Composant pour afficher la liste des évaluations d'une application
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.ratings - Liste des évaluations
 * @returns {JSX.Element} Composant RatingsList
 */
const RatingsList = ({ ratings = [] }) => {
  // Trier les évaluations par date (plus récentes d'abord)
  const sortedRatings = [...ratings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sortedRatings.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Aucune évaluation pour le moment. Soyez le premier à donner votre avis !
        </Typography>
      </Paper>
    );
  }

  return (
    <List>
      {sortedRatings.map((rating, index) => (
        <React.Fragment key={rating._id || index}>
          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
            <ListItemAvatar>
              <Avatar>
                {rating.user?.name?.charAt(0) || 'U'}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    {rating.user?.name || 'Utilisateur anonyme'}
                  </Typography>
                  <Rating value={rating.rating} readOnly size="small" />
                </Box>
              }
              secondary={
                <React.Fragment>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ my: 1, whiteSpace: 'pre-line' }}
                  >
                    {rating.comment || 'Aucun commentaire'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'Date inconnue'}
                  </Typography>
                </React.Fragment>
              }
            />
          </ListItem>
          {index < sortedRatings.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default RatingsList;
