# Guida Installazione e Configurazione

## Requisiti di Sistema

### Software Necessario

| Software | Versione Minima | Versione Consigliata | Verifica |
|----------|----------------|---------------------|----------|
| Node.js | 18.0.0 | 20.x LTS | `node --version` |
| npm | 8.0.0 | 10.x | `npm --version` |
| Git | 2.x | Latest | `git --version` |

### Sistema Operativo

- Windows 10/11
- macOS 10.15+
- Linux (qualsiasi distribuzione moderna)

### Browser per Testing

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

---

## 1. Installazione Base

### Clone del Repository

```bash
# HTTPS
git clone https://github.com/yourusername/esportatore-note-kobo.git

# SSH (se configurato)
git clone git@github.com:yourusername/esportatore-note-kobo.git

# Entra nella directory
cd esportatore-note-kobo
```

### Installazione Dipendenze

```bash
# Installa tutte le dipendenze
npm install

# Questo installerà:
# - React e React-DOM
# - Vite e plugin
# - Tailwind CSS
# - SQL.js
# - ESLint e plugin
# - Tutte le dipendenze transitive
```

**Tempo Stimato**: 1-3 minuti (dipende dalla connessione)

**Output Atteso**:
```
added 287 packages, and audited 288 packages in 45s

found 0 vulnerabilities
```

---

## 2. Configurazione Ambiente di Sviluppo

### Verifica Installazione

```bash
# Verifica che i binari siano disponibili
npx vite --version
npx eslint --version

# Output atteso:
# vite/6.3.5
# v9.26.0
```

### Configurazione Editor (VS Code)

#### Estensioni Consigliate

Crea `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

#### Settings Editor

Crea `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "tailwindCSS.experimental.classRegex": [
    "className=\"([^\"]*)\""
  ]
}
```

### Configurazione Git

#### File .gitignore

Il progetto include già un `.gitignore`. Verifica contenga:

```
# dependencies
node_modules/

# build
dist/
dist-ssr/

# logs
*.log
npm-debug.log*

# Editor
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
```

#### Git Hooks (Opzionale)

Installa Husky per hook pre-commit:

```bash
npm install --save-dev husky lint-staged
npx husky install
```

Aggiungi in `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

---

## 3. Avvio Applicazione

### Development Mode

```bash
# Avvia dev server con HMR
npm run dev
```

**Output**:
```
  VITE v6.3.5  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Apri browser**: `http://localhost:5173`

### Features Development Server

- **Hot Module Replacement**: Modifiche applicate istantaneamente
- **Fast Refresh**: State React preservato durante hot reload
- **Source Maps**: Debug facile con codice originale
- **Error Overlay**: Errori mostrati direttamente nel browser

### Comandi Utili Durante Sviluppo

```bash
# Linting (controlla errori)
npm run lint

# Build produzione (test)
npm run build

# Preview build produzione
npm run preview
```

---

## 4. Struttura Directory e File Importanti

```
esportatore-note-kobo/
│
├── src/
│   ├── App.jsx                 # Componente root
│   ├── App.css                 # Stili custom
│   ├── BookList.jsx            # Componente lista libri
│   ├── HighlightPreview.jsx    # Componente evidenziazioni
│   ├── main.jsx                # Entry point React
│   └── index.css               # CSS globale + Tailwind
│
├── public/                     # Asset statici (favicon, etc.)
│
├── index.html                  # Template HTML principale
│
├── package.json                # Dipendenze e scripts
├── package-lock.json           # Lock file (committato)
│
├── vite.config.js              # Configurazione Vite
├── tailwind.config.js          # Configurazione Tailwind
├── postcss.config.js           # Configurazione PostCSS
├── eslint.config.js            # Configurazione ESLint
│
├── .gitignore                  # File ignorati da Git
├── README.md                   # Documentazione principale
└── docs/                       # Documentazione estesa
    ├── ARCHITECTURE.md
    ├── COMPONENTS.md
    └── CONTRIBUTING.md
```

