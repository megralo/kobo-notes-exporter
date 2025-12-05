# Esportatore Note Kobo

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?logo=vite)](https://vitejs.dev/)

Applicazione web per esportare e gestire le evidenziazioni e le note dal tuo lettore eBook Kobo.

## Caratteristiche Principali

- **Importazione Database SQLite**: Carica il file `KoboReader.sqlite` direttamente dal tuo dispositivo Kobo
- **Visualizzazione Libri**: Lista completa dei libri con evidenziazioni disponibili
- **Ricerca Avanzata**: Cerca tra i libri e all'interno delle singole evidenziazioni
- **Esportazione Flessibile**: Esporta le note in formato Markdown o l'intera lista libri in JSON/CSV/MD
- **Tema Chiaro/Scuro**: Interfaccia moderna con supporto per modalità chiara e scura
- **Responsive Design**: Ottimizzata per desktop e dispositivi mobili

## Quick Start

```bash
# Clona il repository
git clone https://github.com/tuousername/esportatore-note-kobo.git

# Entra nella directory
cd esportatore-note-kobo

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## Come Utilizzarla

1. **Collega il tuo Kobo** al computer tramite USB
2. **Trova il file** `.kobo/KoboReader.sqlite` (cartella nascosta nella root del dispositivo)
3. **Trascina o seleziona** il file nell'applicazione
4. **Esplora** i tuoi libri e le evidenziazioni
5. **Esporta** le note che ti interessano

## Tecnologie Utilizzate

- **React 19** - Libreria UI
- **Vite 6** - Build tool e dev server
- **Tailwind CSS 4** - Framework CSS utility-first
- **SQL.js** - Database SQLite in-browser
- **PostCSS + Autoprefixer** - Post-processamento CSS

## Struttura del Progetto

```
esportatore-note-kobo/
├── src/
│   ├── App.jsx              # Componente principale
│   ├── BookList.jsx         # Lista dei libri
│   ├── HighlightPreview.jsx # Visualizzazione evidenziazioni
│   ├── App.css              # Stili personalizzati
│   ├── index.css            # Stili globali + Tailwind
│   └── main.jsx             # Entry point
├── public/                  # Asset statici
├── index.html              # Template HTML
├── package.json            # Dipendenze
├── vite.config.js          # Configurazione Vite
├── tailwind.config.js      # Configurazione Tailwind
└── docs/                   # Documentazione dettagliata
```

## Documentazione

Per informazioni dettagliate su architettura, componenti e sviluppo, consulta la [documentazione completa](./docs/).

## Contribuire

I contributi sono benvenuti! Per favore:

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha il branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## Licenza

Questo progetto è distribuito sotto licenza GPL-3.0. Vedi il file `LICENSE` per maggiori dettagli.

## Riconoscimenti

- Database Kobo SQLite parsing ispirato dalla community di lettori Kobo
- Icone e design UI basati su principi di Material Design

## Contatti

Per domande, bug report o suggerimenti, apri una issue su GitHub.

---

Sviluppato con passione per la lettura e la condivisione della conoscenza.