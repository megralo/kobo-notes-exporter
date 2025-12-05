# Componente HighlightPreview.jsx - Documentazione Tecnica

## Panoramica

`HighlightPreview.jsx` è un componente controllato che gestisce la visualizzazione delle evidenziazioni di un libro selezionato. Include funzionalità di ricerca full-text all'interno delle evidenziazioni e permette l'esportazione in formato Markdown.

## Responsabilità

1. Visualizzare le evidenziazioni del libro selezionato
2. Fornire ricerca full-text nelle evidenziazioni
3. Filtrare le evidenziazioni in base al termine di ricerca
4. Gestire l'esportazione delle note
5. Mostrare messaggi informativi quando appropriato

## Props

```javascript
{
  title: string,              // Titolo del libro
  content: string,            // Contenuto evidenziazioni formattato
  onExport: () => void        // Callback per esportazione
}
```

### Dettaglio Props

- **title**: Titolo del libro correntemente visualizzato
  - Mostrato nell'header del componente
  - Default: `'Anteprima note'` se non fornito

- **content**: Stringa contenente tutte le evidenziazioni formattate
  - Formato con separatori `---` tra evidenziazioni
  - Include etichette "Evidenziazione N" e "Note:"
  - `null` quando nessun libro è selezionato

- **onExport**: Funzione callback per esportare le evidenziazioni
  - Gestita da `App.jsx` tramite `exportHighlights()`
  - Genera file Markdown e trigger download

## Stati Locali

```javascript
const [searchHighlight, setSearchHighlight] = useState('');
const [filteredContent, setFilteredContent] = useState(content);
```

### searchHighlight
- Termine di ricerca inserito dall'utente
- Aggiornato in tempo reale durante la digitazione
- Usato per filtrare e evidenziare il contenuto

### filteredContent
- Versione filtrata del contenuto basata su `searchHighlight`
- Aggiornato da `useEffect` quando cambiano `content` o `searchHighlight`
- Quello effettivamente renderizzato nell'interfaccia

## Effetto di Filtraggio

```javascript
useEffect(() => {
  if (!searchHighlight) {
    setFilteredContent(content);
    return;
  }

  if (!content || content === 'Nessuna evidenziazione trovata per questo libro.') {
    setFilteredContent(content);
    return;
  }

  const sections = content.split('---\n\n');
  const matchingSections = sections.filter(section =>
    section.toLowerCase().includes(searchHighlight.toLowerCase())
  );

  if (matchingSections.length > 0) {
    setFilteredContent(matchingSections.join('---\n\n'));
  } else {
    setFilteredContent(`Nessun risultato trovato per "${searchHighlight}"`);
  }
}, [content, searchHighlight]);
```

### Logica di Filtraggio

**Step 1**: Verifica se c'è un termine di ricerca
- Se no: mostra tutto il contenuto

**Step 2**: Verifica se c'è contenuto valido
- Se contenuto è vuoto o è il messaggio "Nessuna evidenziazione": mostra così com'è

**Step 3**: Divide il contenuto in sezioni
- Separatore: `'---\n\n'`
- Ogni sezione = una evidenziazione completa

**Step 4**: Filtra le sezioni
- Case-insensitive: `.toLowerCase()`
- Include: cerca substring nel testo completo

**Step 5**: Ricompone o mostra messaggio
- Se match trovati: ricompone con separatori
- Se nessun match: mostra messaggio "Nessun risultato trovato"

## Struttura JSX

```jsx
<div className="bg-white ... flex flex-col h-full">
  {/* Header */}
  <div className="p-4 bg-gray-100 ... flex justify-between items-center">
    <h2>{title || 'Anteprima note'}</h2>
    
    <div className="flex items-center gap-2">
      {/* Barra di ricerca */}
      <div className="relative">
        <input type="text" ... />
        {searchHighlight ? (
          <button onClick={clearSearch}>✕</button>
        ) : (
          <span>🔍</span>
        )}
      </div>
      
      {/* Pulsante esportazione */}
      {content && content !== 'Nessuna evidenziazione...' && (
        <button onClick={onExport}>Esporta note</button>
      )}
    </div>
  </div>

  {/* Corpo scrollabile */}
  <div className="flex-1 overflow-y-auto p-4">
    {filteredContent ? (
      <pre className="whitespace-pre-wrap ...">
        {filteredContent}
      </pre>
    ) : (
      <div className="text-center ...">
        Seleziona un libro per visualizzare le note
      </div>
    )}
  </div>
</div>
```

