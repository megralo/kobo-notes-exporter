# Esportatore Note Kobo - Introduzione

## Panoramica del Progetto

L'Esportatore Note Kobo è un'applicazione web single-page sviluppata in React che permette agli utenti di estrarre, visualizzare ed esportare le evidenziazioni e le note dai loro lettori eBook Kobo.

## Problema Risolto

I lettori eBook Kobo memorizzano tutte le evidenziazioni e le note in un database SQLite locale (`KoboReader.sqlite`). Tuttavia, non esiste un modo semplice e intuitivo per:

- Visualizzare tutte le evidenziazioni in un'unica interfaccia
- Cercare tra le proprie note
- Esportare le evidenziazioni in formati leggibili e portabili
- Gestire le note senza dipendere dal dispositivo Kobo

Questa applicazione risolve questi problemi offrendo un'interfaccia web moderna e user-friendly.

## Funzionalità Principali

### 1. Importazione Database
- Supporto per drag & drop del file SQLite
- Selezione file tramite dialog nativo del browser
- Parsing completo del database Kobo
- Gestione errori robusta con feedback all'utente

### 2. Gestione Libri
- Lista completa dei libri con evidenziazioni
- Visualizzazione autore e titolo
- Ricerca full-text tra i libri
- Contatore libri totali
- Esportazione lista libri in multipli formati (JSON, CSV, Markdown)

### 3. Visualizzazione Evidenziazioni
- Vista dettagliata delle evidenziazioni per libro
- Ricerca all'interno delle note di un singolo libro
- Visualizzazione note associate alle evidenziazioni
- Separazione chiara tra evidenziazioni multiple
- Esportazione note in formato Markdown

### 4. Interfaccia Utente
- Design responsive per desktop e mobile
- Tema chiaro/scuro con persistenza della preferenza utente
- Layout a due colonne: libri a sinistra, note a destra
- Altezze fisse per evitare problemi di overflow
- Feedback visivi per interazioni (hover, selezione, focus)

### 5. Ricerca e Filtraggio
- Ricerca real-time tra i titoli dei libri e autori
- Ricerca full-text all'interno delle evidenziazioni
- Filtraggio istantaneo senza necessità di premere "Invio"
- Pulsanti di cancellazione per reset rapido

## Architettura Tecnologica

### Frontend Stack
- **React 19**: Libreria UI con nuove features (gestione hooks migliorata)
- **Vite 6**: Build tool ultra-veloce per sviluppo e produzione
- **Tailwind CSS 4**: Framework CSS utility-first per styling rapido
- **SQL.js**: Implementazione JavaScript di SQLite per browser

### Gestione dello Stato
- React Hooks (`useState`, `useEffect`, `useRef`)
- Stato locale per ogni componente
- Nessuna libreria di state management globale (props drilling limitato)

### Gestione Database
- SQL.js caricato da CDN (cloudflare)
- Database caricato in memoria nel browser
- Query SQL dirette per estrarre dati
- Nessun backend necessario (applicazione 100% client-side)

## Flusso Applicativo di Alto Livello

```
1. Utente apre l'applicazione
   └─> Viene mostrata l'area di drop per il file SQLite

2. Utente carica il file KoboReader.sqlite
   └─> SQL.js inizializza il database in memoria
       └─> Query per estrarre lista libri
           └─> Rendering della lista libri nella sidebar

3. Utente seleziona un libro
   └─> Query per estrarre evidenziazioni del libro selezionato
       └─> Rendering delle evidenziazioni nel pannello destro

4. Utente cerca tra i libri o le evidenziazioni
   └─> Filtraggio real-time dei risultati

5. Utente esporta dati
   └─> Generazione file (JSON/CSV/Markdown)
       └─> Download automatico nel browser
```

## Principi di Design

### 1. Semplicità d'Uso
- Interfaccia intuitiva senza necessità di tutorial
- Feedback visivi chiari per ogni azione
- Gestione errori user-friendly

### 2. Performance
- Caricamento lazy dei componenti
- Virtualizzazione non necessaria (liste non infinite)
- Ottimizzazione re-rendering con React hooks

### 3. Accessibilità
- Supporto navigazione da tastiera
- ARIA labels dove necessario
- Contrasti colore conformi WCAG 2.1

### 4. Manutenibilità
- Codice modulare con componenti riutilizzabili
- Separazione concerns (UI, logica, stili)
- Commenti e documentazione estesi

### 5. Privacy
- Nessun dato inviato a server esterni
- Elaborazione 100% client-side
- Nessun tracking o analytics

## Limitazioni Note

1. **Dimensione File**: File SQLite molto grandi (>50MB) potrebbero rallentare il browser
2. **Browser Supportati**: Richiede browser moderni con supporto ES6+ e WebAssembly
3. **Persistenza**: I dati non vengono salvati localmente, è necessario ricaricare il file ad ogni sessione
4. **Editing**: Non è possibile modificare le evidenziazioni, solo visualizzarle ed esportarle

## Prossimi Sviluppi Potenziali

- Salvataggio in localStorage per evitare ricaricamenti
- Supporto per annotazioni personalizzate
- Sincronizzazione con servizi cloud (Readwise, Notion, etc.)
- Statistiche di lettura
- Visualizzazione grafica della frequenza di evidenziazioni
- Esportazione in più formati (PDF, EPUB con annotazioni)

## Pubblico Target

- **Lettori appassionati**: Chi vuole tenere traccia delle proprie letture
- **Studenti**: Per organizzare note e citazioni da libri di testo
- **Ricercatori**: Per gestire evidenziazioni da bibliografia
- **Content creator**: Per estrarre citazioni da libri per articoli o video

## Vantaggi Competitivi

Rispetto ad altre soluzioni (Calibre, plugin vari):

1. **Nessuna installazione**: Funziona direttamente nel browser
2. **Cross-platform**: Windows, Mac, Linux, anche mobile
3. **Interfaccia moderna**: UI contemporanea e gradevole
4. **Open source**: Codice completamente ispezionabile e modificabile
5. **Privacy-first**: Nessun dato lascia il dispositivo dell'utente