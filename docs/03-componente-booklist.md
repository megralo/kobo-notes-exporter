# Componente BookList.jsx - Documentazione Tecnica

## Panoramica

`BookList.jsx` è un componente presentazionale responsabile della visualizzazione della lista dei libri con evidenziazioni. Gestisce la renderizzazione di ogni elemento libro e le interazioni di selezione.

## Responsabilità

1. Renderizzare la lista dei libri in formato scrollabile
2. Evidenziare visualmente il libro correntemente selezionato
3. Gestire il click su un libro per la selezione
4. Mostrare feedback visivo (hover, selezione)
5. Gestire il caso di lista vuota con messaggio appropriato

## Props

```javascript
{
  books: Array<{
    ContentID: string,
    BookTitle: string,
    Author?: string
  }>,
  selectedBookId: string,
  onSelectBook: (contentId: string, bookTitle: string) => void,
  onExport: () => void  // Non utilizzato in questa versione
}
```

### Dettaglio Props

- **books**: Array di oggetti libro estratti dal database Kobo
  - `ContentID`: Identificatore unico del libro nel database
  - `BookTitle`: Titolo del libro
  - `Author`: Autore del libro (opzionale)

- **selectedBookId**: ID del libro correntemente selezionato
  - Usato per applicare stili di evidenziazione
  - `null` se nessun libro è selezionato

- **onSelectBook**: Callback per gestire la selezione di un libro
  - Chiamata con `ContentID` e `BookTitle` quando l'utente clicca su un libro
  - Gestita da `App.jsx` tramite `fetchHighlights`

- **onExport**: Prop legacy non utilizzata nell'implementazione corrente
  - Potenzialmente per funzionalità future

## Struttura Componente

```javascript
export const BookList = ({ books, selectedBookId, onSelectBook, onExport }) => {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {books.length > 0 ? (
        // Rendering libri
      ) : (
        // Messaggio lista vuota
      )}
    </ul>
  );
};
```

## Rendering Condizionale

### Caso 1: Lista Popolata

Quando `books.length > 0`:

```jsx
books.map((book) => (
  <li
    key={book.ContentID}
    className={`p-3 cursor-pointer hover:bg-gray-100 ... ${
      selectedBookId === book.ContentID 
        ? 'bg-blue-50 dark:bg-blue-900/30' 
        : ''
    }`}
    onClick={() => onSelectBook(book.ContentID, book.BookTitle)}
  >
    <div className="font-medium">{book.BookTitle}</div>
    {book.Author && (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {book.Author}
      </div>
    )}
  </li>
))
```

### Caso 2: Lista Vuota

Quando `books.length === 0`:

```jsx
<li className="p-4 text-center text-gray-500 dark:text-gray-400">
  Nessun libro trovato. Assicurati che il file KoboReader.sqlite sia valido.
</li>
```

## Stili e Classi CSS

### Container Lista (`<ul>`)

```
divide-y               -> Bordo divisore orizzontale tra elementi
divide-gray-200        -> Colore divisore tema chiaro
dark:divide-gray-700   -> Colore divisore tema scuro
```

### Elemento Libro (`<li>`)

#### Classi Base
```
p-3                    -> Padding interno 0.75rem
cursor-pointer         -> Cursor a manina su hover
transition-colors      -> Transizione animata colori
```

#### Stati Interattivi
```
hover:bg-gray-100           -> Sfondo hover tema chiaro
dark:hover:bg-gray-700      -> Sfondo hover tema scuro
```

#### Stato Selezionato
```
bg-blue-50                  -> Sfondo selezione tema chiaro
dark:bg-blue-900/30         -> Sfondo selezione tema scuro (30% opacità)
```

### Titolo Libro

```
font-medium                 -> Font weight medio (500)
```

### Autore (Condizionale)

```
text-sm                     -> Font size piccolo
text-gray-600               -> Colore testo tema chiaro
dark:text-gray-400          -> Colore testo tema scuro
```

## Logica di Selezione

### Comparazione ID

```javascript
selectedBookId === book.ContentID
```

**Tipo**: Confronto strict equality (`===`)

**Nota**: `ContentID` è una stringa, quindi la comparazione è case-sensitive.

### Callback Click

```javascript
onClick={() => onSelectBook(book.ContentID, book.BookTitle)}
```

**Passaggio Parametri**:
- `ContentID`: Per query successive al database
- `BookTitle`: Per visualizzazione nell'header del pannello evidenziazioni

## Flusso di Interazione

```
1. Utente clicca su un libro
   |
2. onClick trigger
   |
3. onSelectBook(ContentID, BookTitle) chiamata
   |
4. App.jsx riceve la callback
   |
5. App.jsx chiama fetchHighlights(ContentID, BookTitle)
   |
6. Query database per evidenziazioni
   |
7. State updates in App.jsx
   |
8. Re-render BookList con nuovo selectedBookId
   |
9. Libro selezionato evidenziato visivamente
```