## Barra di Ricerca

### Input Field

```jsx
<input
  type="text"
  placeholder="Cerca nelle note..."
  className="py-1 px-3 pr-8 text-sm ..."
  value={searchHighlight}
  onChange={(e) => setSearchHighlight(e.target.value)}
/>
```

**Caratteristiche**:
- Placeholder descrittivo
- Width fissa: `w-36` (9rem / 144px)
- Padding right aumentato per icona: `pr-8`
- Focus ring blu: `focus:ring-2 focus:ring-blue-500`

### Pulsante Cancella / Icona Ricerca

```jsx
{searchHighlight ? (
  <button
    onClick={() => setSearchHighlight('')}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 ..."
    aria-label="Cancella ricerca"
  >
    ✕
  </button>
) : (
  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 ...">
    🔍
  </span>
)}
```

**Comportamento**:
- Mostra `✕` quando c'è testo
- Mostra `🔍` quando input vuoto
- Posizionamento assoluto con centering verticale
- Click su `✕` cancella il termine di ricerca

## Pulsante Esportazione

```jsx
{content && content !== 'Nessuna evidenziazione trovata per questo libro.' && (
  <button
    onClick={onExport}
    className="px-3 py-1 bg-green-500 text-white text-sm rounded ..."
  >
    Esporta note
  </button>
)}
```

### Condizioni di Visibilità

Il pulsante è visibile solo quando:
1. `content` è truthy (non null/undefined/empty)
2. `content` non è il messaggio di lista vuota

**Motivazione**: Evitare esportazione di file vuoti o messaggi di errore.

## Area Contenuto

### Elemento `<pre>`

```jsx
<pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
  {filteredContent}
</pre>
```

**Classi Importanti**:
- `whitespace-pre-wrap`: Preserva spazi e a capo, ma wrappa il testo
- `font-sans`: Font non-monospaced per leggibilità
- `text-gray-800` / `dark:text-gray-200`: Contrasto colori per temi

**Scelta `<pre>` vs `<div>`**:
- `<pre>` preserva la formattazione originale (indentazioni, a capo)
- Importante per separatori `---` e struttura evidenziazioni

### Messaggio Placeholder

```jsx
<div className="text-center text-gray-500 dark:text-gray-400 mt-10">
  Seleziona un libro per visualizzare le note
</div>
```

**Quando Mostrato**:
- `filteredContent` è falsy (null, undefined, empty string)
- Tipicamente all'avvio prima di selezionare un libro

## Layout e Scrolling

### Container Principale

```jsx
<div className="... flex flex-col h-full">
```

**`h-full`**: Occupa tutta l'altezza disponibile dal parent (definita in App.jsx)

### Header Fisso

```jsx
<div className="p-4 bg-gray-100 ...">
```

**Caratteristiche**:
- Altezza contenuto (non espandibile)
- Sfondo distinguibile dalla carta

### Corpo Scrollabile

```jsx
<div className="flex-1 overflow-y-auto p-4">
```

**Classi Chiave**:
- `flex-1`: Prende tutto lo spazio rimanente
- `overflow-y-auto`: Scroll verticale quando necessario
- `p-4`: Padding per separare contenuto dai bordi

## Gestione Casi Speciali

### Caso 1: Nessun Libro Selezionato
```
content = null
→ filteredContent = null
→ Mostra: "Seleziona un libro per visualizzare le note"
```

### Caso 2: Libro Senza Evidenziazioni
```
content = "Nessuna evidenziazione trovata per questo libro."
→ filteredContent = stesso messaggio
→ Nessun pulsante esportazione
```

### Caso 3: Ricerca Senza Risultati
```
content = "[evidenziazioni]"
searchHighlight = "termine non presente"
→ filteredContent = "Nessun risultato trovato per \"termine non presente\""
```

### Caso 4: Ricerca con Risultati
```
content = "Evidenziazione 1\n...\n---\n\nEvidenziazione 2\n..."
searchHighlight = "termine"
→ filteredContent = solo sezioni contenenti "termine"
```

## Stili e Temi

### Tema Chiaro
- Background: `bg-white`
- Testo: `text-gray-800`
- Header: `bg-gray-100`
- Bordi: `border-gray-200`

