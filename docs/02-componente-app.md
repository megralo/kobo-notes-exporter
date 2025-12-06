# Componente App.jsx - Documentazione Tecnica

## Panoramica

`App.jsx` è il componente root dell'applicazione. Gestisce l'intero ciclo di vita dell'applicazione, dall'inizializzazione di SQL.js alla gestione del database Kobo, fino al coordinamento dei componenti figlio.

## Responsabilità Principali

1. Inizializzazione e gestione di SQL.js
2. Caricamento e parsing del file SQLite Kobo
3. Gestione dello stato globale dell'applicazione
4. Coordinamento tra componenti BookList e HighlightPreview
5. Gestione del tema chiaro/scuro
6. Funzionalità di esportazione dati

## Struttura degli Stato

### Stati Principali

```javascript
// Tema e UI
const [isDark, setIsDark] = useState(prefersDarkMode)

// Database e caricamento
const [fileName, setFileName] = useState('Trascina qui il tuo file .sqlite')
const [dbData, setDbData] = useState(null)
const [SQL, setSQL] = useState(null)
const [loading, setLoading] = useState(false)
const [loadingError, setLoadingError] = useState(null)

// Dati applicazione
const [books, setBooks] = useState([])
const [selectedBook, setSelectedBook] = useState(null)
const [highlights, setHighlights] = useState('')
const [highlightTitle, setHighlightTitle] = useState('')
const [searchTerm, setSearchTerm] = useState('')

// Ref
const fileInputRef = useRef(null)
```

### Spiegazione Stati

- **isDark**: Boolean per tracciare se il tema scuro è attivo
- **fileName**: Stringa mostrata nell'area di caricamento file
- **dbData**: Istanza del database SQL.js caricato in memoria
- **SQL**: Riferimento alla libreria SQL.js inizializzata
- **loading**: Flag per mostrare/nascondere la UI di caricamento
- **loadingError**: Stringa contenente eventuali messaggi di errore
- **books**: Array degli oggetti libro estratti dal database
- **selectedBook**: Oggetto contenente `contentId` e `bookTitle` del libro selezionato
- **highlights**: Stringa contenente tutte le evidenziazioni formattate
- **highlightTitle**: Titolo del libro correntemente visualizzato
- **searchTerm**: Termine di ricerca per filtrare i libri
- **fileInputRef**: Riferimento DOM all'input file nascosto

## Effetti (useEffect)

### 1. Gestione Tema

```javascript
useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
}, [isDark]);
```

**Scopo**: Applicare le classi CSS e gli attributi necessari per il tema scuro/chiaro.

**Dettagli**:
- Aggiunge/rimuove la classe `dark` sull'elemento `<html>` per Tailwind
- Imposta l'attributo `data-theme` per le variabili CSS personalizzate

### 2. Listener Preferenza Sistema

```javascript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e) => {
    console.log("Preferenza sistema cambiata:", e.matches ? "scuro" : "chiaro");
  };
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

**Scopo**: Rilevare cambiamenti nella preferenza tema del sistema operativo.

**Nota**: Attualmente solo logga il cambiamento senza modificare il tema (priorità alla scelta utente).

### 3. Caricamento SQL.js

```javascript
useEffect(() => {
  const loadSQL = async () => {
    try {
      const sql = await sqlPromise;
      setSQL(sql);
    } catch (error) {
      console.error("Errore nel caricamento di SQL.js:", error);
      setLoadingError("Errore nel caricamento di SQL.js: " + error.message);
    }
  };
  loadSQL();
}, []);
```

**Scopo**: Inizializzare SQL.js all'avvio dell'applicazione.

**Dettagli**:
- Attende il completamento della Promise `sqlPromise` definita globalmente
- Imposta lo stato `SQL` con l'istanza della libreria
- Gestisce errori di caricamento

### 4. Caricamento Libri

```javascript
useEffect(() => {
  if (dbData && SQL) {
    try {
      fetchBookList();
    } catch (error) {
      console.error("Errore in fetchBookList:", error);
      setLoadingError("Errore nel caricamento dei libri: " + error.message);
    }
  }
}, [dbData, SQL]);
```

**Scopo**: Estrarre la lista libri quando il database è pronto.

**Trigger**: Si attiva quando sia `dbData` che `SQL` sono disponibili.

## Funzioni Principali

### handleFileImport(e)

**Scopo**: Gestire l'importazione del file SQLite.

**Flusso**:
1. Recupera il file da `e.target.files` o `e.dataTransfer.files` (drag & drop)
2. Imposta il nome file nell'UI
3. Usa FileReader per leggere il file come ArrayBuffer
4. Crea un'istanza del database con `new SQL.Database()`
5. Imposta gli stati `dbData` e `loading`

**Gestione Errori**:
- Verifica presenza file
- Verifica che SQL.js sia caricato
- Gestisce errori di formato file
- Gestisce errori di lettura FileReader

### fetchBookList()

**Scopo**: Estrarre i libri con evidenziazioni dal database.

**Query SQL**:
```sql
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
```

**Dettagli**:
- `ContentType = 6`: Identifica i libri (non articoli o altro)
- INNER JOIN con `bookmark`: Solo libri con evidenziazioni
- Query fallback più semplice in caso di errore

### fetchHighlights(contentId, bookTitle)

**Scopo**: Estrarre le evidenziazioni per un libro specifico.

**Query SQL**:
```sql
SELECT
  bookmark.Text as HighlightText,
  bookmark.Annotation as Note
