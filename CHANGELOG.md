# Changelog

Tutte le modifiche rilevanti a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

### Pianificato
- Supporto per salvataggio in localStorage per evitare ricaricamenti
- Editing inline delle evidenziazioni
- Esportazione in formato PDF
- Integrazione con servizi cloud (Readwise, Notion, Obsidian)
- Statistiche di lettura con grafici
- Sistema di tag e categorie personalizzabili
- Ricerca avanzata con supporto regex
- Modalità offline con Service Worker

---

## [1.0.0] - 2025-12-03

### Rilascio Iniziale Stabile

Prima versione pubblica del progetto con tutte le funzionalità core implementate e testate.

### Added

#### Funzionalità Core
- **Importazione Database SQLite**: Caricamento file `KoboReader.sqlite` tramite drag & drop o selezione file
- **Parsing Database Kobo**: Estrazione automatica di libri ed evidenziazioni dal database SQLite
- **Visualizzazione Libri**: Lista scrollabile di tutti i libri con evidenziazioni disponibili
- **Visualizzazione Evidenziazioni**: Pannello dettagliato per mostrare tutte le note di un libro selezionato
- **Ricerca Libri**: Ricerca full-text in tempo reale su titoli e autori
- **Ricerca Evidenziazioni**: Filtro testuale all'interno delle note di un singolo libro
- **Esportazione Note**: Download evidenziazioni in formato Markdown con nome file sanitizzato
- **Esportazione Lista Libri**: Export completo in tre formati (JSON, CSV, Markdown)

#### Interfaccia Utente
- **Tema Chiaro/Scuro**: Toggle tra modalità chiara e scura con rilevamento automatico preferenze sistema
- **Layout Responsive**: Design a due colonne ottimizzato per desktop, tablet e mobile
- **Feedback Visivi**: Stati hover, focus e selezione per tutti gli elementi interattivi
- **Gestione Errori**: Messaggi di errore user-friendly con suggerimenti per la risoluzione
- **Altezze Fisse**: Scroll indipendente per lista libri e area evidenziazioni

#### Componenti
- `App.jsx`: Componente root con gestione stato globale e logica business
- `BookList.jsx`: Componente presentazionale per visualizzazione lista libri
- `HighlightPreview.jsx`: Componente controllato per evidenziazioni con ricerca integrata

#### Styling
- Integrazione completa Tailwind CSS 4.1.5 con utility-first approach
- CSS personalizzato con variabili per temi
- Transizioni smooth per cambio tema
- Dark mode con strategia basata su classe
- Design system consistente con palette colori definita

#### Configurazione Build
- Vite 6.3.5 come build tool con HMR ultra-veloce
- ESLint 9.26.0 con regole React Hooks e React Refresh
- PostCSS con Autoprefixer per compatibilità cross-browser
- Tailwind configurato con purging automatico per production

#### Dipendenze
- React 19.1.0 con supporto hooks moderni
- SQL.js 1.13.0 per parsing SQLite in-browser via WebAssembly
- Caricamento SQL.js da CDN per ottimizzazione bundle size

#### Documentazione
- README.md completo con quick start e feature list
- Documentazione tecnica dettagliata per ogni componente
- Guida installazione e configurazione ambiente sviluppo
- Documentazione architettura CSS e pattern styling
- Diagrammi di flusso per tutti i processi applicativi
- Analisi dipendenze e compatibilità browser
- Best practices e troubleshooting comune

### Technical Details

#### Database Schema Supportato
- Tabella `content`: Metadati libri (ContentID, Title, Attribution, ContentType)
- Tabella `bookmark`: Evidenziazioni (Text, Annotation, VolumeID, DateCreated)
- Query ottimizzate con INNER JOIN e DISTINCT
- Fallback query per gestione edge cases

#### Performance
- Database caricato completamente in memoria per query veloci
- Filtraggio client-side per ricerche istantanee
- Tree-shaking Tailwind CSS: da ~3MB dev a ~8KB production
- Bundle JavaScript: ~150KB (gzipped: ~50KB)
- Rendering ottimizzato con React hooks

#### Browser Support
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Requisito WebAssembly (nessun polyfill disponibile)

#### Privacy & Security
- Elaborazione 100% client-side, nessun dato inviato a server
- Nessun tracking o analytics
- Database non persistito (ricaricamento necessario per ogni sessione)
- Nessun uso di localStorage o cookies

### Known Limitations

- File SQLite molto grandi (>50MB) possono rallentare il browser
- Database deve essere ricaricato ad ogni sessione
- Supporto limitato a database Kobo (altri ereader non compatibili)
- Solo visualizzazione, nessuna modifica delle evidenziazioni
- Export limitato a Markdown per note singole
- Ricerca testuale base (substring matching, no fuzzy search)

### Development

- Repository inizializzato con Git
- Configurazione VS Code con estensioni consigliate
- Git hooks opzionali con Husky
- Scripts npm: `dev`, `build`, `preview`, `lint`
- Struttura progetto modulare e manutenibile

---

## Guida Versioning

Il progetto segue [Semantic Versioning](https://semver.org/lang/it/):

- **MAJOR** (X.0.0): Modifiche incompatibili con versioni precedenti
- **MINOR** (x.X.0): Nuove funzionalità retrocompatibili
- **PATCH** (x.x.X): Bug fix retrocompatibili

### Tipi di Modifiche

- **Added**: Nuove funzionalità
- **Changed**: Modifiche a funzionalità esistenti
- **Deprecated**: Funzionalità deprecate ma ancora disponibili
- **Removed**: Funzionalità rimosse
- **Fixed**: Bug fix
- **Security**: Fix di vulnerabilità di sicurezza

---

## Template per Nuove Release

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- Nuova funzionalità descritta in dettaglio
- Altra funzionalità con spiegazione

### Changed
- Modifica comportamento esistente
- Aggiornamento dipendenza

### Deprecated
- Funzionalità che sarà rimossa in futuro

### Removed
- Funzionalità eliminata
- API deprecata rimossa

### Fixed
- Bug risolto con descrizione
- Altro fix

### Security
- Vulnerabilità risolta
- Aggiornamento sicurezza
```

---

## Link Riferimenti

- [1.0.0]: https://github.com/tuousername/esportatore-note-kobo/releases/tag/v1.0.0
- [Unreleased]: https://github.com/tuousername/esportatore-note-kobo/compare/v1.0.0...HEAD

---

**Nota**: Aggiorna questo file ad ogni release seguendo il formato standardizzato. Per contribuire, consulta [CONTRIBUTING.md](./CONTRIBUTING.md).