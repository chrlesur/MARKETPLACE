/**
 * Application NotePad
 * Une application de prise de notes intégrée à la Marketplace
 * 
 * @module apps/notepad/public/js/app
 * @author Marketplace Team
 * @version 1.0.0
 */

// Importer le module d'intégration avec la Marketplace
import { 
  initializeAuth, 
  getCurrentUser, 
  createMarketplaceNavbar,
  showSuccessNotification as showSuccess,
  showErrorNotification as showError,
  showInfoNotification as showInfo
} from './marketplace-integration.js';

// Modèle de données
class NoteModel {
  constructor() {
    this.notes = [];
    this.currentNote = null;
    this.storageKey = 'notepad_notes';
  }
  
  // Charger les notes depuis le localStorage
  loadNotes() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const userStorageKey = `${this.storageKey}_${user.id}`;
    const storedNotes = localStorage.getItem(userStorageKey);
    
    if (storedNotes) {
      try {
        this.notes = JSON.parse(storedNotes);
      } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
        this.notes = [];
      }
    }
    
    return this.notes;
  }
  
  // Sauvegarder les notes dans le localStorage
  saveNotes() {
    const user = getCurrentUser();
    if (!user) return;
    
    const userStorageKey = `${this.storageKey}_${user.id}`;
    localStorage.setItem(userStorageKey, JSON.stringify(this.notes));
  }
  
  // Créer une nouvelle note
  createNote() {
    const now = new Date();
    const newNote = {
      id: Date.now().toString(),
      title: 'Nouvelle note',
      content: '',
      tags: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    this.notes.unshift(newNote);
    this.currentNote = newNote;
    this.saveNotes();
    
    return newNote;
  }
  
  // Mettre à jour une note
  updateNote(id, data) {
    const noteIndex = this.notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      throw new Error('Note non trouvée');
    }
    
    const updatedNote = {
      ...this.notes[noteIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.notes[noteIndex] = updatedNote;
    this.currentNote = updatedNote;
    this.saveNotes();
    
    return updatedNote;
  }
  
  // Supprimer une note
  deleteNote(id) {
    const noteIndex = this.notes.findIndex(note => note.id === id);
    
    if (noteIndex === -1) {
      throw new Error('Note non trouvée');
    }
    
    this.notes.splice(noteIndex, 1);
    this.currentNote = null;
    this.saveNotes();
  }
  
  // Obtenir une note par son ID
  getNote(id) {
    return this.notes.find(note => note.id === id);
  }
  
  // Rechercher des notes
  searchNotes(query) {
    if (!query) return this.notes;
    
    const lowerQuery = query.toLowerCase();
    
    return this.notes.filter(note => {
      return (
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });
  }
}

// Vue
class NoteView {
  constructor() {
    console.log('NotePad - Initialisation de la vue');
    
    try {
      // Éléments de la sidebar
      console.log('NotePad - Récupération des éléments de la sidebar');
      this.notesList = this.getElement('notes-list', 'Liste des notes');
      this.emptyState = this.getElement('empty-state', 'État vide');
      this.searchInput = this.getElement('search-notes', 'Champ de recherche');
      this.newNoteBtn = this.getElement('new-note-btn', 'Bouton nouvelle note');
      this.createFirstNoteBtn = this.getElement('create-first-note-btn', 'Bouton créer première note');
      
      // Éléments de l'éditeur
      console.log('NotePad - Récupération des éléments de l\'éditeur');
      this.noteTitle = this.getElement('note-title', 'Titre de la note');
      this.noteContent = this.getElement('note-content', 'Contenu de la note');
      this.noteTags = this.getElement('note-tags', 'Tags de la note');
      this.noteDate = this.getElement('note-date', 'Date de la note');
      this.noteWordCount = this.getElement('note-word-count', 'Compteur de mots');
      this.saveNoteBtn = this.getElement('save-note-btn', 'Bouton enregistrer');
      this.deleteNoteBtn = this.getElement('delete-note-btn', 'Bouton supprimer');
      this.editorToolbar = this.getElement('editor-toolbar', 'Barre d\'outils');
      
      // Éléments des modals
      console.log('NotePad - Récupération des éléments des modals');
      this.deleteConfirmModal = this.getElement('delete-confirm-modal', 'Modal de confirmation de suppression');
      this.deleteModalClose = this.getElement('delete-modal-close', 'Bouton fermer modal de suppression');
      this.deleteCancelBtn = this.getElement('delete-cancel-btn', 'Bouton annuler suppression');
      this.deleteConfirmBtn = this.getElement('delete-confirm-btn', 'Bouton confirmer suppression');
      
      this.linkModal = this.getElement('link-modal', 'Modal de lien');
      this.linkModalClose = this.getElement('link-modal-close', 'Bouton fermer modal de lien');
      this.linkText = this.getElement('link-text', 'Texte du lien');
      this.linkUrl = this.getElement('link-url', 'URL du lien');
      this.linkCancelBtn = this.getElement('link-cancel-btn', 'Bouton annuler lien');
      this.linkConfirmBtn = this.getElement('link-confirm-btn', 'Bouton confirmer lien');
      
      this.imageModal = this.getElement('image-modal', 'Modal d\'image');
      this.imageModalClose = this.getElement('image-modal-close', 'Bouton fermer modal d\'image');
      this.imageAlt = this.getElement('image-alt', 'Texte alternatif de l\'image');
      this.imageUrl = this.getElement('image-url', 'URL de l\'image');
      this.imageCancelBtn = this.getElement('image-cancel-btn', 'Bouton annuler image');
      this.imageConfirmBtn = this.getElement('image-confirm-btn', 'Bouton confirmer image');
      
      console.log('NotePad - Vue initialisée avec succès');
    } catch (error) {
      console.error('NotePad - Erreur lors de l\'initialisation de la vue:', error);
    }
  }
  
  // Méthode utilitaire pour récupérer un élément DOM avec gestion d'erreur
  getElement(id, description) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`NotePad - Élément non trouvé: ${id} (${description})`);
    }
    return element;
  }
  
  // Afficher la liste des notes
  renderNotesList(notes) {
    console.log('NotePad - Début du rendu de la liste des notes', { notesCount: notes.length });
    
    try {
      // Vérifier si la liste des notes existe
      if (!this.notesList) {
        console.error('NotePad - Élément notesList non disponible');
        return;
      }
      
      // Vérifier si l'état vide existe
      if (!this.emptyState) {
        console.error('NotePad - Élément emptyState non disponible');
        return;
      }
      
      // Vider la liste - Méthode alternative pour éviter une boucle infinie potentielle
      try {
        console.log('NotePad - Vidage de la liste des notes (méthode alternative)');
        
        // Sauvegarder l'état vide s'il est un enfant de la liste
        let emptyStateParent = null;
        if (this.emptyState.parentNode === this.notesList) {
          emptyStateParent = this.notesList;
          this.notesList.removeChild(this.emptyState);
        }
        
        // Vider complètement la liste
        this.notesList.innerHTML = '';
        
        // Réinsérer l'état vide si nécessaire
        if (emptyStateParent) {
          this.notesList.appendChild(this.emptyState);
        }
        
        console.log('NotePad - Liste des notes vidée avec succès');
      } catch (clearError) {
        console.error('NotePad - Erreur lors du vidage de la liste des notes:', clearError);
      }
      
      // Afficher l'état vide si aucune note
      if (notes.length === 0) {
        console.log('NotePad - Aucune note à afficher, affichage de l\'état vide');
        this.emptyState.style.display = 'flex';
        return;
      }
      
      // Cacher l'état vide
      console.log('NotePad - Masquage de l\'état vide');
      this.emptyState.style.display = 'none';
      
      // Ajouter chaque note à la liste
      console.log(`NotePad - Ajout de ${notes.length} notes à la liste`);
      
      notes.forEach((note, index) => {
        try {
          console.log(`NotePad - Création de l'élément pour la note ${index + 1}/${notes.length} (ID: ${note.id})`);
          
          const noteItem = document.createElement('div');
          noteItem.className = 'note-item';
          noteItem.dataset.id = note.id;
          
          // Ajouter la classe active si c'est la note courante
          if (note.id === this.currentNoteId) {
            noteItem.classList.add('active');
          }
          
          // Créer le contenu de l'élément avec une méthode plus sûre
          const title = note.title || 'Sans titre';
          const content = note.content || '';
          const updatedAt = note.updatedAt || new Date().toISOString();
          
          try {
            // Créer les éléments individuellement au lieu d'utiliser innerHTML
            const titleElement = document.createElement('div');
            titleElement.className = 'note-item-title';
            titleElement.textContent = title;
            noteItem.appendChild(titleElement);
            
            const previewElement = document.createElement('div');
            previewElement.className = 'note-item-preview';
            try {
              previewElement.textContent = this.getPreview(content);
            } catch (previewError) {
              console.error(`NotePad - Erreur lors de la génération de l'aperçu:`, previewError);
              previewElement.textContent = 'Erreur lors du chargement de l\'aperçu';
            }
            noteItem.appendChild(previewElement);
            
            const dateElement = document.createElement('div');
            dateElement.className = 'note-item-date';
            try {
              dateElement.textContent = this.formatDate(updatedAt);
            } catch (dateError) {
              console.error(`NotePad - Erreur lors du formatage de la date:`, dateError);
              dateElement.textContent = 'Date inconnue';
            }
            noteItem.appendChild(dateElement);
          } catch (contentError) {
            console.error(`NotePad - Erreur lors de la création du contenu de la note ${note.id}:`, contentError);
            // Fallback simple en cas d'erreur
            noteItem.textContent = title;
          }
          
          this.notesList.appendChild(noteItem);
        } catch (noteError) {
          console.error(`NotePad - Erreur lors de la création de l'élément pour la note ${index + 1}/${notes.length}:`, noteError);
        }
      });
      
      console.log('NotePad - Fin du rendu de la liste des notes');
    } catch (error) {
      console.error('NotePad - Erreur globale lors du rendu de la liste des notes:', error);
    }
  }
  
  // Afficher une note dans l'éditeur
  renderNote(note) {
    console.log('NotePad - Début du rendu de la note dans l\'éditeur', { hasNote: !!note });
    
    try {
      // Vérifier si les éléments de l'éditeur existent
      if (!this.noteTitle || !this.noteContent || !this.noteTags || !this.noteDate || !this.noteWordCount || !this.saveNoteBtn || !this.deleteNoteBtn) {
        console.error('NotePad - Éléments de l\'éditeur non disponibles');
        return;
      }
      
      if (!note) {
        console.log('NotePad - Aucune note à afficher, désactivation de l\'éditeur');
        
        try {
          // Désactiver l'éditeur
          this.noteTitle.value = '';
          this.noteContent.innerHTML = '';
          this.noteTags.value = '';
          this.noteDate.textContent = 'Dernière modification : --/--/---- --:--';
          this.noteWordCount.textContent = '0 mots';
          
          this.noteTitle.disabled = true;
          this.noteContent.contentEditable = 'false';
          this.noteTags.disabled = true;
          this.saveNoteBtn.disabled = true;
          this.deleteNoteBtn.disabled = true;
          
          console.log('NotePad - Éditeur désactivé avec succès');
        } catch (disableError) {
          console.error('NotePad - Erreur lors de la désactivation de l\'éditeur:', disableError);
        }
        
        return;
      }
      
      console.log(`NotePad - Affichage de la note (ID: ${note.id}) dans l'éditeur`);
      
      try {
        // Activer l'éditeur
        this.noteTitle.disabled = false;
        this.noteContent.contentEditable = 'true';
        this.noteTags.disabled = false;
        this.saveNoteBtn.disabled = false;
        this.deleteNoteBtn.disabled = false;
        
        console.log('NotePad - Éditeur activé avec succès');
      } catch (enableError) {
        console.error('NotePad - Erreur lors de l\'activation de l\'éditeur:', enableError);
      }
      
      try {
        // Remplir les champs
        const title = note.title || 'Sans titre';
        const content = note.content || '';
        const tags = note.tags || [];
        const updatedAt = note.updatedAt || new Date().toISOString();
        
        this.noteTitle.value = title;
        this.noteContent.innerHTML = content;
        this.noteTags.value = tags.join(', ');
        
        try {
          const formattedDate = this.formatDate(updatedAt, true);
          this.noteDate.textContent = `Dernière modification : ${formattedDate}`;
        } catch (dateError) {
          console.error('NotePad - Erreur lors du formatage de la date:', dateError);
          this.noteDate.textContent = 'Dernière modification : date inconnue';
        }
        
        try {
          this.updateWordCount();
        } catch (countError) {
          console.error('NotePad - Erreur lors de la mise à jour du compteur de mots:', countError);
        }
        
        console.log('NotePad - Champs de l\'éditeur remplis avec succès');
      } catch (fillError) {
        console.error('NotePad - Erreur lors du remplissage des champs de l\'éditeur:', fillError);
      }
      
      // Sauvegarder l'ID de la note courante
      this.currentNoteId = note.id;
      
      console.log('NotePad - Fin du rendu de la note dans l\'éditeur');
    } catch (error) {
      console.error('NotePad - Erreur globale lors du rendu de la note dans l\'éditeur:', error);
    }
  }
  
  // Obtenir un aperçu du contenu
  getPreview(content) {
    // Supprimer les balises HTML
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Limiter à 50 caractères
    return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
  }
  
  // Formater une date
  formatDate(dateString, withTime = false) {
    const date = new Date(dateString);
    
    if (withTime) {
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Mettre à jour le compteur de mots
  updateWordCount() {
    const text = this.noteContent.textContent || '';
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    this.noteWordCount.textContent = `${wordCount} mot${wordCount !== 1 ? 's' : ''}`;
  }
  
  // Afficher une modal
  showModal(modal) {
    modal.classList.add('active');
  }
  
  // Cacher une modal
  hideModal(modal) {
    modal.classList.remove('active');
  }
}

// Contrôleur
class NoteController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    // Initialiser l'application
    this.init();
  }
  
  // Initialiser l'application
  async init() {
    try {
      console.log('NotePad - Initialisation de l\'application');
      
      // Options de la barre de navigation communes
      const navbarOptions = {
        menuItems: [
          { 
            label: 'Exporter toutes les notes', 
            onClick: () => this.exportAllNotes()
          }
        ]
      };
      
      // Initialiser l'authentification avec un timeout de secours
      const initTimeout = setTimeout(() => {
        console.error('NotePad - Timeout global de l\'initialisation après 8 secondes');
        this.initializeWithoutAuth(navbarOptions);
      }, 8000);
      
      // Initialiser l'authentification
      const user = await initializeAuth({
        requireAuth: false, // Ne pas rediriger automatiquement
        navbarOptions: navbarOptions, // Passer les options de la barre de navigation
        onSuccess: (user) => {
          clearTimeout(initTimeout);
          console.log('NotePad - Authentification réussie dans app.js');
          
          // La barre de navigation est déjà créée par initializeAuth
          
          // Charger les notes
          this.loadNotes();
          
          // Initialiser les événements
          this.initEvents();
          
          // Afficher un message de bienvenue
          if (user && user.name) {
            showSuccess(`Bienvenue sur NotePad, ${user.name} !`);
          } else {
            showSuccess('Bienvenue sur NotePad !');
          }
        },
        onFailure: (reason) => {
          clearTimeout(initTimeout);
          console.error(`Échec de l'authentification dans app.js: ${reason}`);
          this.initializeWithoutAuth(navbarOptions);
        }
      });
      
      // Si l'authentification a échoué mais n'a pas appelé onFailure
      if (!user) {
        clearTimeout(initTimeout);
        console.log('NotePad - Authentification terminée sans utilisateur');
        this.initializeWithoutAuth(navbarOptions);
      }
    } catch (error) {
      console.error('NotePad - Erreur lors de l\'initialisation:', error);
      this.initializeWithoutAuth();
    }
  }
  
  // Initialiser l'application sans authentification
  initializeWithoutAuth(navbarOptions = {}) {
    console.log('NotePad - Initialisation sans authentification');
    
    try {
      // Créer la barre de navigation avec les options fournies
      createMarketplaceNavbar({
        ...navbarOptions,
        menuItems: navbarOptions.menuItems || [
          { 
            label: 'Exporter toutes les notes', 
            onClick: () => this.exportAllNotes()
          }
        ]
      });
    } catch (error) {
      console.error('NotePad - Erreur lors de la création de la barre de navigation:', error);
    }
    
    // Charger les notes
    this.loadNotes();
    
    // Initialiser les événements
    this.initEvents();
    
    // Afficher un message de bienvenue
    showInfo('Bienvenue sur NotePad ! Certaines fonctionnalités peuvent être limitées.');
  }
  
  // Charger les notes
  loadNotes() {
    try {
      console.log('NotePad - Début du chargement des notes');
      
      // Vérifier si le modèle est disponible
      if (!this.model) {
        console.error('NotePad - Modèle non disponible');
        return;
      }
      
      // Charger les notes avec gestion d'erreur
      let notes = [];
      try {
        notes = this.model.loadNotes();
        console.log(`NotePad - ${notes.length} notes chargées`);
      } catch (loadError) {
        console.error('NotePad - Erreur lors du chargement des notes:', loadError);
        notes = [];
      }
      
      // Vérifier si la vue est disponible
      if (!this.view) {
        console.error('NotePad - Vue non disponible');
        return;
      }
      
      // Rendre la liste des notes avec gestion d'erreur
      try {
        this.view.renderNotesList(notes);
        console.log('NotePad - Liste des notes rendue');
      } catch (renderError) {
        console.error('NotePad - Erreur lors du rendu de la liste des notes:', renderError);
      }
      
      // Sélectionner la première note si disponible
      if (notes.length > 0) {
        try {
          console.log(`NotePad - Sélection de la première note (ID: ${notes[0].id})`);
          this.selectNote(notes[0].id);
        } catch (selectError) {
          console.error('NotePad - Erreur lors de la sélection de la première note:', selectError);
          // Essayer de rendre une note vide en cas d'erreur
          try {
            this.view.renderNote(null);
          } catch (renderNullError) {
            console.error('NotePad - Erreur lors du rendu d\'une note vide:', renderNullError);
          }
        }
      } else {
        try {
          console.log('NotePad - Aucune note disponible, rendu d\'une note vide');
          this.view.renderNote(null);
        } catch (renderNullError) {
          console.error('NotePad - Erreur lors du rendu d\'une note vide:', renderNullError);
        }
      }
      
      console.log('NotePad - Fin du chargement des notes');
    } catch (error) {
      console.error('NotePad - Erreur globale lors du chargement des notes:', error);
      try {
        showError('Erreur lors du chargement des notes');
      } catch (showError) {
        console.error('NotePad - Erreur lors de l\'affichage de l\'erreur:', showError);
      }
    }
  }
  
  // Initialiser les événements
  initEvents() {
    try {
      console.log('NotePad - Début de l\'initialisation des événements');
      
      // Vérifier si la vue est disponible
      if (!this.view) {
        console.error('NotePad - Vue non disponible pour l\'initialisation des événements');
        return;
      }
      
      // Événements de la sidebar
      try {
        console.log('NotePad - Initialisation des événements de la sidebar');
        
        // Vérifier si les éléments existent avant d'ajouter des écouteurs d'événements
        if (this.view.newNoteBtn) {
          this.view.newNoteBtn.addEventListener('click', () => {
            console.log('NotePad - Clic sur le bouton nouvelle note');
            this.createNote();
          });
        } else {
          console.error('NotePad - Élément newNoteBtn non trouvé');
        }
        
        if (this.view.createFirstNoteBtn) {
          this.view.createFirstNoteBtn.addEventListener('click', () => {
            console.log('NotePad - Clic sur le bouton créer première note');
            this.createNote();
          });
        } else {
          console.error('NotePad - Élément createFirstNoteBtn non trouvé');
        }
        
        if (this.view.searchInput) {
          this.view.searchInput.addEventListener('input', () => {
            console.log('NotePad - Saisie dans le champ de recherche');
            this.searchNotes();
          });
        } else {
          console.error('NotePad - Élément searchInput non trouvé');
        }
        
        if (this.view.notesList) {
          this.view.notesList.addEventListener('click', (e) => {
            const noteItem = e.target.closest('.note-item');
            if (noteItem) {
              console.log(`NotePad - Clic sur une note (ID: ${noteItem.dataset.id})`);
              this.selectNote(noteItem.dataset.id);
            }
          });
        } else {
          console.error('NotePad - Élément notesList non trouvé');
        }
        
        console.log('NotePad - Événements de la sidebar initialisés');
      } catch (sidebarError) {
        console.error('NotePad - Erreur lors de l\'initialisation des événements de la sidebar:', sidebarError);
      }
      
      // Événements de l'éditeur
      try {
        console.log('NotePad - Initialisation des événements de l\'éditeur');
        
        if (this.view.saveNoteBtn) {
          this.view.saveNoteBtn.addEventListener('click', () => {
            console.log('NotePad - Clic sur le bouton enregistrer');
            this.saveNote();
          });
        } else {
          console.error('NotePad - Élément saveNoteBtn non trouvé');
        }
        
        if (this.view.deleteNoteBtn) {
          this.view.deleteNoteBtn.addEventListener('click', () => {
            console.log('NotePad - Clic sur le bouton supprimer');
            this.confirmDeleteNote();
          });
        } else {
          console.error('NotePad - Élément deleteNoteBtn non trouvé');
        }
        
        if (this.view.noteContent) {
          this.view.noteContent.addEventListener('input', () => {
            // Pas de log ici pour éviter de spammer la console
            try {
              this.view.updateWordCount();
              this.autoSaveNote();
            } catch (inputError) {
              console.error('NotePad - Erreur lors de la mise à jour du contenu:', inputError);
            }
          });
        } else {
          console.error('NotePad - Élément noteContent non trouvé');
        }
        
        if (this.view.noteTitle) {
          this.view.noteTitle.addEventListener('input', () => {
            // Pas de log ici pour éviter de spammer la console
            this.autoSaveNote();
          });
        } else {
          console.error('NotePad - Élément noteTitle non trouvé');
        }
        
        if (this.view.noteTags) {
          this.view.noteTags.addEventListener('input', () => {
            // Pas de log ici pour éviter de spammer la console
            this.autoSaveNote();
          });
        } else {
          console.error('NotePad - Élément noteTags non trouvé');
        }
        
        console.log('NotePad - Événements de l\'éditeur initialisés');
      } catch (editorError) {
        console.error('NotePad - Erreur lors de l\'initialisation des événements de l\'éditeur:', editorError);
      }
      
      // Événements de la barre d'outils
      try {
        console.log('NotePad - Initialisation des événements de la barre d\'outils');
        
        if (this.view.editorToolbar) {
          this.view.editorToolbar.addEventListener('click', (e) => {
            const button = e.target.closest('.toolbar-btn');
            if (button) {
              console.log(`NotePad - Clic sur le bouton de formatage: ${button.dataset.format}`);
              this.formatText(button.dataset.format);
            }
          });
        } else {
          console.error('NotePad - Élément editorToolbar non trouvé');
        }
        
        console.log('NotePad - Événements de la barre d\'outils initialisés');
      } catch (toolbarError) {
        console.error('NotePad - Erreur lors de l\'initialisation des événements de la barre d\'outils:', toolbarError);
      }
      
      // Événements des modals
      try {
        console.log('NotePad - Initialisation des événements des modals');
        
        // Modal de suppression
        if (this.view.deleteModalClose && this.view.deleteConfirmModal) {
          this.view.deleteModalClose.addEventListener('click', () => {
            console.log('NotePad - Fermeture de la modal de suppression');
            this.view.hideModal(this.view.deleteConfirmModal);
          });
        }
        
        if (this.view.deleteCancelBtn && this.view.deleteConfirmModal) {
          this.view.deleteCancelBtn.addEventListener('click', () => {
            console.log('NotePad - Annulation de la suppression');
            this.view.hideModal(this.view.deleteConfirmModal);
          });
        }
        
        if (this.view.deleteConfirmBtn) {
          this.view.deleteConfirmBtn.addEventListener('click', () => {
            console.log('NotePad - Confirmation de la suppression');
            this.deleteNote();
          });
        }
        
        // Modal de lien
        if (this.view.linkModalClose && this.view.linkModal) {
          this.view.linkModalClose.addEventListener('click', () => {
            console.log('NotePad - Fermeture de la modal de lien');
            this.view.hideModal(this.view.linkModal);
          });
        }
        
        if (this.view.linkCancelBtn && this.view.linkModal) {
          this.view.linkCancelBtn.addEventListener('click', () => {
            console.log('NotePad - Annulation de l\'ajout de lien');
            this.view.hideModal(this.view.linkModal);
          });
        }
        
        if (this.view.linkConfirmBtn) {
          this.view.linkConfirmBtn.addEventListener('click', () => {
            console.log('NotePad - Confirmation de l\'ajout de lien');
            this.insertLink();
          });
        }
        
        // Modal d'image
        if (this.view.imageModalClose && this.view.imageModal) {
          this.view.imageModalClose.addEventListener('click', () => {
            console.log('NotePad - Fermeture de la modal d\'image');
            this.view.hideModal(this.view.imageModal);
          });
        }
        
        if (this.view.imageCancelBtn && this.view.imageModal) {
          this.view.imageCancelBtn.addEventListener('click', () => {
            console.log('NotePad - Annulation de l\'ajout d\'image');
            this.view.hideModal(this.view.imageModal);
          });
        }
        
        if (this.view.imageConfirmBtn) {
          this.view.imageConfirmBtn.addEventListener('click', () => {
            console.log('NotePad - Confirmation de l\'ajout d\'image');
            this.insertImage();
          });
        }
        
        console.log('NotePad - Événements des modals initialisés');
      } catch (modalError) {
        console.error('NotePad - Erreur lors de l\'initialisation des événements des modals:', modalError);
      }
      
      console.log('NotePad - Fin de l\'initialisation des événements');
    } catch (error) {
      console.error('NotePad - Erreur globale lors de l\'initialisation des événements:', error);
    }
  }
  
  // Créer une nouvelle note
  createNote() {
    try {
      const newNote = this.model.createNote();
      this.loadNotes();
      this.selectNote(newNote.id);
      showSuccess('Nouvelle note créée');
    } catch (error) {
      console.error('Erreur lors de la création de la note:', error);
      showError('Erreur lors de la création de la note');
    }
  }
  
  // Sélectionner une note
  selectNote(id) {
    try {
      const note = this.model.getNote(id);
      if (note) {
        this.view.renderNote(note);
        
        // Mettre à jour la classe active dans la liste
        const noteItems = this.view.notesList.querySelectorAll('.note-item');
        noteItems.forEach(item => {
          if (item.dataset.id === id) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de la note:', error);
      showError('Erreur lors de la sélection de la note');
    }
  }
  
  // Sauvegarder la note courante
  saveNote() {
    try {
      if (!this.view.currentNoteId) return;
      
      const updatedNote = this.model.updateNote(this.view.currentNoteId, {
        title: this.view.noteTitle.value,
        content: this.view.noteContent.innerHTML,
        tags: this.view.noteTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      
      this.view.renderNotesList(this.model.notes);
      this.view.renderNote(updatedNote);
      
      showSuccess('Note enregistrée');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la note:', error);
      showError('Erreur lors de l\'enregistrement de la note');
    }
  }
  
  // Auto-sauvegarder la note courante
  autoSaveNote() {
    try {
      if (!this.view.currentNoteId) return;
      
      // Utiliser un debounce pour éviter trop d'enregistrements
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        console.log('NotePad - Auto-sauvegarde de la note');
        
        try {
          // Vérifier si les éléments de l'éditeur existent
          if (!this.view.noteTitle || !this.view.noteContent || !this.view.noteTags) {
            console.error('NotePad - Éléments de l\'éditeur non disponibles pour l\'auto-sauvegarde');
            return;
          }
          
          // Récupérer les valeurs des champs
          const title = this.view.noteTitle.value || 'Sans titre';
          const content = this.view.noteContent.innerHTML || '';
          const tagsString = this.view.noteTags.value || '';
          
          // Traiter les tags
          let tags = [];
          try {
            tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
          } catch (tagsError) {
            console.error('NotePad - Erreur lors du traitement des tags:', tagsError);
          }
          
          // Mettre à jour la note
          this.model.updateNote(this.view.currentNoteId, {
            title,
            content,
            tags
          });
          
          // Mettre à jour la liste des notes sans appeler renderNotesList
          // pour éviter une boucle potentielle
          // Nous allons juste mettre à jour l'élément de la note courante
          try {
            const noteItems = this.view.notesList.querySelectorAll('.note-item');
            noteItems.forEach(item => {
              if (item.dataset.id === this.view.currentNoteId) {
                const titleElement = item.querySelector('.note-item-title');
                const previewElement = item.querySelector('.note-item-preview');
                
                if (titleElement) titleElement.textContent = title;
                if (previewElement) {
                  try {
                    previewElement.textContent = this.view.getPreview(content);
                  } catch (previewError) {
                    console.error('NotePad - Erreur lors de la génération de l\'aperçu:', previewError);
                  }
                }
              }
            });
          } catch (updateError) {
            console.error('NotePad - Erreur lors de la mise à jour de l\'élément de la liste:', updateError);
          }
          
          console.log('NotePad - Note auto-sauvegardée avec succès');
        } catch (saveError) {
          console.error('NotePad - Erreur lors de l\'auto-sauvegarde de la note:', saveError);
        }
      }, 1000);
    } catch (error) {
      console.error('NotePad - Erreur globale lors de l\'auto-sauvegarde de la note:', error);
    }
  }
  
  // Confirmer la suppression d'une note
  confirmDeleteNote() {
    if (!this.view.currentNoteId) return;
    
    this.view.showModal(this.view.deleteConfirmModal);
  }
  
  // Supprimer la note courante
  deleteNote() {
    try {
      if (!this.view.currentNoteId) return;
      
      this.model.deleteNote(this.view.currentNoteId);
      this.view.hideModal(this.view.deleteConfirmModal);
      this.loadNotes();
      
      showSuccess('Note supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de la note:', error);
      showError('Erreur lors de la suppression de la note');
    }
  }
  
  // Rechercher des notes
  searchNotes() {
    try {
      const query = this.view.searchInput.value;
      const filteredNotes = this.model.searchNotes(query);
      this.view.renderNotesList(filteredNotes);
    } catch (error) {
      console.error('Erreur lors de la recherche de notes:', error);
      showError('Erreur lors de la recherche de notes');
    }
  }
  
  // Formater le texte
  formatText(format) {
    if (!this.view.currentNoteId) return;
    
    try {
      // Sauvegarder la sélection actuelle
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      switch (format) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
        case 'h1':
          document.execCommand('formatBlock', false, '<h1>');
          break;
        case 'h2':
          document.execCommand('formatBlock', false, '<h2>');
          break;
        case 'h3':
          document.execCommand('formatBlock', false, '<h3>');
          break;
        case 'ul':
          document.execCommand('insertUnorderedList', false, null);
          break;
        case 'ol':
          document.execCommand('insertOrderedList', false, null);
          break;
        case 'link':
          this.view.showModal(this.view.linkModal);
          break;
        case 'image':
          this.view.showModal(this.view.imageModal);
          break;
        case 'code':
          // Insérer un bloc de code
          const codeBlock = document.createElement('pre');
          codeBlock.textContent = selection.toString() || 'Votre code ici';
          range.deleteContents();
          range.insertNode(codeBlock);
          break;
        case 'quote':
          document.execCommand('formatBlock', false, '<blockquote>');
          break;
      }
      
      // Auto-sauvegarder après le formatage
      this.autoSaveNote();
    } catch (error) {
      console.error('Erreur lors du formatage du texte:', error);
      showError('Erreur lors du formatage du texte');
    }
  }
  
  // Insérer un lien
  insertLink() {
    try {
      const text = this.view.linkText.value || 'Lien';
      const url = this.view.linkUrl.value || '#';
      
      document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
      
      this.view.hideModal(this.view.linkModal);
      this.view.linkText.value = '';
      this.view.linkUrl.value = '';
      
      // Auto-sauvegarder après l'insertion
      this.autoSaveNote();
    } catch (error) {
      console.error('Erreur lors de l\'insertion du lien:', error);
      showError('Erreur lors de l\'insertion du lien');
    }
  }
  
  // Insérer une image
  insertImage() {
    try {
      const alt = this.view.imageAlt.value || 'Image';
      const url = this.view.imageUrl.value;
      
      if (!url) {
        showError('L\'URL de l\'image est requise');
        return;
      }
      
      document.execCommand('insertHTML', false, `<img src="${url}" alt="${alt}">`);
      
      this.view.hideModal(this.view.imageModal);
      this.view.imageAlt.value = '';
      this.view.imageUrl.value = '';
      
      // Auto-sauvegarder après l'insertion
      this.autoSaveNote();
    } catch (error) {
      console.error('Erreur lors de l\'insertion de l\'image:', error);
      showError('Erreur lors de l\'insertion de l\'image');
    }
  }
  
  // Exporter toutes les notes
  exportAllNotes() {
    try {
      const notes = this.model.notes;
      
      if (notes.length === 0) {
        showInfo('Aucune note à exporter');
        return;
      }
      
      // Créer un objet Blob avec les notes au format JSON
      const notesJson = JSON.stringify(notes, null, 2);
      const blob = new Blob([notesJson], { type: 'application/json' });
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notepad_export_${new Date().toISOString().slice(0, 10)}.json`;
      
      // Simuler un clic sur le lien
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showSuccess('Notes exportées avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'exportation des notes:', error);
      showError('Erreur lors de l\'exportation des notes');
    }
  }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
  const app = new NoteController(new NoteModel(), new NoteView());
});