---

## 5. Testing del Setup

### Test 1: Verifica UI Base

1. Avvia dev server: `npm run dev`
2. Apri `http://localhost:5173`
3. Verifica:
   - Header con titolo "Esportatore di note Kobo"
   - Pulsante tema (sole/luna)
   - Area drop file con icona
   - Footer "Made with ❤️"

### Test 2: Toggle Tema

1. Clicca pulsante tema
2. Verifica cambio colori immediato
3. Controlla transizione smooth
4. Clicca di nuovo, ritorna al tema originale

### Test 3: Hot Reload

1. Apri `src/App.jsx`
2. Modifica testo header (es. aggiungi "- Test")
3. Salva file
4. Verifica cambio istantaneo nel browser (no refresh)

### Test 4: Caricamento File

1. Trova un file `KoboReader.sqlite` (o scarica esempio)
2. Trascina nell'area drop
3. Verifica:
   - Caricamento SQL.js (può richiedere 1-2 secondi)
   - Apparizione lista libri
   - Nessun errore in console

### Test 5: Linting

```bash
npm run lint
```

**Output Atteso**: Nessun errore o warning

---

## 6. Build Produzione

### Creazione Build

```bash
npm run build
```

**Output**:
```
vite v6.3.5 building for production...
✓ 45 modules transformed.
dist/index.html                   0.52 kB │ gzip:  0.32 kB
dist/assets/index-BmG3Zc7s.css   8.15 kB │ gzip:  2.31 kB
dist/assets/index-DfG4Kl9p.js  152.87 kB │ gzip: 51.24 kB
✓ built in 1.23s
```

### Contenuto Cartella `dist/`

```
dist/
├── index.html                 # HTML minified
└── assets/
    ├── index-[hash].js        # JavaScript bundle
    └── index-[hash].css       # CSS bundle
```

### Preview Build

```bash
npm run preview
```

**URL**: `http://localhost:4173`

### Analisi Bundle Size

Installa analyzer (opzionale):

```bash
npm install --save-dev rollup-plugin-visualizer
```

Modifica `vite.config.js`:

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
})
```

Build e apri report:

```bash
npm run build
# Apre automaticamente stats.html nel browser
```

---

## 7. Troubleshooting Installazione

### Problema: `npm install` Fallisce

**Errore**:
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Soluzione**:
```bash
# Pulisci cache npm
npm cache clean --force

# Elimina node_modules e lock file
rm -rf node_modules package-lock.json

# Reinstalla
npm install
```

### Problema: Dev Server Non Si Avvia

**Errore**:
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Soluzione**:
```bash
# Porta 5173 occupata, usa porta diversa
npm run dev -- --port 3000
```

**Alternativa**: Kill processo sulla porta
```bash
# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Windows
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

### Problema: SQL.js Non Carica

**Sintomo**: Errore "SQL.js non trovato"

**Verifiche**:
1. Connessione internet attiva (CDN)
2. Console browser per errori CORS
3. Timeout adeguato (1000ms)

**Soluzione Offline**:

Installa SQL.js localmente:

```bash
npm install sql.js
```

Modifica caricamento in `App.jsx`:

```javascript
import initSqlJs from 'sql.js';

const SQL = await initSqlJs({
  locateFile: file => `node_modules/sql.js/dist/${file}`
});
```

### Problema: Tailwind Classes Non Funzionano

**Sintomo**: Stili non applicati

**Verifiche**:

1. `@tailwind` direttive in `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. `content` paths in `tailwind.config.js`:
```javascript
content: [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",
],
```

3. Restart dev server:
```bash
# Ctrl+C per fermare
npm run dev
```

### Problema: ESLint Errori Falsi Positivi

**Sintomo**: ESLint segnala errori su codice corretto

**Soluzione**: Aggiorna cache ESLint

```bash
# Elimina cache
rm -rf node_modules/.cache