### Tema Scuro
- Background: `dark:bg-gray-800`
- Testo: `dark:text-gray-200`
- Header: `dark:bg-gray-700`
- Bordi: `dark:border-gray-600`

### Pulsante Verde (Esporta)
- Base: `bg-green-500`
- Hover: `hover:bg-green-600`
- Transizione: `transition-colors`

## Flusso di Interazione

```
1. Utente seleziona libro in BookList
   ↓
2. App.jsx chiama fetchHighlights
   ↓
3. Highlights estratti e formattati
   ↓
4. Props title e content aggiornati
   ↓
5. HighlightPreview re-render con nuovo contenuto
   ↓
6. useEffect aggiorna filteredContent
   ↓
7. Contenuto visibile all'utente
   ↓
8. [Opzionale] Utente digita nella ricerca
   ↓
9. searchHighlight aggiornato
   ↓
10. useEffect ri-filtra il contenuto
   ↓
11. filteredContent aggiornato con risultati filtrati
```

## Performance

### Ottimizzazioni Presenti

1. **Filtraggio con useEffect**: 
   - Evita filtraggio su ogni keystroke nel render
   - Debouncing implicito tramite React state batching

2. **Rendering Condizionale**: 
   - `{content && ...}` previene rendering elementi non necessari

### Ottimizzazioni Potenziali

1. **Debounce Ricerca**: 
   ```javascript
   const debouncedSearchTerm = useDebounce(searchHighlight, 300);
   ```
   - Riduce filtraggio durante digitazione veloce

2. **Memoizzazione Contenuto**:
   ```javascript
   const filteredContent = useMemo(() => {
     // logica filtraggio
   }, [content, searchHighlight]);
   ```
   - Evita ricalcolo se dipendenze non cambiate

3. **Evidenziazione Termine**: Vedere versione alternativa nel file fornito

## Versione Alternativa con Evidenziazione

Nel documento fornito c'è una versione che evidenzia visivamente i termini trovati:

### Funzione highlightSearchTerm

```javascript
const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return text;
  
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    const parts = line.split(regex);
    const highlightedLine = parts.map((part, partIndex) => {
      if (part.toLowerCase() === searchTerm.toLowerCase()) {
        return (
          <span 
            key={partIndex} 
            className="bg-yellow-300 dark:bg-yellow-600 dark:text-gray-900 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
    return <React.Fragment key={lineIndex}>{highlightedLine}...</React.Fragment>;
  });
};
```

**Differenze**:
- Evidenzia visivamente i match con sfondo giallo
- Gestisce regex escape per caratteri speciali
- Preserva formatting multilinea con Fragment

**Uso**:
```jsx
<pre>
  {searchHighlight ? 
    highlightSearchTerm(filteredContent, searchHighlight) : 
    filteredContent
  }
</pre>
```

## Accessibilità

### Implementato
- `aria-label="Cancella ricerca"` sul pulsante X
- Focus ring visibile su input (`focus:ring-2`)
- Placeholder descrittivo

### Da Migliorare
- ARIA live region per annunciare risultati filtro
- Role appropriato per l'area contenuto
- Skip link per saltare direttamente al contenuto

## Testing Considerations

### Test Cases Suggeriti

1. **Rendering Iniziale**: Componente monta con props null
2. **Aggiornamento Contenuto**: Props cambiano da null a content
3. **Filtraggio**: searchHighlight aggiorna filteredContent correttamente
4. **Caso Vuoto**: Ricerca senza risultati mostra messaggio
5. **Clear Search**: Click su X cancella termine ricerca
6. **Export Button**: Visibile solo con contenuto valido
7. **Export Callback**: onClick chiama onExport correttamente

## Integrazione con App.jsx

```javascript
<HighlightPreview
  title={highlightTitle}
  content={highlights}
  onExport={exportHighlights}
/>
```

### Flow Dati

```
App.jsx fetchHighlights
    ↓
setHighlights / setHighlightTitle
    ↓
Props aggiornate
    ↓
HighlightPreview re-render
    ↓
useEffect filtra contenuto
    ↓
Visualizzazione utente
```

## Limitazioni

1. **Nessuna Paginazione**: Tutte le evidenziazioni caricate simultaneamente
2. **Ricerca Base**: Substring matching, non fuzzy search
3. **Nessun Sorting**: Evidenziazioni sempre in ordine cronologico
4. **Export Singolo**: Solo Markdown, nessuna opzione formati multipli