FROM bookmark
WHERE bookmark.VolumeID = ?
ORDER BY bookmark.DateCreated
```

**Formattazione Output**:
```
Evidenziazione 1:

[Testo evidenziazione]

Note: [Nota associata se presente]

---

Evidenziazione 2:
...
```

**Dettagli**:
- Ordinate cronologicamente (`DateCreated`)
- Separatore `---` tra evidenziazioni
- Note opzionali

### exportBookList(format)

**Scopo**: Esportare la lista completa dei libri in vari formati.

**Formati Supportati**:

1. **JSON**:
```json
[
  {
    "ContentID": "...",
    "BookTitle": "...",
    "Author": "..."
  }
]
```

2. **CSV**:
```csv
Title,Author
"Book Title","Author Name"
```

3. **Markdown**:
```markdown
# Kobo Book List

- Book Title by Author Name
```

**Gestione Download**:
- Crea un Blob con il contenuto
- Genera URL temporaneo
- Crea elemento `<a>` dinamicamente
- Trigger click programmatico
- Revoca URL per liberare memoria

### exportHighlights()

**Scopo**: Esportare le evidenziazioni del libro corrente in Markdown.

**Formato**:
```markdown
# [Titolo Libro]

[Contenuto evidenziazioni]
```

**Nome File**: Caratteri speciali sostituiti con `-` per compatibilità filesystem.

### handleDragOver(e) / handleDrop(e)

**Scopo**: Gestire il drag & drop del file SQLite.

**Dettagli**:
- `handleDragOver`: Previene comportamento default per permettere il drop
- `handleDrop`: Previene apertura file nel browser e delega a `handleFileImport`

### handleFileClick()

**Scopo**: Aprire il dialog di selezione file nativo.

**Implementazione**: Trigger programmatico del click sull'input nascosto.

### toggleDarkMode()

**Scopo**: Cambiare tema tra chiaro e scuro.

**Implementazione**: Inverte lo stato booleano `isDark`.

## Filtraggio e Ricerca

### filteredBooks

**Definizione**:
```javascript
const filteredBooks = books.filter(book =>
  book.BookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  book.Author?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Scopo**: Creare un array derivato contenente solo i libri che corrispondono al termine di ricerca.

**Logica**:
- Ricerca case-insensitive (conversione a lowercase)
- Ricerca sia nel titolo che nell'autore
- Safe navigation operator (`?.`) per gestire valori null/undefined
- Substring matching (non richiede corrispondenza esatta)

**Utilizzo**:
- Passato al componente `BookList` come prop `books`
- Utilizzato per il contatore dinamico nella sidebar

### Contatore Dinamico Libri

**Implementazione**:
```javascript
<span className="text-sm text-gray-600 dark:text-gray-400">
  {filteredBooks.length} libri
</span>
```

**Scopo**: Mostrare all'utente il numero di libri attualmente visualizzati, aggiornandosi in tempo reale durante la ricerca.

**Comportamento**:
- **Senza ricerca**: Mostra il numero totale di libri nel database
- **Durante ricerca**: Mostra il numero di libri che corrispondono ai criteri
- **Nessun risultato**: Mostra "0 libri"

**Vantaggi UX**:
- Feedback visivo immediato durante la digitazione
- Coerenza tra lista visualizzata e contatore
- Aiuta l'utente a valutare l'efficacia della ricerca

**Note Implementative**:
- Versione 1.0.0: utilizzava `books.length` (sempre totale)
- Versione 1.0.1: aggiornato a `filteredBooks.length` (dinamico)
- Nessun impatto sulle performance (array già calcolato per rendering)

## Flusso di Inizializzazione

```
1. Montaggio Componente
   |
2. useEffect: Carica SQL.js (asyncrono)
   |
3. useEffect: Applica tema iniziale
   |
4. Render: Area caricamento file
   |
5. Utente carica file
   |
6. handleFileImport: Crea istanza database
   |
7. useEffect: Rileva dbData + SQL disponibili
   |
8. fetchBookList: Query database
   |
9. Aggiorna state books[]
   |
10. Render: Lista libri + area evidenziazioni
```

## Struttura JSX

```
<div className="min-h-screen">
  <header>
    - Titolo
    - Toggle tema
  </header>
  
  <main>
    {!loading ? (
      // Area caricamento file
      <FileDropZone />
    ) : (
      // Layout principale
      <div className="flex">
        <aside>
          // Sidebar libri
          <BookList books={filteredBooks} />
          // Footer con contatore dinamico
          <footer>
            {filteredBooks.length} libri
          </footer>
        </aside>
        <section>
          // Area evidenziazioni
          <HighlightPreview />
        </section>
      </div>
    )}
  </main>
  
  <footer>
    Made with ❤️
  </footer>
</div>
```

**Nota sul Contatore**: Il footer della sidebar utilizza `filteredBooks.length` per garantire che il conteggio rifletta sempre i risultati attualmente visibili, fornendo coerenza e feedback in tempo reale all'utente.

## Gestione Errori

### Livelli di Gestione

1. **Caricamento SQL.js**: Errore bloccante, mostra messaggio
2. **Caricamento File**: Errore recuperabile, mostra messaggio ma permette retry
3. **Query Database**: Errore recuperabile, mostra messaggio e tenta query fallback

### Messaggi Utente

Tutti gli errori sono mostrati in un box rosso sopra l'area di caricamento:
```jsx
{loadingError && (
  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 ...">
    <p className="font-medium">Errore:</p>
    <p>{loadingError}</p>
  </div>
)}
```

## Ottimizzazioni

1. **Lazy Loading**: SQL.js caricato da CDN solo quando necessario
2. **Memoizzazione Implicita**: Componenti figli non ri-renderizzano se props non cambiano
3. **Query Efficienti**: DISTINCT e JOIN per minimizzare dati processati
4. **FileReader Asincrono**: Non blocca UI durante lettura file
5. **Filtraggio Client-Side**: Ricerca istantanea senza query database aggiuntive

## Dipendenze Esterne

- `React`: Hook e JSX
- `SQL.js`: Caricato da CDN Cloudflare
- `BookList`: Componente figlio
- `HighlightPreview`: Componente figlio

## Note Implementative

### SQL.js Promise Wrapper

```javascript
const sqlPromise = new Promise((resolve, reject) => {
  // Controlla se SQL.js è disponibile globalmente
  if (window.initSqlJs) {
    // Inizializza immediatamente
  } else {
    // Attende caricamento da CDN (1 secondo)
    setTimeout(() => { ... }, 1000);
  }
});
```

**Motivazione**: Gestire sia caricamento sincrono che asincrono di SQL.js.

### Preferenza Tema Iniziale

```javascript
const prefersDarkMode = window.matchMedia && 
  window.matchMedia('(prefers-color-scheme: dark)').matches;
```

**Motivazione**: Rispettare le preferenze sistema dell'utente al primo avvio.

## Versioning

- **v1.0.0**: Rilascio iniziale con tutte le funzionalità core
- **v1.0.1**: Aggiornato contatore libri per riflettere risultati filtrati in tempo reale