## Accessibilità

### Problemi Correnti

1. **Mancanza Role**: Gli `<li>` non hanno un `role` appropriato
2. **Keyboard Navigation**: Nessun supporto per navigazione da tastiera
3. **Focus Visibile**: Nessun indicatore focus per tab navigation

### Miglioramenti Suggeriti

```jsx
<li
  role="button"
  tabIndex={0}
  aria-selected={selectedBookId === book.ContentID}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onSelectBook(book.ContentID, book.BookTitle);
    }
  }}
  // ... resto props
>
```

## Performance

### Ottimizzazioni Presenti

1. **Key Prop**: Ogni `<li>` ha una `key` unica (`ContentID`)
   - Permette a React di ottimizzare il rendering
   - Evita re-render non necessari

2. **Rendering Condizionale Autore**: 
   ```javascript
   {book.Author && <div>...</div>}
   ```
   - Evita rendering di div vuoti

### Ottimizzazioni Potenziali

1. **React.memo**: Memoizzare il componente
   ```javascript
   export const BookList = React.memo(({ books, selectedBookId, onSelectBook }) => {
     // ...
   });
   ```

2. **Virtualizzazione**: Per liste molto lunghe (>1000 libri)
   - Librerie: `react-window` o `react-virtual`
   - Attualmente non necessario per la maggior parte dei casi d'uso

## Gestione Stato Vuoto

### Messaggio Informativo

Il messaggio per lista vuota fornisce:
1. **Conferma stato**: "Nessun libro trovato"
2. **Suggerimento azione**: "Assicurati che il file KoboReader.sqlite sia valido"
3. **Stile neutro**: Colori text-gray per non allarmare

### Quando Si Verifica

- Database SQLite vuoto
- Database corrotto
- Query fallita senza fallback
- File non-Kobo caricato per errore

## Integrazione con App.jsx

### Props da App.jsx

```javascript
<BookList
  books={filteredBooks}         // Array filtrato in base a searchTerm
  selectedBookId={selectedBook?.contentId}
  onSelectBook={fetchHighlights}
/>
```

### Flow Dati

```
App.jsx state
    ↓
BookList props
    ↓
Render lista
    ↓
User interaction
    ↓
onSelectBook callback
    ↓
App.jsx fetchHighlights
    ↓
App.jsx state update
    ↓
BookList re-render
```

## Comportamento con Ricerca

Il componente riceve l'array `filteredBooks` già filtrato da `App.jsx`:

```javascript
const filteredBooks = books.filter(book =>
  book.BookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  book.Author?.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**Implicazione**: `BookList` non è responsabile del filtraggio, solo della visualizzazione.

## Esempi di Utilizzo

### Uso Base

```jsx
<BookList
  books={[
    { ContentID: "1", BookTitle: "1984", Author: "George Orwell" },
    { ContentID: "2", BookTitle: "Dune", Author: "Frank Herbert" }
  ]}
  selectedBookId="1"
  onSelectBook={(id, title) => console.log(`Selected: ${title}`)}
/>
```

### Uso con Lista Vuota

```jsx
<BookList
  books={[]}
  selectedBookId={null}
  onSelectBook={() => {}}
/>
```

## Testing Considerations

### Unit Tests Potenziali

1. **Rendering corretto numero elementi**
   ```javascript
   expect(container.querySelectorAll('li')).toHaveLength(books.length);
   ```

2. **Applicazione classe selected**
   ```javascript
   expect(selectedLi).toHaveClass('bg-blue-50');
   ```

3. **Chiamata callback onClick**
   ```javascript
   fireEvent.click(bookLi);
   expect(mockOnSelectBook).toHaveBeenCalledWith('id', 'title');
   ```

4. **Rendering condizionale autore**
   ```javascript
   expect(screen.queryByText('Author Name')).toBeInTheDocument();
   ```

## Limitazioni

1. **Nessuna Paginazione**: Tutte le voci renderizzate simultaneamente
2. **Nessuna Virtualizzazione**: Potenziali problemi con >1000 libri
3. **Nessun Lazy Loading**: Tutte le immagini/dati caricati immediatamente
4. **Sorting Limitato**: Solo alfabetico per titolo (gestito dalla query SQL)

## Note Implementative

### Uso di Optional Chaining

```javascript
{book.Author && <div>...</div>}
```

**Alternativa con Optional Chaining**:
```javascript
{book.Author?. && <div>...</div>}
```

**Scelta Attuale**: Più esplicita e leggibile.

### Classe Condizionale Template String

```javascript
className={`base classes ${condition ? 'class-if-true' : ''}`}
```

**Pro**: Leggibile e compatta
**Contro**: Può lasciare spazi extra se stringa vuota
**Alternativa**: Libreria `classnames` o `clsx`