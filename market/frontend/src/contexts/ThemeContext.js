import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import baseTheme from '../theme';

// Création du contexte
const ThemeContext = createContext();

// Hook personnalisé pour utiliser le contexte de thème
export const useThemeMode = () => useContext(ThemeContext);

// Fournisseur du contexte de thème
export const ThemeProvider = ({ children }) => {
  // Vérifier si le thème sombre est stocké dans localStorage
  const storedTheme = localStorage.getItem('darkMode');
  const [darkMode, setDarkMode] = useState(storedTheme === 'true');

  // Mettre à jour le thème dans localStorage lorsqu'il change
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fonction pour basculer entre les thèmes clair et sombre
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Créer le thème en fonction du mode
  const theme = createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode ? {
        // Thème sombre
        background: {
          default: '#111827',
          paper: '#1f2937',
        },
        text: {
          primary: '#f9fafb',
          secondary: '#9ca3af',
        },
      } : {
        // Thème clair (déjà défini dans baseTheme)
      }),
    },
  });

  // Valeur du contexte
  const value = {
    darkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
