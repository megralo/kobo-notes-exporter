import React, { useState, useRef, useEffect } from 'react';
import { BookList } from './BookList';
import { HighlightPreview } from './HighlightPreview';
// Wrapper per SQL.js
const sqlPromise = new Promise((resolve, reject) => {
  console.log("Inizializzazione di SQL.js...");
  // Verifica se SQL.js è già disponibile globalmente
  if (window.initSqlJs) {
    console.log("SQL.js trovato globalmente, inizializzazione...");
    window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    }).then(sql => {
      console.log("SQL.js inizializzato con successo!");
      resolve(sql);
    }).catch(error => {
      console.error("Errore nell'inizializzazione di SQL.js:", error);
      reject(error);
    });
  } else {
    // Attesa per il caricamento da CDN
    console.log("SQL.js non trovato, attesa del caricamento da CDN...");
    setTimeout(() => {
      if (window.initSqlJs || window.SQL) {
        console.log("SQL.js caricato da CDN, inizializzazione...");
        const initFn = window.initSqlJs || window.SQL;
        initFn({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        }).then(sql => {
          console.log("SQL.js inizializzato con successo!");
          resolve(sql);
        }).catch(error => {
          console.error("Errore nell'inizializzazione di SQL.js:", error);
          reject(error);
        });
      } else {
        const errorMsg = 'SQL.js non trovato. Assicurati di averlo installato o incluso via CDN.';
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }
    }, 1000);
  }
});
const App = () => {
  // Rilevamento iniziale della modalità scura dal browser
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(prefersDarkMode);
  const [fileName, setFileName] = useState('Trascina qui il tuo file .sqlite');
  const [dbData, setDbData] = useState(null);
  const [SQL, setSQL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [highlights, setHighlights] = useState('');
  const [highlightTitle, setHighlightTitle] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  // Effetto per gestire il cambio tema
  useEffect(() => {
    console.log("Cambio tema:", isDark ? "scuro" : "chiaro");
    // Aggiungi o rimuovi la classe dark dall'elemento HTML per Tailwind
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Imposta anche l'attributo data-theme per variabili CSS personalizzate
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  // Listener per cambiamenti nella preferenza di tema del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      console.log("Preferenza sistema cambiata:", e.matches ? "scuro" : "chiaro");
      // Non imposta direttamente lo stato per dare priorità alla scelta utente
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  useEffect(() => {
    const loadSQL = async () => {
      try {
        console.log("Tentativo di caricamento di SQL.js...");
        const sql = await sqlPromise;
        console.log("SQL.js caricato con successo, impostazione dello stato...");
        setSQL(sql);
      } catch (error) {
        console.error("Errore nel caricamento di SQL.js:", error);
        setLoadingError("Errore nel caricamento di SQL.js: " + error.message);
      }
    };
    loadSQL();
  }, []);
  useEffect(() => {
    if (dbData && SQL) {
      console.log("dbData e SQL sono disponibili, caricamento dei libri...");
      try {
        fetchBookList();
      } catch (error) {
        console.error("Errore in fetchBookList:", error);
        setLoadingError("Errore nel caricamento dei libri: " + error.message);
      }
    }
  }, [dbData, SQL]);
  const handleFileImport = (e) => {
    try {
      console.log("Inizio importazione file...");
      const files = e.target.files || (e.dataTransfer ? e.dataTransfer.files : null);
      if (!files || files.length === 0) {
        console.log("Nessun file selezionato");
        return;
      }
      console.log("File selezionato:", files[0].name);
      setFileName(files[0].name);
      setLoadingError(null); // Reset degli errori precedenti
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        console.log("File caricato con successo, creazione database...");
        try {
          if (!SQL) {
            throw new Error("SQL.js non è stato caricato correttamente");
          }
          if (typeof fileReader.result === 'string') {
            console.error("FileReader ha restituito una stringa invece di un ArrayBuffer");
            throw new Error("Formato file non valido");
          }
          console.log("Creazione del database SQL...");
          const db = new SQL.Database(new Uint8Array(fileReader.result));
          console.log("Database creato con successo");
          setDbData(db);
          setLoading(true);
        } catch (error) {
          console.error("Errore nella creazione del database:", error);
          setLoadingError("Errore nel processare il file: " + error.message);
        }
      };
      fileReader.onerror = (error) => {
        console.error("Errore nella lettura del file:", error);
        setLoadingError("Errore nella lettura del file: " + error);
      };
      console.log("Avvio lettura del file come ArrayBuffer...");
      fileReader.readAsArrayBuffer(files[0]);
    } catch (error) {
      console.error("Errore generale nell'importazione del file:", error);
      setLoadingError("Errore generale: " + error.message);
    }
  };
  const fetchBookList = () => {
    console.log("Caricamento lista libri...");
    try {
      // Verifica che dbData sia valido
      if (!dbData || typeof dbData.prepare !== 'function') {
        throw new Error("Database non valido");
      }
      // Query universale che dovrebbe funzionare su tutti i database Kobo
      console.log("Esecuzione query per lista libri...");
      // Prima prova a ottenere libri con evidenziazioni
      const stmt = dbData.prepare(`
        SELECT DISTINCT
          content.ContentID,
          content.Title as BookTitle,
          content.Attribution as Author
        FROM content
        INNER JOIN bookmark ON content.ContentID = bookmark.VolumeID
        WHERE content.ContentType = 6
          AND content.Title IS NOT NULL
          AND content.Title != ''
        ORDER BY content.Title
      `);
      const bookList = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        bookList.push(row);
      }
      console.log(`Trovati ${bookList.length} libri con evidenziazioni`);
      setBooks(bookList);
      if (bookList.length === 0) {
        console.log("Nessun libro con evidenziazioni trovato nel database");
      }
    } catch (error) {
      console.error("Errore nel caricamento dei libri:", error);
      setLoadingError("Errore nel caricamento della lista libri: " + error.message);
      // In caso di errore, tenta una query più semplice
      try {
        console.log("Tentativo con query alternativa...");
        const stmt = dbData.prepare(`
          SELECT DISTINCT
            content.ContentID,
            content.Title as BookTitle,
            content.Attribution as Author
          FROM content
          WHERE content.ContentType = 6
            AND content.Title IS NOT NULL
            AND content.Title != ''
          ORDER BY content.Title
          LIMIT 100
        `);
        const bookList = [];
        while (stmt.step()) {
          const row = stmt.getAsObject();
          bookList.push(row);
        }
        console.log(`Trovati ${bookList.length} libri (query alternativa)`);
        setBooks(bookList);
        setLoadingError(null);
      } catch (secondError) {
        console.error("Anche la query alternativa ha fallito:", secondError);
        setLoadingError("Impossibile caricare i libri: " + secondError.message);
      }
    }
  };
  const fetchHighlights = (contentId, bookTitle) => {
    console.log(`Caricamento evidenziazioni per il libro: ${bookTitle} (ID: ${contentId})`);
    setHighlightTitle(bookTitle);
    setSelectedBook({ contentId, bookTitle });
    try {
      const stmt = dbData.prepare(`
        SELECT
          bookmark.Text as HighlightText,
          bookmark.Annotation as Note
        FROM bookmark
        WHERE bookmark.VolumeID = ?
        ORDER BY bookmark.DateCreated
      `);
      stmt.bind([contentId]);
      let highlightContent = '';
      let count = 0;
      while (stmt.step()) {
        const row = stmt.getAsObject();
        count++;
        if (row.HighlightText) {
          // Aggiunta di un separatore per chiarezza
          highlightContent += `Evidenziazione ${count}:\n\n`;
          // Testo dell'evidenziazione
          highlightContent += `${row.HighlightText}\n`;
          // Aggiungi la nota se presente
          if (row.Note) {
            highlightContent += `\nNote: ${row.Note}\n`;
          }
          // Separatore tra evidenziazioni
          highlightContent += '\n---\n\n';
        }
      }
      console.log(`Trovate ${count} evidenziazioni`);
      setHighlights(highlightContent || 'Nessuna evidenziazione trovata per questo libro.');
    } catch (error) {
      console.error("Errore nel caricamento delle evidenziazioni:", error);
      setHighlights('Errore nel caricamento delle evidenziazioni: ' + error.message);
    }
  };
  const exportBookList = (format) => {
    let content = '';
    const filename = `kobo-booklist.${format}`;
    if (format === 'json') {
      content = JSON.stringify(books, null, 2);
    } else if (format === 'md') {
      content = '# Kobo Book List\n\n';
      books.forEach(book => {
        content += `- ${book.BookTitle}${book.Author ? ` by ${book.Author}` : ''}\n`;
      });
    } else if (format === 'csv') {
      content = 'Title,Author\n';
      books.forEach(book => {
        content += `"${book.BookTitle.replace(/"/g, '""')}","${book.Author ? book.Author.replace(/"/g, '""') : ''}"\n`;
      });
    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportHighlights = () => {
    if (!selectedBook) return;
    const filename = `${selectedBook.bookTitle.replace(/[/\\?%*:|"<>]/g, '-')}-highlights.md`;
    const content = `# ${selectedBook.bookTitle}\n\n${highlights}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileImport(e);
  };
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  // Funzione esplicita per il toggle del tema
  const toggleDarkMode = () => {
    setIsDark(prevMode => !prevMode);
    console.log("Toggle tema cliccato, nuovo stato:", !isDark ? "scuro" : "chiaro");
  };
  // Filtra i libri in base al termine di ricerca
  const filteredBooks = books.filter(book =>
    book.BookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.Author?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Esportatore di note Kobo</h1>
          <div className="flex items-center space-x-4">
            {/* Pulsante per la modalità dark/light con testo */}
            <button
              onClick={toggleDarkMode}
              className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center"
            >
              <span className="mr-2">{isDark ? '☀️' : '🌙'}</span>
              <span className="text-sm font-medium">{isDark ? 'Modalità Chiara' : 'Modalità Scura'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content - fixed height container */}
      <main className="flex-1 overflow-hidden container mx-auto p-4">
        {!loading ? (
          
          /* Area di caricamento file */
          <div className="max-w-2xl mx-auto mt-10">
            <div
              className="border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg p-10 text-center cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
              onClick={handleFileClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-5xl mb-4">📚</div>
              <p className="text-xl font-medium mb-2">{fileName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">oppure clicca per selezionarlo</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileImport}
              className="hidden"
              accept=".sqlite"
            />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
              Collega il tuo lettore Kobo a un computer. Troverai la directory .kobo (nascosta di default).
              Al suo interno dovrebbe esserci un file KoboReader.sqlite.
            </p>

            {/* Mostra eventuali errori */}
            {loadingError && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md border border-red-300 dark:border-red-800">
                <p className="font-medium">Errore:</p>
                <p>{loadingError}</p>
              </div>
            )}

            {/* Indicatore di caricamento */}
            {SQL === null && !loadingError && (
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-md">
                Caricamento delle librerie in corso...
              </div>
            )}
          </div>
        ) : (

          /* Layout libri e note (visibile dopo caricamento file) - con altezza fissa */
          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)]">
            {/* Sidebar con lista libri */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col h-full">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col h-full">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <h2 className="font-bold">I tuoi libri</h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cerca..."
                      className="py-1 px-3 pr-8 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm ? (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Cancella ricerca"
                      >
                        ✕
                      </button>
                    ) : (
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-grow">
                  <BookList
                    books={filteredBooks}
                    selectedBookId={selectedBook?.contentId}
                    onSelectBook={fetchHighlights}
                  />
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{books.length} libri</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => exportBookList('json')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => exportBookList('csv')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => exportBookList('md')}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      MD
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Area principale con le note */}
            <div className="w-full md:w-2/3 lg:w-3/4 h-full">
              <HighlightPreview
                title={highlightTitle}
                content={highlights}
                onExport={exportHighlights}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="py-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        Made with ❤️
      </footer>
    </div>
  );
};
export default App;