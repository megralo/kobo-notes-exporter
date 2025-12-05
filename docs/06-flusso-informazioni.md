# Flusso delle Informazioni - Documentazione Tecnica

## Panoramica

Questo documento descrive come i dati fluiscono attraverso l'applicazione, dal caricamento del file SQLite fino alla visualizzazione e esportazione delle evidenziazioni.

---

## 1. Flusso Inizializzazione Applicazione

```
┌─────────────────────────────────────────────────────────┐
│ 1. Browser carica index.html                            │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 2. Script CDN caricano SQL.js e Tailwind                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 3. main.jsx esegue ReactDOM.createRoot()                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 4. App.jsx monta e inizializza                          │
│    - Rileva tema sistema (dark/light)                   │
│    - Inizializza stati locali                           │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 5. useEffect: Carica SQL.js                             │
│    - Attende sqlPromise                                 │
│    - Imposta stato SQL                                  │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 6. useEffect: Applica tema                              │
│    - Aggiunge classe 'dark' se necessario               │
│    - Imposta data-theme attribute                       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ 7. Render: Mostra area drop file                        │
│    - Drag & drop zone                                   │
│    - Pulsante tema                                      │
└─────────────────────────────────────────────────────────┘
```

### Dettagli Stati Iniziali

```javascript
// Al montaggio del componente
{
  isDark: [valore da preferenza sistema],
  fileName: 'Trascina qui il tuo file .sqlite',
  dbData: null,
  SQL: null,  // Diventa disponibile dopo useEffect
  loading: false,
  loadingError: null,
  books: [],
  selectedBook: null,
  highlights: '',
  highlightTitle: '',
  searchTerm: ''
}
```

---

## 2. Flusso Caricamento File

```
┌─────────────────────────────────────────────────────────┐
│ Utente trascina/seleziona KoboReader.sqlite             │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ handleFileImport(event)                                  │
│  ├─ Recupera file da event                              │
│  ├─ Imposta fileName nello stato                        │
│  └─ Crea FileReader                                     │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ FileReader.readAsArrayBuffer(file)                      │
│  - Lettura asincrona file                               │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ FileReader.onload callback                               │
│  ├─ Verifica SQL disponibile                            │
│  ├─ Converte result in Uint8Array                       │
│  └─ new SQL.Database(uint8Array)                        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Aggiornamenti stato                                      │
│  ├─ setDbData(database instance)                        │
│  ├─ setLoading(true)                                    │
│  └─ setLoadingError(null)                               │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ useEffect rileva dbData && SQL                           │
│  └─ Chiama fetchBookList()                              │
└─────────────────────────────────────────────────────────┘
```

### Gestione Errori nel Caricamento

```
FileReader Error ─────┐
                      │
SQL.js non disponibile┼─> setLoadingError(messaggio)
                      │
Formato file invalido ┘

                      ↓
             
         Render error box rosso
                      ↓
         Utente può ritentare
```

---

## 3. Flusso Estrazione Libri

```
┌─────────────────────────────────────────────────────────┐
│ fetchBookList()                                          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Query SQL                                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SELECT DISTINCT                                     │ │
│ │   content.ContentID,                                │ │
│ │   content.Title as BookTitle,                       │ │
│ │   content.Attribution as Author                     │ │
│ │ FROM content                                        │ │
│ │ INNER JOIN bookmark ON content.ContentID = ...     │ │
│ │ WHERE content.ContentType = 6                       │ │
│ │   AND content.Title IS NOT NULL                     │ │
│ │ ORDER BY content.Title                              │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ dbData.prepare(query)                                    │
│  └─ Ritorna statement preparato                         │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Iterazione risultati                                     │
│ while (stmt.step()) {                                    │
│   const row = stmt.getAsObject();                        │
│   bookList.push(row);                                    │
│ }                                                        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ setBooks(bookList)                                       │
│  - Aggiorna stato React                                 │
│  - Trigger re-render                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Render BookList component                                │
│  - Riceve books[] come prop                             │
│  - Mostra lista scrollabile                             │
└─────────────────────────────────────────────────────────┘
```

### Struttura Dati Libro

```javascript
{
  ContentID: "file:///mnt/onboard/...",  // Path completo nel Kobo
  BookTitle: "1984",
  Author: "George Orwell"  // Può essere null
}
```

### Query Fallback

Se la query principale fallisce:

```sql
-- Query semplificata senza JOIN
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
```

**Differenze**:
- Nessun JOIN con bookmark
- Include libri senza evidenziazioni
- LIMIT 100 per sicurezza

---

## 4. Flusso Ricerca Libri

