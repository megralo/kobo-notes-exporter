# Kobo Notes Exporter

Applicazione web per esportare evidenziazioni e note dal database SQLite dei lettori Kobo.

Funziona interamente nel browser: nessun dato viene inviato a server esterni.

## Funzionalità

- **Importazione database** -- Caricamento del file `KoboReader.sqlite` tramite drag & drop o selezione manuale
- **Persistenza locale** -- Il database viene salvato in IndexedDB e può essere ripristinato nelle sessioni successive
- **Navigazione libri** -- Lista dei libri annotati con ricerca e filtro in tempo reale
- **Anteprima evidenziazioni** -- Visualizzazione delle evidenziazioni e delle note per ciascun libro, con ricerca interna e highlight del termine cercato
- **Esportazione** -- Lista libri esportabile in JSON, CSV e Markdown; evidenziazioni esportabili in Markdown
- **Tema chiaro/scuro** -- Con rilevamento automatico della preferenza di sistema
- **Navigazione da tastiera** -- Scorciatoie complete per tutte le operazioni principali
- **Layout responsive** -- Utilizzabile su desktop e dispositivi mobili

## Come si usa

### 1. Ottenere il file database

Collegare il lettore Kobo al computer via USB. Nella root del dispositivo si trova una cartella nascosta `.kobo` contenente il file `KoboReader.sqlite`.

### 2. Avviare l'applicazione

Aprire `index.html` in un browser moderno, oppure servire la cartella con un qualsiasi server statico:

```bash
# Esempio con Python
python3 -m http.server 8000

# Esempio con Node.js (npx)
npx serve .
```

### 3. Caricare il database

Trascinare il file `.sqlite` nella drop zone oppure cliccare per selezionarlo dal filesystem. L'applicazione analizza il database, estrae la lista dei libri annotati e mostra l'interfaccia di consultazione.

### 4. Consultare ed esportare

Selezionare un libro dalla lista per visualizzarne le evidenziazioni. Usare la barra di ricerca per filtrare libri o evidenziazioni. Esportare i dati nei formati disponibili tramite i pulsanti dedicati.

## Scorciatoie da tastiera

| Scorciatoia | Azione |
|---|---|
| `/` | Focus sulla ricerca libri |
| Freccia su / giù | Libro precedente / successivo |
| `Home` / `End` | Primo / ultimo libro |
| `Enter` | Seleziona libro |
| `Escape` | Deseleziona / esci dal campo |
| `Ctrl+F` (`Cmd+F` su Mac) | Focus sulla ricerca evidenziazioni |
| `Ctrl+Shift+D` | Cambia tema |
| `Ctrl+Shift+N` | Nuovo database |
| `Ctrl+Shift+E` | Esporta evidenziazioni |
| `?` | Mostra/nascondi guida scorciatoie |

## Struttura del progetto

```
.
├── index.html    # Struttura HTML dell'applicazione
├── style.css     # Stili con tema chiaro/scuro via CSS custom properties
├── app.js        # Logica applicativa completa (documentata con JSDoc)
└── README.md
```

L'intera applicazione è contenuta in tre file. Non sono necessari bundler, transpiler o dipendenze npm.

## Dipendenze esterne

L'unica dipendenza è [sql.js](https://github.com/sql-js/sql.js) (versione 1.8.0), caricata a runtime da CDN:

- `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js`
- `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`

sql.js è un porting di SQLite in WebAssembly che permette di leggere file `.sqlite` direttamente nel browser.

## Architettura

Il codice JavaScript è racchiuso in una IIFE (Immediately Invoked Function Expression) e organizzato in sezioni:

- **Costanti** -- Query SQL, configurazione IndexedDB, rilevamento piattaforma
- **Stato** -- Variabili che rappresentano lo stato corrente dell'applicazione
- **Riferimenti DOM** -- Cache dei selettori, popolata una volta all'avvio
- **Tema** -- Rilevamento preferenza di sistema, toggle chiaro/scuro
- **IndexedDB** -- Apertura, salvataggio, caricamento e cancellazione del database persistito
- **SQL.js** -- Inizializzazione della libreria, query per libri e evidenziazioni
- **Esportazione** -- Generazione e download di file in vari formati
- **Rendering** -- Costruzione e aggiornamento del DOM per lista libri e anteprima evidenziazioni
- **Modale scorciatoie** -- Generazione dinamica della guida con adattamento alla piattaforma
- **Azioni** -- Selezione libro, reset, caricamento database
- **Importazione file** -- Lettura del file tramite FileReader
- **Navigazione da tastiera** -- Gestione focus e selezione nella lista libri
- **Scorciatoie** -- Listener globale con matching per piattaforma (Cmd/Ctrl)
- **Eventi** -- Binding centralizzato di tutti gli event listener
- **Inizializzazione** -- Punto di ingresso che avvia l'applicazione

## Compatibilità

L'applicazione richiede un browser moderno con supporto per:

- ES2020+ (async/await, optional chaining, nullish coalescing)
- IndexedDB
- WebAssembly
- CSS Custom Properties
- FileReader API
- Drag and Drop API

Testata su versioni recenti di Chrome, Firefox, Safari e Edge.

## Privacy

Tutti i dati vengono elaborati e conservati esclusivamente nel browser dell'utente. Il file del database non viene mai trasmesso a server esterni. La persistenza tra sessioni avviene tramite IndexedDB, eliminabile in qualsiasi momento tramite il pulsante "Nuovo database" o cancellando i dati del sito dal browser.

## Licenza

MIT