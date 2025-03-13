import React from 'react';
import { Box } from '@mui/material';

/**
 * Composant TabPanel pour les onglets
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu de l'onglet
 * @param {number} props.value - Valeur de l'onglet actif
 * @param {number} props.index - Index de cet onglet
 * @returns {JSX.Element} Composant TabPanel
 */
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default TabPanel;