# Re-lint
npm run lint
```

---

## 8. Workflow di Sviluppo Consigliato

### Step 1: Crea Branch Feature

```bash
# Crea e passa a nuovo branch
git checkout -b feature/nome-feature

# Esempio
git checkout -b feature/add-pdf-export
```

### Step 2: Sviluppa in Dev Mode

```bash
# Avvia dev server
npm run dev

# Sviluppa con HMR attivo
# Salva spesso, controlla browser
```

### Step 3: Testa e Lint

```bash
# Linting
npm run lint

# Build test
npm run build

# Preview
npm run preview
```

### Step 4: Commit Changes

```bash
# Stage file modificati
git add .

# Commit descrittivo
git commit -m "feat: add PDF export functionality"

# Convenzione commit messages:
# feat: nuova feature
# fix: bug fix
# docs: documentazione
# style: formattazione
# refactor: refactoring codice
# test: aggiunta test
# chore: maintenance
```

### Step 5: Push e Pull Request

```bash
# Push branch
git push origin feature/nome-feature

# Apri PR su GitHub
# Descrivi modifiche
# Link issue se presente
```

---

## 9. Debug e Strumenti Utili

### React DevTools

Installa estensione browser:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

**Uso**:
1. Apri DevTools (F12)
2. Tab "Components": Ispeziona albero React
3. Tab "Profiler": Analizza performance rendering

### Console Browser

#### Logging Personalizzato

Aggiungi in `App.jsx`:

```javascript
console.log("Debug: books array", books);
console.log("Debug: selectedBook", selectedBook);
```

#### Network Tab

Monitora richieste CDN:
- SQL.js load time
- WASM file load

### Vite DevTools

Apri browser dev console, noterai:

```
[vite] connecting...
[vite] connected.
[vite] hot updated: /src/App.jsx
```

### Performance Profiling

React DevTools Profiler:

1. Click "Record"
2. Esegui azioni nell'app
3. Click "Stop"
4. Analizza flame graph

---

## 10. Risorse Addizionali

### Documentazione Ufficiale

- [React Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [SQL.js](https://sql.js.org/)

### Community

- [React Discord](https://discord.gg/react)
- [Vite Discord](https://chat.vitejs.dev/)

### Learning Resources

- [React Tutorial](https://react.dev/learn)
- [Modern JavaScript](https://javascript.info/)
- [CSS Tricks - Tailwind](https://css-tricks.com/tag/tailwind/)

---

## 11. Checklist Setup Completo

Prima di iniziare a sviluppare, verifica:

- [ ] Node.js 18+ installato
- [ ] npm 8+ installato
- [ ] Repository clonato
- [ ] `npm install` completato senza errori
- [ ] `npm run dev` avvia server correttamente
- [ ] Browser apre `localhost:5173`
- [ ] UI si visualizza correttamente
- [ ] Toggle tema funziona
- [ ] HMR funziona (test modifica file)
- [ ] `npm run lint` non riporta errori
- [ ] `npm run build` crea cartella `dist/`
- [ ] Editor configurato (VS Code + estensioni)
- [ ] Git configurato correttamente

---

## 12. Next Steps

Dopo il setup:

1. **Esplora Codebase**: Leggi `App.jsx`, `BookList.jsx`, `HighlightPreview.jsx`
2. **Prova con File Reale**: Carica un `KoboReader.sqlite`
3. **Fai Piccole Modifiche**: Cambia colori, testi, layout
4. **Leggi Documentazione Estesa**: Consulta `docs/` per dettagli
5. **Apri Issue**: Report bug o suggerisci feature
6. **Contribuisci**: Apri una Pull Request

---

## Supporto

Per problemi:

1. **Controlla Issues GitHub**: Qualcuno potrebbe aver avuto lo stesso problema
2. **Apri Issue**: Descrivi problema con dettagli (OS, versioni, errori)
3. **Discussioni**: Usa GitHub Discussions per domande generali

Buono sviluppo!