```
┌─────────────────────────────────────────────────────────┐
│ Utente digita in search box                             │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ onChange event                                           │
│  └─ setSearchTerm(e.target.value)                       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Render App.jsx                                           │
│  - Calcola filteredBooks                                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Filtro in-memory                                         │
│ const filteredBooks = books.filter(book =>              │
│   book.BookTitle?.toLowerCase()                          │
│     .includes(searchTerm.toLowerCase()) ||              │
│   book.Author?.toLowerCase()                             │
│     .includes(searchTerm.toLowerCase())                 │
│ )                                                        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ BookList riceve filteredBooks                            │
│  - Re-render con lista filtrata                         │
│  - Nessuna chiamata database                            │
└─────────────────────────────────────────────────────────┘
```

### Esempio Filtraggio

**Stato Iniziale**:
```javascript
books = [
  { ContentID: "1", BookTitle: "1984", Author: "George Orwell" },
  { ContentID: "2", BookTitle: "Dune", Author: "Frank Herbert" },
  { ContentID: "3", BookTitle: "Foundation", Author: "Isaac Asimov" }
]
```

**Utente digita "dune"**:
```javascript
searchTerm = "dune"

filteredBooks = [
  { ContentID: "2", BookTitle: "Dune", Author: "Frank Herbert" }
]
```

**Utente digita "herbert"**:
```javascript
searchTerm = "herbert"

filteredBooks = [
  { ContentID: "2", BookTitle: "Dune", Author: "Frank Herbert" }
]
```

---

## 5. Flusso Selezione Libro e Caricamento Evidenziazioni

```
┌─────────────────────────────────────────────────────────┐
│ Utente clicca su libro in BookList                      │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ BookList onClick                                         │
│  └─ onSelectBook(book.ContentID, book.BookTitle)        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ App.jsx fetchHighlights(contentId, bookTitle)           │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Aggiornamenti stato immediati                            │
│  ├─ setHighlightTitle(bookTitle)                        │
│  └─ setSelectedBook({ contentId, bookTitle })           │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Query SQL evidenziazioni                                 │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ SELECT                                              │ │
│ │   bookmark.Text as HighlightText,                   │ │
│ │   bookmark.Annotation as Note                       │ │
│ │ FROM bookmark                                       │ │
│ │ WHERE bookmark.VolumeID = ?                         │ │
│ │ ORDER BY bookmark.DateCreated                       │ │
│ └─────────────────────────────────────────────────────┘ │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ stmt.bind([contentId])                                   │
│  - Binding parametro query                              │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Iterazione ed formattazione                              │
│ let highlightContent = '';                               │
│ let count = 0;                                           │
│ while (stmt.step()) {                                    │
│   count++;                                               │
│   highlightContent += `Evidenziazione ${count}:\n\n`;    │
│   highlightContent += `${row.HighlightText}\n`;          │
│   if (row.Note) {                                        │
│     highlightContent += `\nNote: ${row.Note}\n`;         │
│   }                                                      │
│   highlightContent += '\n---\n\n';                       │
│ }                                                        │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ setHighlights(highlightContent)                          │
│  - Aggiorna stato con string formattata                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ HighlightPreview riceve nuove props                      │
│  ├─ title = highlightTitle                              │
│  └─ content = highlights                                │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ useEffect in HighlightPreview                            │
│  └─ Filtra contenuto (se c'è searchHighlight)           │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Render evidenziazioni                                    │
│  - Mostra in <pre> element                              │
│  - Scrollabile se necessario                            │
└─────────────────────────────────────────────────────────┘
```

### Formato Output Evidenziazioni

```
Evidenziazione 1:

It was a bright cold day in April, and the clocks were striking thirteen.

Note: Incipit memorabile

---

Evidenziazione 2:

War is peace. Freedom is slavery. Ignorance is strength.

---

Evidenziazione 3:

Big Brother is watching you.

Note: Slogan del partito

---
```

---

## 6. Flusso Ricerca nelle Evidenziazioni

```
┌─────────────────────────────────────────────────────────┐
│ Utente digita in search box (HighlightPreview)          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ onChange event                                           │
│  └─ setSearchHighlight(e.target.value)                  │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ useEffect [content, searchHighlight]                     │
│  - Trigger su cambio dipendenze                         │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐       ┌──────────────┐
│ searchHighlight│      │ content      │
│ vuoto?        │      │ valido?      │
└───────┬───────┘      └──────┬───────┘
        │ No                   │ No
        │ Yes                  │ Yes
        ▼                      ▼
  Mostra tutto          Dividi in sezioni
                        content.split('---\n\n')
                               │
                               ▼
                        Filtra sezioni
                        section.toLowerCase()
                          .includes(term)
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
        Match trovati                  Nessun match
                │                             │
                ▼                             ▼
    Ricomponi con separatori      Messaggio "Nessun risultato"
    matchingSections.join()
                │
                └──────────────┬──────────────┘
                               │
                               ▼
                    setFilteredContent(result)
                               │
                               ▼
                       Re-render <pre>
```

### Esempio Filtraggio Evidenziazioni

