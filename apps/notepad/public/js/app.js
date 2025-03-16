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
    // Éléments de la sidebar
    this.notesList = document.getElementById('notes-list');
    this.emptyState = document.getElementById('empty-state');
    this.searchInput = document.getElementById('search-notes');
    this.newNoteBtn = document.getElementById('new-note-btn');
    this.createFirstNoteBtn = document.getElementById('create-first-note-btn');
    
    // Éléments de l'éditeur
    this.noteTitle = document.getElementById('note-title');
    this.noteContent = document.getElementById('note-content');
    this.noteTags = document.getElementById('note-tags');
    this.noteDate = document.getElementById('note-date');
    this.noteWordCount = document.getElementById('note-word-count');
    this.saveNoteBtn = document.getElementById('save-note-btn');
    this.deleteNoteBtn = document.getElementById('delete-note-btn');
    this.editorToolbar = document.getElementById('editor-toolbar');
    
    // Éléments des modals
    this.deleteConfirmModal = document.getElementById('delete-confirm-modal');
    this.deleteModalClose = document.getElementById('delete-modal-close');
    this.deleteCancelBtn = document.getElementById('delete-cancel-btn');
    this.deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    
    this.linkModal = document.getElementById('link-modal');
    this.linkModalClose = document.getElementById('link-modal-close');
    this.linkText = document.getElementById('link-text');
    this.linkUrl = document.getElementById('link-url');
    this.linkCancelBtn = document.getElementById('link-cancel-btn');
    this.linkConfirmBtn = document.getElementById('link-confirm-btn');
    
    this.imageModal = document.getElementById('image-modal');
    this.imageModalClose = document.getElementById('image-modal-close');
    this.imageAlt = document.getElementById('image-alt');
    this.imageUrl = document.getElementById('image-url');
    this.imageCancelBtn = document.getElementById('image-cancel-btn');
    this.imageConfirmBtn = document.getElementById('image-confirm-btn');
  }
  
  // Afficher la liste des notes
  renderNotesList(notes) {
    // Vider la liste
    while (this.notesList.firstChild) {
      if (this.notesList.firstChild !== this.emptyState) {
        this.notesList.removeChild(this.notesList.firstChild);
      }
    }
    
    // Afficher l'état vide si aucune note
    if (notes.length === 0) {
      this.emptyState.style.display = 'flex';
      return;
    }
    
    // Cacher l'état vide
    this.emptyState.style.display = 'none';
    
    // Ajouter chaque note à la liste
    notes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-item';
      noteItem.dataset.id = note.id;
      
      // Ajouter la classe active si c'est la note courante
      if (note.id === this.currentNoteId) {
        noteItem.classList.add('active');
      }
      
      // Créer le contenu de l'élément
      noteItem.innerHTML = `
        <div class="note-item-title">${note.title}</div>
        <div class="note-item-preview">${this.getPreview(note.content)}</div>
        <div class="note-item-date">${this.formatDate(note.updatedAt)}</div>
      `;
      
      this.notesList.appendChild(noteItem);
    });
  }
  
  // Afficher une note dans l'éditeur
  renderNote(note) {
    if (!note) {
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
      
      return;
    }
    
    // Activer l'éditeur
    this.noteTitle.disabled = false;
    this.noteContent.contentEditable = 'true';
    this.noteTags.disabled = false;
    this.saveNoteBtn.disabled = false;
    this.deleteNoteBtn.disabled = false;
    
    // Remplir les champs
    this.noteTitle.value = note.title;
    this.noteContent.innerHTML = note.content;
    this.noteTags.value = note.tags.join(', ');
    this.noteDate.textContent = `Dernière modification : ${this.formatDate(note.updatedAt, true)}`;
    this.updateWordCount();
    
    // Sauvegarder l'ID de la note courante
    this.currentNoteId = note.id;
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
    // Initialiser l'authentification
    initializeAuth({
      requireAuth: true,
      onSuccess: (user) => {
        // Créer la barre de navigation
        createMarketplaceNavbar({
          menuItems: [
            { 
              label: 'Exporter toutes les notes', 
              onClick: () => this.exportAllNotes()
            }
          ]
        });
        
        // Charger les notes
        this.loadNotes();
        
        // Initialiser les événements
        this.initEvents();
        
        // Afficher un message de bienvenue
        showSuccess(`Bienvenue sur NotePad, ${user.name} !`);
      },
      onFailure: (reason) => {
        console.error(`Échec de l'authentification: ${reason}`);
      }
    });
  }
  
  // Charger les notes
  loadNotes() {
    try {
      const notes = this.model.loadNotes();
      this.view.renderNotesList(notes);
      
      // Sélectionner la première note si disponible
      if (notes.length > 0) {
        this.selectNote(notes[0].id);
      } else {
        this.view.renderNote(null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      showError('Erreur lors du chargement des notes');
    }
  }
  
  // Initialiser les événements
  initEvents() {
    // Événements de la sidebar
    this.view.newNoteBtn.addEventListener('click', () => this.createNote());
    this.view.createFirstNoteBtn.addEventListener('click', () => this.createNote());
    this.view.searchInput.addEventListener('input', () => this.searchNotes());
    this.view.notesList.addEventListener('click', (e) => {
      const noteItem = e.target.closest('.note-item');
      if (noteItem) {
        this.selectNote(noteItem.dataset.id);
      }
    });
    
    // Événements de l'éditeur
    this.view.saveNoteBtn.addEventListener('click', () => this.saveNote());
    this.view.deleteNoteBtn.addEventListener('click', () => this.confirmDeleteNote());
    this.view.noteContent.addEventListener('input', () => {
      this.view.updateWordCount();
      this.autoSaveNote();
    });
    this.view.noteTitle.addEventListener('input', () => this.autoSaveNote());
    this.view.noteTags.addEventListener('input', () => this.autoSaveNote());
    
    // Événements de la barre d'outils
    this.view.editorToolbar.addEventListener('click', (e) => {
      const button = e.target.closest('.toolbar-btn');
      if (button) {
        this.formatText(button.dataset.format);
      }
    });
    
    // Événements des modals
    this.view.deleteModalClose.addEventListener('click', () => this.view.hideModal(this.view.deleteConfirmModal));
    this.view.deleteCancelBtn.addEventListener('click', () => this.view.hideModal(this.view.deleteConfirmModal));
    this.view.deleteConfirmBtn.addEventListener('click', () => this.deleteNote());
    
    this.view.linkModalClose.addEventListener('click', () => this.view.hideModal(this.view.linkModal));
    this.view.linkCancelBtn.addEventListener('click', () => this.view.hideModal(this.view.linkModal));
    this.view.linkConfirmBtn.addEventListener('click', () => this.insertLink());
    
    this.view.imageModalClose.addEventListener('click', () => this.view.hideModal(this.view.imageModal));
    this.view.imageCancelBtn.addEventListener('click', () => this.view.hideModal(this.view.imageModal));
    this.view.imageConfirmBtn.addEventListener('click', () => this.insertImage());
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
        this.model.updateNote(this.view.currentNoteId, {
          title: this.view.noteTitle.value,
          content: this.view.noteContent.innerHTML,
          tags: this.view.noteTags.value.split(',').map(tag => tag.trim()).filter(Boolean)
        });
        
        this.view.renderNotesList(this.model.notes);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'auto-enregistrement de la note:', error);
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
