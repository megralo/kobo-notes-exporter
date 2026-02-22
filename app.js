/**
 * Kobo Notes Exporter - Vanilla JS
 *
 * Applicazione per esportare note e evidenziazioni dal database SQLite di Kobo.
 * Gestisce l'importazione del file, la persistenza in IndexedDB, la navigazione
 * da tastiera, il tema dark/light e l'esportazione in vari formati.
 *
 * @file app.js
 * @version 1.5.0
 * @license MIT
 */

(function () {
  'use strict';

  // =========================================================================
  // COSTANTI
  // =========================================================================

  /** @constant {string} Nome del database IndexedDB */
  const IDB_NAME = 'KoboNotesExporter';

  /** @constant {number} Versione dello schema IndexedDB */
  const IDB_VERSION = 1;

  /** @constant {string} Nome dell'object store in IndexedDB */
  const IDB_STORE = 'database';

  /** @constant {string} Chiave univoca per il record del database salvato */
  const IDB_KEY = 'kobo_database';

  /**
   * Query SQL per ottenere la lista dei libri con almeno un'evidenziazione.
   * Effettua un JOIN con la tabella bookmark per filtrare solo i libri annotati.
   * @constant {string}
   */
  const QUERY_BOOK_LIST = `
    SELECT DISTINCT
      content.ContentID,
      content.Title AS BookTitle,
      content.Attribution AS Author
    FROM content
    INNER JOIN bookmark ON content.ContentID = bookmark.VolumeID
    WHERE content.ContentType = 6
      AND content.Title IS NOT NULL
      AND content.Title != ''
    ORDER BY content.Title
  `;

  /**
   * Query SQL di fallback per la lista libri, senza JOIN con bookmark.
   * Usata quando la query principale fallisce (es. tabella bookmark mancante).
   * @constant {string}
   */
  const QUERY_BOOK_LIST_FALLBACK = `
    SELECT DISTINCT
      content.ContentID,
      content.Title AS BookTitle,
      content.Attribution AS Author
    FROM content
    WHERE content.ContentType = 6
      AND content.Title IS NOT NULL
      AND content.Title != ''
    ORDER BY content.Title
    LIMIT 100
  `;

  /**
   * Query SQL per ottenere le evidenziazioni di un libro specifico.
   * Parametro bind: VolumeID (ContentID del libro).
   * @constant {string}
   */
  const QUERY_HIGHLIGHTS = `
    SELECT
      bookmark.Text AS HighlightText,
      bookmark.Annotation AS Note
    FROM bookmark
    WHERE bookmark.VolumeID = ?
    ORDER BY bookmark.DateCreated
  `;

  /** @constant {boolean} true se la piattaforma corrente e' macOS */
  const IS_MAC =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  /** @constant {string} Label del tasto modificatore per la piattaforma corrente */
  const MODIFIER_LABEL = IS_MAC ? '\u2318' : 'Ctrl';

  /** @constant {string} Label del tasto Shift per la piattaforma corrente */
  const SHIFT_LABEL = IS_MAC ? '\u21E7' : 'Shift';

  /**
   * Caratteri che richiedono Shift per essere digitati.
   * Per questi si ignora il controllo esplicito di shiftKey nelle scorciatoie.
   * @constant {string[]}
   */
  const SHIFT_CHARS = '?!@#$%^&*()_+{}|:"<>~'.split('');

  /**
   * Mappa dei tasti speciali alle rispettive label leggibili.
   * @constant {Object<string, string>}
   */
  const KEY_LABELS = {
    ArrowUp: '\u2191',
    ArrowDown: '\u2193',
    Enter: '\u21B5',
    Escape: 'Esc',
    Home: 'Home',
    End: 'End',
    '/': '/',
    '?': '?',
  };

  // =========================================================================
  // STATO APPLICAZIONE
  // =========================================================================

  /**
   * Valori iniziali dell'oggetto di stato. Usato come template per il reset.
   * Modificare qui per aggiungere nuove proprieta' di stato.
   * @constant {Object}
   */
  const INITIAL_STATE = {
    /** @type {Object|null} Istanza SQL.js inizializzata */
    SQL: null,
    /** @type {Object|null} Istanza del database SQLite aperto */
    dbData: null,
    /** @type {Array<{ContentID: string, BookTitle: string, Author: string}>} Lista completa dei libri estratti dal database */
    books: [],
    /** @type {Array<{ContentID: string, BookTitle: string, Author: string}>} Lista dei libri filtrati in base al termine di ricerca corrente */
    filteredBooks: [],
    /** @type {{contentId: string, bookTitle: string}|null} Libro attualmente selezionato */
    selectedBook: null,
    /** @type {string} Contenuto grezzo delle evidenziazioni del libro selezionato */
    highlightsRaw: '',
    /** @type {string|null} Messaggio di errore del caricamento evidenziazioni, null se assente */
    highlightsError: null,
    /** @type {string} Termine di ricerca nella lista libri */
    searchTerm: '',
    /** @type {string} Termine di ricerca nelle evidenziazioni */
    highlightSearch: '',
    /** @type {number} Indice del libro con focus da tastiera (-1 = nessuno) */
    focusedBookIndex: -1,
    /** @type {boolean} true se il tema scuro e' attivo */
    isDark: false,
    /** @type {boolean} true se la modale scorciatoie e' visibile */
    showShortcutsHelp: false,
  };

  /**
   * Stato corrente dell'applicazione. Unica fonte di verita' per tutte
   * le variabili di dominio e di interfaccia. Inizializzato con i valori
   * di default definiti in {@link INITIAL_STATE}.
   * @type {typeof INITIAL_STATE}
   */
  let state = { ...INITIAL_STATE };

  /**
   * Riporta l'intero stato ai valori iniziali tramite shallow copy di INITIAL_STATE.
   * Non aggiorna il DOM ne' esegue side effect: il chiamante e' responsabile
   * del re-render e di ripristinare le proprieta' che non devono essere azzerate
   * (es. state.isDark, state.SQL) prima di procedere.
   */
  function resetState() {
    state = { ...INITIAL_STATE };
  }

  // =========================================================================
  // RIFERIMENTI DOM
  // =========================================================================

  /**
   * Seleziona un singolo elemento dal DOM.
   *
   * @param {string} sel - Selettore CSS
   * @returns {HTMLElement|null}
   */
  const $ = (sel) => document.querySelector(sel);

  /**
   * Seleziona tutti gli elementi corrispondenti dal DOM.
   *
   * @param {string} sel - Selettore CSS
   * @returns {NodeListOf<HTMLElement>}
   */
  const $$ = (sel) => document.querySelectorAll(sel);

  /**
   * Cache dei riferimenti DOM usati frequentemente.
   * Popolata da {@link cacheDom} all'avvio.
   * @type {Object<string, HTMLElement>}
   */
  let dom = {};

  /**
   * Popola la cache dei riferimenti DOM.
   * Deve essere chiamata una volta dopo il DOMContentLoaded.
   */
  function cacheDom() {
    dom = {
      body: document.body,
      html: document.documentElement,
      uploadView: $('#upload-view'),
      viewerView: $('#viewer-view'),
      dropZone: $('#drop-zone'),
      fileInput: $('#file-input'),
      fileName: $('#file-name'),
      sqlLoading: $('#sql-loading'),
      loadingError: $('#loading-error'),
      loadingErrorText: $('#loading-error-text'),
      storageWarning: $('#storage-warning'),
      restoreBanner: $('#restore-banner'),
      restoreFilename: $('#restore-filename'),
      btnRestore: $('#btn-restore'),
      btnCancelRestore: $('#btn-cancel-restore'),
      btnReset: $('#btn-reset'),
      btnTheme: $('#btn-theme'),
      themeIcon: $('#theme-icon'),
      themeLabel: $('#theme-label'),
      btnShortcuts: $('#btn-shortcuts'),
      searchBooks: $('#search-books'),
      clearBookSearch: $('#clear-book-search'),
      bookSearchIcon: $('#book-search-icon'),
      bookList: $('#book-list'),
      bookCount: $('#book-count'),
      highlightTitle: $('#highlight-title'),
      searchHighlights: $('#search-highlights'),
      clearHighlightSearch: $('#clear-highlight-search'),
      highlightSearchIcon: $('#highlight-search-icon'),
      btnExportHighlights: $('#btn-export-highlights'),
      highlightBody: $('#highlight-body'),
      highlightPlaceholder: $('#highlight-placeholder'),
      highlightError: $('#highlight-error'),
      highlightContent: $('#highlight-content'),
      shortcutsModal: $('#shortcuts-modal'),
      btnCloseModal: $('#btn-close-modal'),
      shortcutsList: $('#shortcuts-list'),
      platformInfo: $('#platform-info'),
    };
  }

  // =========================================================================
  // TEMA
  // =========================================================================

  /**
   * Rileva la preferenza di tema del sistema operativo.
   *
   * @returns {boolean} true se il sistema preferisce il tema scuro
   */
  function getSystemPreference() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }

  /**
   * Applica il tema corrente al documento.
   * Aggiorna la classe CSS sull'elemento root, l'attributo data-theme
   * e il contenuto del pulsante toggle.
   */
  function applyTheme() {
    if (state.isDark) {
      dom.html.classList.add('dark');
    } else {
      dom.html.classList.remove('dark');
    }
    dom.html.setAttribute('data-theme', state.isDark ? 'dark' : 'light');
    dom.themeIcon.textContent = state.isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    dom.themeLabel.textContent = state.isDark ? 'Modalit\u00e0 Chiara' : 'Modalit\u00e0 Scura';
  }

  /**
   * Alterna tra tema chiaro e scuro.
   */
  function toggleTheme() {
    state.isDark = !state.isDark;
    applyTheme();
  }

  // =========================================================================
  // INDEXED DB - PERSISTENZA
  // =========================================================================

  /**
   * Apre una connessione a IndexedDB.
   * Crea l'object store se non esiste (primo accesso).
   *
   * @returns {Promise<IDBDatabase>} Connessione al database
   * @throws {Error} Se IndexedDB non e' disponibile
   */
  function openIDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onerror = () => reject(new Error('Impossibile aprire IndexedDB'));
      req.onsuccess = () => resolve(req.result);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Salva il database SQLite in IndexedDB per la persistenza tra sessioni.
   *
   * @param {ArrayBuffer} arrayBuffer - Contenuto binario del file .sqlite
   * @param {string} fileName - Nome originale del file caricato
   * @returns {Promise<{success: boolean, error?: string}>} Esito dell'operazione.
   *          In caso di errore, `error` puo' valere 'quota' se lo spazio e' esaurito.
   */
  async function saveToIDB(arrayBuffer, fileName) {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx = db.transaction([IDB_STORE], 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const data = {
          id: IDB_KEY,
          arrayBuffer,
          fileName,
          savedAt: new Date().toISOString(),
        };
        const req = store.put(data);
        req.onsuccess = () => { db.close(); resolve({ success: true }); };
        req.onerror = () => {
          db.close();
          if (req.error?.name === 'QuotaExceededError') {
            resolve({ success: false, error: 'quota' });
          } else {
            resolve({ success: false, error: req.error?.message || 'Errore sconosciuto' });
          }
        };
      });
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Carica il database SQLite precedentemente salvato in IndexedDB.
   *
   * @returns {Promise<{arrayBuffer: ArrayBuffer, fileName: string}|null>}
   *          I dati salvati oppure null se non esiste un database persistito
   */
  async function loadFromIDB() {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx = db.transaction([IDB_STORE], 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(IDB_KEY);
        req.onsuccess = () => {
          db.close();
          if (req.result) {
            resolve({
              arrayBuffer: req.result.arrayBuffer,
              fileName: req.result.fileName || 'Database ripristinato',
            });
          } else {
            resolve(null);
          }
        };
        req.onerror = () => { db.close(); resolve(null); };
      });
    } catch (_) {
      return null;
    }
  }

  /**
   * Cancella il database salvato da IndexedDB.
   *
   * @returns {Promise<boolean>} true se la cancellazione ha avuto successo
   */
  async function clearIDB() {
    try {
      const db = await openIDB();
      return new Promise((resolve) => {
        const tx = db.transaction([IDB_STORE], 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        const req = store.delete(IDB_KEY);
        req.onsuccess = () => { db.close(); resolve(true); };
        req.onerror = () => { db.close(); resolve(false); };
      });
    } catch (_) {
      return false;
    }
  }

  // =========================================================================
  // SQL.JS E OPERAZIONI DATABASE
  // =========================================================================

  /**
   * Inizializza la libreria SQL.js caricandola da CDN.
   * Tenta prima la funzione globale, poi riprova dopo un secondo come fallback.
   *
   * @returns {Promise<Object>} Istanza SQL.js pronta all'uso
   * @throws {Error} Se SQL.js non puo' essere caricato o inizializzato
   */
  function initSqlJs() {
    return new Promise((resolve, reject) => {
      const init = window.initSqlJs || window.SQL;
      const doInit = (fn) => {
        fn({ locateFile: (f) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${f}` })
          .then(resolve)
          .catch(reject);
      };
      if (init) {
        doInit(init);
      } else {
        setTimeout(() => {
          const delayed = window.initSqlJs || window.SQL;
          if (delayed) {
            doInit(delayed);
          } else {
            reject(new Error('SQL.js non trovato.'));
          }
        }, 1000);
      }
    });
  }

  /**
   * Crea un'istanza del database SQLite da un ArrayBuffer.
   *
   * @param {Object} sqlInstance - Istanza SQL.js inizializzata
   * @param {ArrayBuffer} arrayBuffer - Contenuto binario del file .sqlite
   * @returns {Object} Istanza del database pronta per le query
   * @throws {Error} Se il buffer non e' un database SQLite valido
   */
  function createDatabase(sqlInstance, arrayBuffer) {
    return new sqlInstance.Database(new Uint8Array(arrayBuffer));
  }

  /**
   * Ottiene la lista dei libri dal database Kobo.
   * Prova prima la query con JOIN su bookmark, poi usa il fallback se fallisce.
   *
   * @param {Object} db - Istanza del database SQL.js
   * @returns {{books: Array<{ContentID: string, BookTitle: string, Author: string}>, error: string|null}}
   */
  function queryBookList(db) {
    if (!db || typeof db.prepare !== 'function') {
      return { books: [], error: 'Database non valido' };
    }
    try {
      const stmt = db.prepare(QUERY_BOOK_LIST);
      const list = [];
      while (stmt.step()) list.push(stmt.getAsObject());
      stmt.free();
      return { books: list, error: null };
    } catch (_) {
      try {
        const stmt = db.prepare(QUERY_BOOK_LIST_FALLBACK);
        const list = [];
        while (stmt.step()) list.push(stmt.getAsObject());
        stmt.free();
        return { books: list, error: null };
      } catch (err2) {
        return { books: [], error: 'Impossibile caricare i libri: ' + err2.message };
      }
    }
  }

  /**
   * Ottiene le evidenziazioni e le note di un libro specifico.
   *
   * @param {Object} db - Istanza del database SQL.js
   * @param {string} contentId - ContentID (VolumeID) del libro
   * @returns {{highlights: string, count: number, error: string|null}}
   *          Testo formattato delle evidenziazioni, conteggio e eventuale errore
   */
  function queryHighlights(db, contentId) {
    if (!db || typeof db.prepare !== 'function') {
      return { highlights: '', count: 0, error: 'Database non valido' };
    }
    try {
      const stmt = db.prepare(QUERY_HIGHLIGHTS);
      stmt.bind([contentId]);
      let content = '';
      let count = 0;
      while (stmt.step()) {
        const row = stmt.getAsObject();
        count++;
        if (row.HighlightText) {
          content += `Evidenziazione ${count}:\n\n`;
          content += `${row.HighlightText}\n`;
          if (row.Note) content += `\nNote: ${row.Note}\n`;
          content += '\n---\n\n';
        }
      }
      stmt.free();
      return {
        highlights: content || 'Nessuna evidenziazione trovata per questo libro.',
        count,
        error: null,
      };
    } catch (err) {
      return {
        highlights: '',
        count: 0,
        error: 'Errore nel caricamento delle evidenziazioni: ' + err.message,
      };
    }
  }

  // =========================================================================
  // UTILITA' DI ESPORTAZIONE
  // =========================================================================

  /**
   * Avvia il download di un file generato lato client.
   *
   * @param {string} content - Contenuto testuale del file
   * @param {string} filename - Nome del file con estensione
   * @param {string} [mimeType='text/plain'] - Tipo MIME del file
   */
  function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Sanitizza un nome file rimuovendo i caratteri non validi per il filesystem.
   *
   * @param {string} name - Nome file originale
   * @returns {string} Nome file con caratteri non validi sostituiti da '-'
   */
  function sanitizeFilename(name) {
    return name.replace(/[/\\?%*:|"<>]/g, '-');
  }

  /**
   * Esporta la lista completa dei libri nel formato specificato.
   * Genera e scarica il file corrispondente.
   *
   * @param {'json'|'csv'|'md'} format - Formato di esportazione desiderato
   */
  function exportBookList(format) {
    /** @type {string} */
    let content;
    /** @type {string} */
    let mime;
    /** @type {string} */
    let ext;

    switch (format) {
      case 'json':
        content = JSON.stringify(state.books, null, 2);
        mime = 'application/json';
        ext = 'json';
        break;
      case 'csv': {
        let csv = 'Title,Author\n';
        state.books.forEach((b) => {
          const t = (b.BookTitle || '').replace(/"/g, '""');
          const a = (b.Author || '').replace(/"/g, '""');
          csv += `"${t}","${a}"\n`;
        });
        content = csv;
        mime = 'text/csv';
        ext = 'csv';
        break;
      }
      case 'md': {
        let md = '# Kobo Book List\n\n';
        state.books.forEach((b) => {
          const author = b.Author ? ` by ${b.Author}` : '';
          md += `- ${b.BookTitle}${author}\n`;
        });
        content = md;
        mime = 'text/markdown';
        ext = 'md';
        break;
      }
      default:
        return;
    }
    downloadFile(content, `kobo-booklist.${ext}`, mime);
  }

  /**
   * Esporta le evidenziazioni del libro selezionato in formato Markdown.
   * Non fa nulla se nessun libro e' selezionato o se non ci sono evidenziazioni.
   */
  function exportHighlights() {
    if (!state.selectedBook || !state.highlightsRaw) return;
    const filename = `${sanitizeFilename(state.selectedBook.bookTitle)}-highlights.md`;
    const content = `# ${state.selectedBook.bookTitle}\n\n${state.highlightsRaw}`;
    downloadFile(content, filename, 'text/markdown');
  }

  // =========================================================================
  // RENDERING
  // =========================================================================

  /**
   * Alterna la visibilita' tra la vista di caricamento e la vista di consultazione.
   *
   * @param {boolean} loaded - true per mostrare il viewer, false per l'upload
   */
  function showView(loaded) {
    dom.uploadView.style.display = loaded ? 'none' : '';
    dom.viewerView.style.display = loaded ? '' : 'none';
    dom.btnReset.style.display = loaded ? '' : 'none';
    dom.btnShortcuts.style.display = loaded ? '' : 'none';
  }

  /**
   * Renderizza la lista dei libri filtrata nel DOM.
   * Aggiorna anche il contatore, lo stato di selezione/focus e i controlli di ricerca.
   * Il click sui singoli elementi e' gestito tramite event delegation su dom.bookList
   * (registrata una volta sola in bindEvents).
   */
  function renderBookList() {
    const lower = state.searchTerm.toLowerCase();
    state.filteredBooks = state.books.filter(
      (b) =>
        (b.BookTitle || '').toLowerCase().includes(lower) ||
        (b.Author || '').toLowerCase().includes(lower)
    );

    dom.bookList.innerHTML = '';

    if (state.filteredBooks.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-list';
      li.textContent = state.books.length === 0
        ? 'Nessun libro trovato. Assicurati che il file KoboReader.sqlite sia valido.'
        : 'Nessun risultato per la ricerca.';
      dom.bookList.appendChild(li);
    } else {
      state.filteredBooks.forEach((book, i) => {
        const li = document.createElement('li');
        li.className = 'book-item';
        li.dataset.bookIndex = i;

        if (state.selectedBook && state.selectedBook.contentId === book.ContentID) {
          li.classList.add('selected');
        }
        if (state.focusedBookIndex === i && !(state.selectedBook && state.selectedBook.contentId === book.ContentID)) {
          li.classList.add('focused');
        }

        const titleDiv = document.createElement('div');
        titleDiv.className = 'book-title';
        titleDiv.textContent = book.BookTitle;
        li.appendChild(titleDiv);

        if (book.Author) {
          const authorDiv = document.createElement('div');
          authorDiv.className = 'book-author';
          authorDiv.textContent = book.Author;
          li.appendChild(authorDiv);
        }

        dom.bookList.appendChild(li);
      });
    }

    dom.bookCount.textContent = state.filteredBooks.length + ' libri';

    // Visibilita' del pulsante di reset ricerca
    if (state.searchTerm) {
      dom.clearBookSearch.style.display = '';
      dom.bookSearchIcon.style.display = 'none';
    } else {
      dom.clearBookSearch.style.display = 'none';
      dom.bookSearchIcon.style.display = '';
    }
  }

  /**
   * Renderizza l'anteprima delle evidenziazioni nel pannello destro.
   * Gestisce il filtraggio per termine di ricerca e l'evidenziazione visiva dei match.
   * In caso di errore SQL mostra un messaggio distinto e interrompe il rendering.
   */
  function renderHighlights() {
    dom.highlightTitle.textContent = state.selectedBook ? state.selectedBook.bookTitle : 'Anteprima note';

    // Caso errore: mostra il messaggio dedicato e interrompe
    if (state.highlightsError) {
      dom.highlightPlaceholder.style.display = 'none';
      dom.highlightContent.style.display = 'none';
      dom.highlightError.style.display = '';
      dom.highlightError.textContent = state.highlightsError;
      dom.btnExportHighlights.style.display = 'none';
      return;
    }

    dom.highlightError.style.display = 'none';

    const raw = state.highlightsRaw;
    const noContent = !raw || raw === 'Nessuna evidenziazione trovata per questo libro.';

    dom.btnExportHighlights.style.display = (raw && !noContent) ? '' : 'none';

    if (!raw) {
      dom.highlightPlaceholder.style.display = '';
      dom.highlightContent.style.display = 'none';
      return;
    }

    dom.highlightPlaceholder.style.display = 'none';
    dom.highlightContent.style.display = '';

    let display = raw;

    // Filtra le sezioni che contengono il termine di ricerca
    if (state.highlightSearch && !noContent) {
      const sections = raw.split('---\n\n');
      const matching = sections.filter((s) =>
        s.toLowerCase().includes(state.highlightSearch.toLowerCase())
      );
      display = matching.length > 0
        ? matching.join('---\n\n')
        : `Nessun risultato trovato per "${state.highlightSearch}"`;
    }

    // Evidenzia visivamente i match nel testo.
    // Il termine di ricerca viene prima escapato come HTML (stessa forma del testo
    // su cui viene applicata la regex), poi escapato come pattern regex.
    if (state.highlightSearch && display) {
      const escapedHtml = escapeHtml(state.highlightSearch);
      const escapedRegex = escapedHtml.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedRegex})`, 'gi');
      const safeHtml = escapeHtml(display).replace(regex, '<mark>$1</mark>');
      dom.highlightContent.innerHTML = safeHtml;
    } else {
      dom.highlightContent.textContent = display;
    }

    // Visibilita' del pulsante di reset ricerca evidenziazioni
    if (state.highlightSearch) {
      dom.clearHighlightSearch.style.display = '';
      dom.highlightSearchIcon.style.display = 'none';
    } else {
      dom.clearHighlightSearch.style.display = 'none';
      dom.highlightSearchIcon.style.display = '';
    }
  }

  /**
   * Escapa i caratteri HTML speciali per prevenire XSS
   * quando si inserisce contenuto tramite innerHTML.
   *
   * @param {string} str - Stringa da escapare
   * @returns {string} Stringa con entita' HTML escapate
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // =========================================================================
  // MODALE SCORCIATOIE DA TASTIERA
  // =========================================================================

  /**
   * Definizione dei gruppi di scorciatoie per la documentazione nella modale.
   * @type {Array<{title: string, items: Array<{key: string, label: string, modifier?: boolean, shift?: boolean}>}>}
   */
  const shortcutGroups = [
    {
      title: 'Navigazione',
      items: [
        { key: '/', label: 'Focus ricerca libri' },
        { key: 'ArrowUp', label: 'Libro precedente' },
        { key: 'ArrowDown', label: 'Libro successivo' },
        { key: 'Enter', label: 'Seleziona libro' },
        { key: 'Home', label: 'Primo libro' },
        { key: 'End', label: 'Ultimo libro' },
        { key: 'Escape', label: 'Deseleziona / Esci' },
      ],
    },
    {
      title: 'Ricerca',
      items: [{ key: 'f', modifier: true, label: 'Focus ricerca note' }],
    },
    {
      title: 'Azioni',
      items: [
        { key: 'd', modifier: true, shift: true, label: 'Cambia tema' },
        { key: 'n', modifier: true, shift: true, label: 'Nuovo database' },
        { key: 'e', modifier: true, shift: true, label: 'Esporta note' },
      ],
    },
    {
      title: 'Aiuto',
      items: [{ key: '?', label: 'Mostra/nascondi questa guida' }],
    },
  ];

  /**
   * Formatta una scorciatoia in una stringa leggibile per l'interfaccia.
   * Adatta la notazione alla piattaforma corrente (Mac vs Windows/Linux).
   *
   * @param {{key: string, modifier?: boolean, shift?: boolean}} sc - Definizione della scorciatoia
   * @returns {string} Rappresentazione leggibile (es. "Ctrl + Shift + D" o "^D")
   */
  function formatShortcutLabel(sc) {
    const parts = [];
    if (sc.modifier) parts.push(MODIFIER_LABEL);
    if (sc.shift) parts.push(SHIFT_LABEL);
    let kl = sc.key;
    if (KEY_LABELS[sc.key]) {
      kl = KEY_LABELS[sc.key];
    } else if (sc.key.length === 1) {
      kl = sc.key.toUpperCase();
    }
    parts.push(kl);
    return IS_MAC ? parts.join('') : parts.join(' + ');
  }

  /**
   * Costruisce il contenuto HTML della modale scorciatoie.
   * Genera i gruppi e le righe a partire da {@link shortcutGroups}.
   */
  function buildShortcutsModal() {
    dom.platformInfo.textContent = 'Stai usando: ' + (IS_MAC ? 'macOS' : 'Windows/Linux');
    dom.shortcutsList.innerHTML = '';

    shortcutGroups.forEach((group) => {
      const div = document.createElement('div');
      div.className = 'shortcut-group';

      const h3 = document.createElement('h3');
      h3.className = 'shortcut-group-title';
      h3.textContent = group.title;
      div.appendChild(h3);

      group.items.forEach((sc) => {
        const row = document.createElement('div');
        row.className = 'shortcut-row';

        const label = document.createElement('span');
        label.className = 'shortcut-label';
        label.textContent = sc.label;

        const kbd = document.createElement('kbd');
        kbd.textContent = formatShortcutLabel(sc);

        row.appendChild(label);
        row.appendChild(kbd);
        div.appendChild(row);
      });

      dom.shortcutsList.appendChild(div);
    });
  }

  /**
   * Alterna la visibilita' della modale delle scorciatoie da tastiera.
   */
  function toggleShortcutsModal() {
    state.showShortcutsHelp = !state.showShortcutsHelp;
    dom.shortcutsModal.style.display = state.showShortcutsHelp ? '' : 'none';
  }

  // =========================================================================
  // AZIONI PRINCIPALI
  // =========================================================================

  /**
   * Seleziona un libro e carica le sue evidenziazioni.
   *
   * @param {string} contentId - ContentID del libro nel database Kobo
   * @param {string} bookTitle - Titolo del libro
   */
  function selectBook(contentId, bookTitle) {
    state.selectedBook = { contentId, bookTitle };
    state.highlightSearch = '';
    dom.searchHighlights.value = '';

    const result = queryHighlights(state.dbData, contentId);
    if (result.error) {
      state.highlightsError = result.error;
      state.highlightsRaw = '';
    } else {
      state.highlightsError = null;
      state.highlightsRaw = result.highlights;
    }

    renderBookList();
    renderHighlights();
  }

  /**
   * Pulisce la selezione corrente e resetta la vista delle evidenziazioni.
   * Chiude anche la modale scorciatoie se aperta.
   */
  function clearSelection() {
    state.selectedBook = null;
    state.highlightsRaw = '';
    state.highlightsError = null;
    state.highlightSearch = '';
    dom.searchHighlights.value = '';
    state.focusedBookIndex = -1;
    state.showShortcutsHelp = false;
    dom.shortcutsModal.style.display = 'none';
    renderBookList();
    renderHighlights();
  }

  /**
   * Resetta completamente l'applicazione allo stato iniziale.
   * Cancella il database da IndexedDB e ripristina la vista di caricamento.
   *
   * @returns {Promise<void>}
   */
  async function resetApp() {
    await clearIDB();
    const currentTheme = state.isDark;
    const currentSQL = state.SQL;
    resetState();
    state.isDark = currentTheme;
    state.SQL = currentSQL;

    dom.searchBooks.value = '';
    dom.searchHighlights.value = '';
    dom.fileName.textContent = 'Trascina qui il tuo file .sqlite';
    dom.fileInput.value = '';
    hideError();
    hideStorageWarning();
    dom.restoreBanner.style.display = 'none';
    dom.sqlLoading.style.display = state.SQL ? 'none' : '';

    showView(false);
  }

  /**
   * Carica un database nell'applicazione e passa alla vista di consultazione.
   * Se forniti arrayBuffer e fileName, persiste il database in IndexedDB.
   *
   * @param {Object} db - Istanza del database SQL.js
   * @param {ArrayBuffer|null} arrayBuffer - Buffer del file per la persistenza (opzionale)
   * @param {string|null} fileName - Nome del file per la persistenza (opzionale)
   */
  function loadDatabaseIntoApp(db, arrayBuffer, fileName) {
    state.dbData = db;
    const result = queryBookList(db);
    if (result.error) {
      showError(result.error);
      return;
    }
    state.books = result.books;
    state.selectedBook = null;
    state.highlightsRaw = '';
    state.searchTerm = '';
    state.focusedBookIndex = -1;
    dom.searchBooks.value = '';

    showView(true);
    renderBookList();
    renderHighlights();

    // Salvataggio in IndexedDB per sessioni future
    if (arrayBuffer && fileName) {
      saveToIDB(arrayBuffer, fileName).then((res) => {
        if (!res.success && res.error === 'quota') {
          showStorageWarning(
            "Il database e' troppo grande per essere salvato. Dovrai ricaricarlo alla prossima sessione."
          );
        }
      });
    }
  }

  // =========================================================================
  // IMPORTAZIONE FILE
  // =========================================================================

  /**
   * Gestisce l'importazione di un file .sqlite da input o drag&drop.
   * Legge il file come ArrayBuffer, crea il database e avvia il caricamento.
   * Azzera il valore dell'input al termine (onloadend) per permettere il
   * re-import dello stesso file senza dover ricaricare la pagina.
   *
   * @param {Event} event - Evento 'change' dell'input file o evento 'drop'
   */
  function handleFileImport(event) {
    const files = event.target?.files || event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    dom.fileName.textContent = file.name;
    hideError();

    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (!state.SQL) throw new Error("SQL.js non e' stato caricato correttamente");
        const arrayBuffer = reader.result;
        const db = createDatabase(state.SQL, arrayBuffer);
        loadDatabaseIntoApp(db, arrayBuffer, file.name);
      } catch (err) {
        showError('Errore nel processare il file: ' + err.message);
      }
    };
    reader.onerror = (err) => {
      showError('Errore nella lettura del file: ' + err);
    };
    reader.onloadend = () => {
      dom.fileInput.value = '';
    };
    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // NAVIGAZIONE DA TASTIERA NELLA LISTA LIBRI
  // =========================================================================

  /**
   * Sposta il focus nella lista dei libri nella direzione indicata.
   *
   * @param {'up'|'down'|'first'|'last'} direction - Direzione di navigazione
   */
  function navigateBooks(direction) {
    if (state.filteredBooks.length === 0) return;
    switch (direction) {
      case 'down':
        state.focusedBookIndex = state.focusedBookIndex < state.filteredBooks.length - 1
          ? state.focusedBookIndex + 1
          : state.focusedBookIndex;
        break;
      case 'up':
        state.focusedBookIndex = state.focusedBookIndex > 0 ? state.focusedBookIndex - 1 : 0;
        break;
      case 'first':
        state.focusedBookIndex = 0;
        break;
      case 'last':
        state.focusedBookIndex = state.filteredBooks.length - 1;
        break;
    }
    renderBookList();
    scrollToFocused();
  }

  /**
   * Seleziona il libro attualmente con focus da tastiera.
   * Non fa nulla se nessun libro ha il focus.
   */
  function selectFocusedBook() {
    if (state.focusedBookIndex >= 0 && state.focusedBookIndex < state.filteredBooks.length) {
      const book = state.filteredBooks[state.focusedBookIndex];
      selectBook(book.ContentID, book.BookTitle);
    }
  }

  /**
   * Scrolla la lista libri per rendere visibile l'elemento con focus.
   */
  function scrollToFocused() {
    const el = dom.bookList.querySelector(`[data-book-index="${state.focusedBookIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // =========================================================================
  // HELPER PER ERRORI E WARNING
  // =========================================================================

  /**
   * Mostra un messaggio di errore nella vista di caricamento.
   *
   * @param {string} msg - Testo dell'errore da visualizzare
   */
  function showError(msg) {
    dom.loadingErrorText.textContent = msg;
    dom.loadingError.style.display = '';
  }

  /** Nasconde il messaggio di errore. */
  function hideError() {
    dom.loadingError.style.display = 'none';
  }

  /**
   * Mostra un avviso relativo allo storage nella vista di caricamento.
   *
   * @param {string} msg - Testo dell'avviso da visualizzare
   */
  function showStorageWarning(msg) {
    dom.storageWarning.textContent = msg;
    dom.storageWarning.style.display = '';
  }

  /** Nasconde l'avviso di storage. */
  function hideStorageWarning() {
    dom.storageWarning.style.display = 'none';
  }

  // =========================================================================
  // GESTIONE SCORCIATOIE DA TASTIERA
  // =========================================================================

  /**
   * Verifica se un evento tastiera corrisponde a una definizione di scorciatoia.
   * Gestisce il modificatore di piattaforma (Cmd su Mac, Ctrl su Windows/Linux),
   * Shift, Alt e i caratteri che richiedono Shift per essere digitati.
   *
   * @param {KeyboardEvent} e - Evento tastiera
   * @param {{key: string, modifier?: boolean, shift?: boolean, alt?: boolean}} sc - Definizione della scorciatoia
   * @returns {boolean} true se l'evento corrisponde alla scorciatoia
   */
  function matchesShortcut(e, sc) {
    if (e.key !== sc.key && e.key.toLowerCase() !== sc.key?.toLowerCase()) return false;

    const needsMod = sc.modifier === true;
    const hasMod = IS_MAC ? e.metaKey : e.ctrlKey;
    if (needsMod && !hasMod) return false;
    if (!needsMod && hasMod && sc.key !== 'Escape') return false;

    const isShiftChar = SHIFT_CHARS.includes(sc.key);
    if (!isShiftChar) {
      const needsShift = sc.shift === true;
      if (needsShift !== e.shiftKey) return false;
    }

    const needsAlt = sc.alt === true;
    if (needsAlt !== e.altKey) return false;

    return true;
  }

  /**
   * Registra il listener globale per le scorciatoie da tastiera.
   * Le scorciatoie sono attive solo quando un database e' caricato.
   * Nei campi di input, solo Escape e le scorciatoie con `allowInInput` funzionano.
   */
  function setupKeyboardShortcuts() {
    /**
     * Definizione delle scorciatoie attive nell'applicazione.
     * @type {Array<{key: string, action: Function, modifier?: boolean, shift?: boolean, alt?: boolean, allowInInput?: boolean}>}
     */
    const shortcuts = [
      { key: '/', action: () => dom.searchBooks.focus() },
      { key: 'ArrowDown', action: () => navigateBooks('down') },
      { key: 'ArrowUp', action: () => navigateBooks('up') },
      { key: 'Home', action: () => navigateBooks('first') },
      { key: 'End', action: () => navigateBooks('last') },
      { key: 'Enter', action: () => selectFocusedBook() },
      { key: 'Escape', action: clearSelection, allowInInput: true },
      { key: 'f', modifier: true, action: () => dom.searchHighlights.focus() },
      { key: 'd', modifier: true, shift: true, action: toggleTheme },
      { key: 'n', modifier: true, shift: true, action: resetApp },
      { key: 'e', modifier: true, shift: true, action: exportHighlights },
      { key: '?', action: toggleShortcutsModal },
    ];

    window.addEventListener('keydown', (e) => {
      if (!state.dbData) return;

      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName);

      for (const sc of shortcuts) {
        if (isInput && !sc.allowInInput) {
          // Nei campi di input, gestisci solo Escape
          if (e.key === 'Escape' && sc.key === 'Escape') {
            e.target.blur();
            sc.action(e);
            return;
          }
          continue;
        }
        if (matchesShortcut(e, sc)) {
          e.preventDefault();
          sc.action(e);
          return;
        }
      }
    });
  }

  // =========================================================================
  // BINDING EVENTI
  // =========================================================================

  /**
   * Collega tutti gli event listener agli elementi del DOM.
   * Gestisce: tema, reset, modale, drag&drop, ricerca, ripristino ed esportazione.
   * Il click sulla lista libri e' gestito tramite un singolo listener delegato
   * su dom.bookList, che usa closest() per risalire all'elemento cliccato.
   */
  function bindEvents() {
    // Tema
    dom.btnTheme.addEventListener('click', toggleTheme);

    // Reset applicazione
    dom.btnReset.addEventListener('click', resetApp);

    // Modale scorciatoie
    dom.btnShortcuts.addEventListener('click', toggleShortcutsModal);
    dom.btnCloseModal.addEventListener('click', () => {
      state.showShortcutsHelp = false;
      dom.shortcutsModal.style.display = 'none';
    });
    dom.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === dom.shortcutsModal) {
        state.showShortcutsHelp = false;
        dom.shortcutsModal.style.display = 'none';
      }
    });

    // Drag & drop e selezione file
    dom.dropZone.addEventListener('click', () => dom.fileInput.click());
    dom.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dom.dropZone.classList.add('drag-over');
    });
    dom.dropZone.addEventListener('dragleave', () => {
      dom.dropZone.classList.remove('drag-over');
    });
    dom.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dom.dropZone.classList.remove('drag-over');
      handleFileImport(e);
    });
    dom.fileInput.addEventListener('change', handleFileImport);

    // Ripristino database da IndexedDB
    dom.btnRestore.addEventListener('click', async () => {
      const stored = await loadFromIDB();
      if (stored && state.SQL) {
        try {
          const db = createDatabase(state.SQL, stored.arrayBuffer);
          dom.restoreBanner.style.display = 'none';
          loadDatabaseIntoApp(db, null, null);
        } catch (_) {
          showError('Errore nel ripristino del database. Per favore carica nuovamente il file.');
          await clearIDB();
          dom.restoreBanner.style.display = 'none';
        }
      }
    });
    dom.btnCancelRestore.addEventListener('click', async () => {
      await clearIDB();
      dom.restoreBanner.style.display = 'none';
    });

    // Event delegation per il click sulla lista libri.
    // Un singolo listener su dom.bookList sostituisce i listener individuali
    // su ogni <li>, eliminando allocazioni/distruzioni ad ogni re-render.
    dom.bookList.addEventListener('click', (e) => {
      const li = e.target.closest('[data-book-index]');
      if (!li) return;
      const idx = parseInt(li.dataset.bookIndex, 10);
      const book = state.filteredBooks[idx];
      if (book) selectBook(book.ContentID, book.BookTitle);
    });

    // Ricerca nella lista libri
    dom.searchBooks.addEventListener('input', () => {
      state.searchTerm = dom.searchBooks.value;
      state.focusedBookIndex = -1;
      renderBookList();
    });
    dom.clearBookSearch.addEventListener('click', () => {
      state.searchTerm = '';
      dom.searchBooks.value = '';
      state.focusedBookIndex = -1;
      renderBookList();
    });

    // Ricerca nelle evidenziazioni
    dom.searchHighlights.addEventListener('input', () => {
      state.highlightSearch = dom.searchHighlights.value;
      renderHighlights();
    });
    dom.clearHighlightSearch.addEventListener('click', () => {
      state.highlightSearch = '';
      dom.searchHighlights.value = '';
      renderHighlights();
    });

    // Esportazione evidenziazioni
    dom.btnExportHighlights.addEventListener('click', exportHighlights);

    // Esportazione lista libri (JSON, CSV, MD)
    $$('[data-export-format]').forEach((btn) => {
      btn.addEventListener('click', () => {
        exportBookList(btn.dataset.exportFormat);
      });
    });
  }

  // =========================================================================
  // INIZIALIZZAZIONE
  // =========================================================================

  /**
   * Punto di ingresso dell'applicazione.
   * Inizializza il DOM, il tema, la modale, gli eventi, SQL.js
   * e verifica la presenza di un database salvato in IndexedDB.
   *
   * @returns {Promise<void>}
   */
  async function init() {
    cacheDom();

    // Inizializzazione tema in base alle preferenze di sistema
    state.isDark = getSystemPreference();
    applyTheme();

    // Costruzione contenuto modale scorciatoie
    buildShortcutsModal();

    // Collegamento eventi e scorciatoie
    bindEvents();
    setupKeyboardShortcuts();

    // Caricamento SQL.js
    try {
      state.SQL = await initSqlJs();
      dom.sqlLoading.style.display = 'none';

      // Verifica database salvato in sessioni precedenti
      const stored = await loadFromIDB();
      if (stored) {
        dom.restoreFilename.textContent = stored.fileName;
        dom.restoreBanner.style.display = '';
      }
    } catch (err) {
      dom.sqlLoading.style.display = 'none';
      showError('Errore nel caricamento di SQL.js: ' + err.message);
    }
  }

  // Avvio applicazione
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// =============================================================================
// CHANGELOG
// =============================================================================
//
// v1.1.0 - Task 4.1: Stato centralizzato
//
//   - Rimosso: 10 variabili let individuali di stato (SQL, dbData, books,
//     filteredBooks, selectedBook, highlightsRaw, searchTerm, highlightSearch,
//     focusedBookIndex, isDark, showShortcutsHelp).
//
//   - Aggiunto: costante INITIAL_STATE con i valori di default di tutte le
//     proprieta' di stato; oggetto let state inizializzato via shallow copy di
//     INITIAL_STATE; funzione resetState() che ripristina state a INITIAL_STATE.
//
//   - Modificato: ogni lettura e scrittura delle variabili di stato ora avviene
//     tramite state.<proprieta'> in tutte le funzioni del file.
//
//   - Modificato: resetApp() ora chiama resetState() preservando state.isDark e
//     state.SQL, che non devono essere azzerati dal reset del database.
//
//   - Nessuna modifica a index.html o style.css.
//   - Nessuna variazione di comportamento visibile per l'utente finale.
//
// v1.2.0 - Task 2.1: Separare errore e contenuto in selectBook / renderHighlights
//
//   - Aggiunto: proprieta' highlightsError: null in INITIAL_STATE; separazione
//     netta tra stato di errore (string|null) e contenuto delle evidenziazioni
//     (string).
//
//   - Aggiunto: riferimento dom.highlightError in cacheDom().
//
//   - Modificato: selectBook() ora assegna result.error a state.highlightsError
//     e svuota state.highlightsRaw in caso di errore; in caso di successo azzera
//     state.highlightsError e assegna result.highlights a state.highlightsRaw.
//
//   - Modificato: renderHighlights() gestisce state.highlightsError come primo
//     caso con early return: mostra dom.highlightError, nasconde placeholder e
//     contenuto, blocca il pulsante di esportazione. Fuori dal ramo errore,
//     nasconde dom.highlightError prima di procedere con la logica esistente.
//
//   - Modificato: clearSelection() aggiunge il reset esplicito di
//     state.highlightsError = null (non coperto da resetState()).
//
//   - Nessuna variazione di comportamento per il caso nominale (nessun errore).
//
// v1.3.0 - Task 2.2: Reset del file input dopo importazione
//
//   - Aggiunto: callback reader.onloadend in handleFileImport() che azzera
//     dom.fileInput.value al termine della lettura, sia in caso di successo
//     che di errore. Permette il re-import dello stesso file senza ricaricare
//     la pagina.
//
//   - Modificato: JSDoc di handleFileImport() aggiornato per documentare
//     il comportamento di reset dell'input.
//
//   - Nessuna modifica a index.html o style.css.
//   - Nessuna variazione di comportamento per il caso nominale (file diversi).
//
// v1.4.0 - Task 2.3: Ricerca coerente su testo escapato
//
//   - Modificato: in renderHighlights(), nel blocco di highlighting visivo,
//     la variabile `escaped` e' stata sostituita con due variabili distinte:
//     `escapedHtml` (termine di ricerca passato per escapeHtml(), portandolo
//     nella stessa forma del testo su cui viene applicata la regex) ed
//     `escapedRegex` (escapedHtml con i metacaratteri regex escapati).
//     Corregge il mancato highlighting quando il termine di ricerca contiene
//     caratteri speciali HTML come &, <, >, ".
//
//   - Nessuna modifica a index.html o style.css.
//   - Nessuna variazione di comportamento per termini di ricerca senza
//     caratteri speciali HTML (caso nominale).
//
// v1.5.0 - Task 1.1: Event delegation sulla lista libri
//
//   - Rimosso: listener click individuale su ogni <li> in renderBookList()
//     (`li.addEventListener('click', () => selectBook(...))`). Eliminata la
//     creazione e distruzione di N closure ad ogni re-render della lista.
//
//   - Aggiunto: listener delegato su dom.bookList in bindEvents(). Usa
//     `e.target.closest('[data-book-index]')` per risalire all'elemento
//     cliccato e `parseInt(li.dataset.bookIndex, 10)` per ricavare l'indice
//     in state.filteredBooks. Guard esplicito `if (!li) return` per click
//     su aree prive di indice (es. elemento .empty-list).
//
//   - Modificato: JSDoc di renderBookList() e bindEvents() aggiornati per
//     documentare la delega degli eventi.
//
//   - Nessuna modifica a index.html o style.css.
//   - Nessuna variazione di comportamento visibile per l'utente finale.