**Contenuto Originale**:
```
Evidenziazione 1:

Il potere corrompe.

---

Evidenziazione 2:

La conoscenza è potere.

---

Evidenziazione 3:

L'ignoranza è forza.

---
```

**Ricerca "potere"**:
```
Evidenziazione 1:

Il potere corrompe.

---

Evidenziazione 2:

La conoscenza è potere.

---
```

---

## 7. Flusso Esportazione

### 7a. Esportazione Lista Libri

```
┌─────────────────────────────────────────────────────────┐
│ Utente clicca pulsante JSON/CSV/MD                       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ exportBookList(format)                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    JSON         CSV          MD
        │           │           │
        ▼           ▼           ▼
 JSON.stringify  Loop + CSV  Loop + MD
                  format      format
        │           │           │
        └───────────┼───────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Creazione Blob                                           │
│  const blob = new Blob([content], {type: 'text/plain'})│
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Creazione URL temporaneo                                 │
│  const url = URL.createObjectURL(blob)                  │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Creazione elemento <a> dinamico                          │
│  const a = document.createElement('a')                   │
│  a.href = url                                            │
│  a.download = filename                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Trigger download                                         │
│  a.click()                                               │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Cleanup                                                  │
│  URL.revokeObjectURL(url)                                │
└─────────────────────────────────────────────────────────┘
```

### 7b. Esportazione Evidenziazioni

```
┌─────────────────────────────────────────────────────────┐
│ Utente clicca "Esporta note"                            │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ exportHighlights()                                       │
│  - Verifica selectedBook non null                       │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Sanitizzazione nome file                                 │
│  filename = bookTitle                                    │
│    .replace(/[/\\?%*:|"<>]/g, '-')                      │
│    + '-highlights.md'                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Composizione contenuto Markdown                          │
│  content = `# ${bookTitle}\n\n${highlights}`            │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Creazione Blob e download                                │
│  (stesso processo esportazione lista)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Flusso Cambio Tema

```
┌─────────────────────────────────────────────────────────┐
│ Utente clicca toggle tema (sole/luna)                   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ toggleDarkMode()                                         │
│  └─ setIsDark(prevMode => !prevMode)                    │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ State update                                             │
│  isDark: false → true (o viceversa)                     │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ useEffect [isDark] trigger                               │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
   isDark true            isDark false
        │                       │
        ▼                       ▼
  Aggiungi classe          Rimuovi classe
  'dark' su <html>         'dark' da <html>
        │                       │
        ▼                       ▼
  data-theme='dark'      data-theme='light'
        │                       │
        └───────────┬───────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Tailwind applica stili dark:*                           │
│  - dark:bg-gray-800                                     │
│  - dark:text-gray-200                                   │
│  - etc.                                                 │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ CSS custom properties applicate                          │
│  --background-color: #1a202c                            │
│  --text-color: #e2e8f0                                  │
│  etc.                                                   │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ Browser ri-renderizza con nuovi stili                   │
│  - Transizione smooth grazie a transition-colors        │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Mappa Completa Dipendenze Dati

```
                    dbData (SQLite Database)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   fetchBookList()                    fetchHighlights(id)
        │                                     │
        ▼                                     ▼
    books[]                              highlights (string)
        │                                     │
        ├──> searchTerm (filter)             ├──> highlightTitle
        │                                     │
        ▼                                     ▼
  filteredBooks[]                    HighlightPreview
        │                                     │
        ▼                                     └──> searchHighlight (filter)
   BookList                                         │
        │                                           ▼
        └──> selectedBookId                   filteredContent
                    │
                    └──────────────────┐
                                       ▼
                              Visual feedback
                            (bg-blue-50 su libro)
```

### Legenda

- `─>` : Flusso dati
- `│` : Dipendenza verticale
- `┌┐└┘` : Box logici

---

## 10. Gestione Errori Global

```
                    Error occurs
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
  SQL.js load       File read        Query error
      error            error
        │                 │                 │
        ▼                 ▼                 ▼
setLoadingError()  setLoadingError()  console.error()
                                       + fallback query
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
            Red error box rendered
                          │
                          ▼
                User can retry action
```

---

## Performance Considerations

### Operazioni Sincrone vs Asincrone

**Sincrone** (immediate):
- Filtri client-side (searchTerm, searchHighlight)
- Toggle tema
- State updates React

**Asincrone** (con delay):
- Caricamento SQL.js (~1s)
- Lettura file SQLite (dipende da dimensione)
- Query database (generalmente <100ms)

### Ottimizzazioni Implementate

1. **Query con INNER JOIN**: Solo libri con highlights
2. **DISTINCT**: Elimina duplicati a livello database
3. **Filter client-side**: Evita re-query per ricerche
4. **State batching**: React agrupa multiple setState
5. **Lazy loading**: SQL.js WASM caricato on-demand