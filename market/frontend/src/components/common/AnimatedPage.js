import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Variantes d'animation pour les transitions de page
 * Définit les états initial, d'entrée et de sortie pour l'animation
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

/**
 * Configuration de la transition pour les animations de page
 */
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

/**
 * Composant qui ajoute des animations de transition aux pages
 * Enveloppe le contenu de la page avec des animations d'entrée et de sortie
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Contenu de la page à animer
 * @param {Object} props.variants - Variantes d'animation personnalisées (optionnel)
 * @param {Object} props.transition - Configuration de transition personnalisée (optionnel)
 * @returns {JSX.Element} Page avec animations
 */
const AnimatedPage = ({ 
  children, 
  variants = pageVariants, 
  transition = pageTransition 
}) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

AnimatedPage.propTypes = {
  children: PropTypes.node.isRequired,
  variants: PropTypes.object,
  transition: PropTypes.object
};

export default AnimatedPage;
