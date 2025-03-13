import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';

/**
 * Composant de formulaire pour ajouter ou modifier un utilisateur
 */
const UserForm = ({
  open,
  onClose,
  formMode,
  formData,
  formErrors,
  handleFormChange,
  handleSwitchChange,
  handleFormSubmit
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleFormSubmit}>
        <DialogTitle>
          {formMode === 'add' ? 'Ajouter un utilisateur' : 'Modifier l\'utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Rôle"
                >
                  <MenuItem value="user">Utilisateur</MenuItem>
                  <MenuItem value="admin">Administrateur</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de l'avatar"
                name="avatar"
                value={formData.avatar}
                onChange={handleFormChange}
                helperText="Laissez vide pour utiliser l'avatar par défaut"
              />
            </Grid>
            
            {/* Champs de mot de passe (requis pour l'ajout, optionnels pour la modification) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={formMode === 'add' ? 'Mot de passe' : 'Nouveau mot de passe (optionnel)'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleFormChange}
                error={!!formErrors.password}
                helperText={formErrors.password || 'Minimum 6 caractères'}
                required={formMode === 'add'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={formMode === 'add' ? 'Confirmer le mot de passe' : 'Confirmer le nouveau mot de passe'}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleFormChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                required={formMode === 'add'}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleSwitchChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Utilisateur actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} startIcon={<CancelIcon />}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
          >
            {formMode === 'add' ? 'Ajouter' : 'Mettre à jour'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
