# Librerie e Dipendenze - Documentazione Tecnica

## Panoramica

Il progetto utilizza un set minimalista di dipendenze per mantenere il bundle leggero e le performance ottimali. Le dipendenze sono divise tra production e development.

## Dipendenze di Produzione

### React 19.1.0
```json
"react": "^19.1.0",
"react-dom": "^19.1.0"
```

**Descrizione**: Libreria UI per costruire interfacce utente basate su componenti.

**Funzionalità Utilizzate**:
- Hooks: `useState`, `useEffect`, `useRef`
- JSX per dichiarare UI
- Virtual DOM per rendering efficiente
- Strict Mode per identificare problemi potenziali

**Perché React 19**:
- Miglioramenti nelle performance di rendering
- Hooks più stabili e performanti
- Better Server Components support (future-proofing)

**Importazione**:
```javascript
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
```

### SQL.js 1.13.0
```json
"sql.js": "^1.13.0"
```

**Descrizione**: Port JavaScript di SQLite compilato in WebAssembly. Permette di eseguire query SQL direttamente nel browser.

**Funzionalità Utilizzate**:
- Caricamento database da file ArrayBuffer
- Esecuzione query SQL (SELECT, JOIN)
- Iterazione risultati con `step()` e `getAsObject()`

**Caricamento**:
```javascript
// Da CDN nell'HTML
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>

// Inizializzazione in JavaScript
const SQL = await window.initSqlJs({
  locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
});

// Creazione database
const db = new SQL.Database(new Uint8Array(fileBuffer));
```

**Note Implementative**:
- File WASM caricato on-demand
- Database completamente in memoria (no persistenza)
- Performance eccellenti per database <100MB

**Limitazioni**:
- Non thread-safe (single-threaded)
- Richiede ricaricamento file ad ogni sessione
- Supporto browser: tutti quelli con WebAssembly

---

## Dipendenze di Sviluppo

### Build Tools

#### Vite 6.3.5
```json
"vite": "^6.3.5"
```

**Descrizione**: Build tool e dev server di nuova generazione, estremamente veloce.

**Caratteristiche**:
- Hot Module Replacement (HMR) instantaneo
- Build production con Rollup
- Supporto nativo ES modules
- Plugin ecosystem ricco

**Configurazione** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Comandi**:
- `npm run dev`: Avvia dev server su porta 5173
- `npm run build`: Build production in `dist/`
- `npm run preview`: Preview build production

#### @vitejs/plugin-react 4.4.1
```json
"@vitejs/plugin-react": "^4.4.1"
```

**Descrizione**: Plugin ufficiale Vite per React con Fast Refresh.

**Funzionalità**:
- Babel transform per JSX
- Fast Refresh per HMR
- Automatic JSX runtime
- Source maps per debugging

**Dipendenze Incluse**:
- `@babel/core`
- `@babel/plugin-transform-react-jsx-self`
- `@babel/plugin-transform-react-jsx-source`

### CSS Tooling

#### Tailwind CSS 4.1.5
```json
"tailwindcss": "^4.1.5"
```

**Descrizione**: Framework CSS utility-first per design rapido e consistente.

**Configurazione** (`tailwind.config.js`):
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**Features Utilizzate**:
- Utility classes (`flex`, `p-4`, `bg-blue-500`)
- Dark mode con strategia `class`
- Responsive variants (`md:`, `lg:`)
- Hover e focus states

**Caricamento**:
```javascript
// index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Nota**: Versione 4+ usa nuova architettura con Lightning CSS.

#### PostCSS 8.5.3
```json
"postcss": "^8.5.3"
```

**Descrizione**: Tool per trasformare CSS con plugin JavaScript.

**Configurazione** (`postcss.config.js`):
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Plugin Utilizzati**:
- `tailwindcss`: Processa direttive Tailwind
- `autoprefixer`: Aggiunge vendor prefixes

#### Autoprefixer 10.4.21
```json
"autoprefixer": "^10.4.21"
```

**Descrizione**: Plugin PostCSS per aggiungere vendor prefixes CSS automaticamente.

**Funzionamento**:
- Analizza `browserslist` in `package.json`
- Aggiunge prefixes basati su Can I Use database
- Gestisce deprecazione prefixes obsoleti

**Esempio**:
```css
/* Input */
.container {
  display: flex;
}

/* Output */
.container {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
```

### Linting e Quality

#### ESLint 9.26.0
```json
"eslint": "^9.26.0"
```

**Descrizione**: Linter JavaScript per identificare e fixare problemi nel codice.

**Configurazione** (`eslint.config.js`):
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]
```

**Plugin**:
- `eslint-plugin-react-hooks`: Regole per React Hooks
- `eslint-plugin-react-refresh`: Regole per Fast Refresh

**Comandi**:
```bash
npm run lint      # Esegue linting
```

#### @eslint/js 9.26.0
```json
"@eslint/js": "^9.26.0"
```

**Descrizione**: Configurazioni ESLint ufficiali per JavaScript.

#### eslint-plugin-react-hooks 5.2.0
```json
"eslint-plugin-react-hooks": "^5.2.0"
```

**Descrizione**: Plugin ESLint per verificare le regole degli Hooks.

**Regole Chiave**:
- `rules-of-hooks`: Hooks chiamati nell'ordine corretto
- `exhaustive-deps`: Dipendenze useEffect complete

#### eslint-plugin-react-refresh 0.4.20
```json
"eslint-plugin-react-refresh": "^0.4.19"
```

**Descrizione**: Plugin per garantire compatibilità con Fast Refresh.

**Regola**:
- `only-export-components`: Solo componenti esportati per preservare state durante HMR

### Utilities

#### globals 16.0.0
```json
"globals": "^16.0.0"
```

**Descrizione**: Lista delle variabili globali per diversi ambienti JavaScript.

**Utilizzo**: Configurazione ESLint per riconoscere `window`, `document`, etc.

### Type Definitions

#### @types/react 19.1.3
#### @types/react-dom 19.1.3
```json
"@types/react": "^19.1.2",
"@types/react-dom": "^19.1.2"
```

**Descrizione**: Type definitions TypeScript per React (anche se non usiamo TypeScript).

**Perché Incluse**: 
- Migliorano autocomplete in IDE
- Documentazione inline per API React
- Dipendenze di altri package

---

## Dipendenze di Sistema

### Node.js
**Versione Richiesta**: >=18.0.0

**Verifica**:
```bash
node --version
```

### npm
**Versione Richiesta**: >=8.0.0

**Verifica**:
```bash
npm --version
```

---

## CDN Dependencies

### Tailwind CSS
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Nota**: Caricato anche da CDN per configurazione immediata. In produzione, usa versione compilata da npm.

### SQL.js
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
```

**File Correlati**:
- `sql-wasm.js`: Loader principale
- `sql-wasm.wasm`: Binary WebAssembly (caricato dinamicamente)

---

## Compatibilità Browser

### Requisiti Minimi

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| ES6+ | 51+ | 54+ | 10+ | 15+ |
| WebAssembly | 57+ | 52+ | 11+ | 16+ |
| ES Modules | 61+ | 60+ | 11+ | 16+ |
| CSS Grid | 57+ | 52+ | 10.1+ | 16+ |
| Flexbox | 29+ | 28+ | 9+ | 12+ |

**Browser Supportati Effettivamente**:
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Nessun supporto IE11

### Polyfills

**Non Necessari**: 
- Vite transpila automaticamente per target moderni
- WebAssembly è requisito hard (no polyfill disponibile)

---

## Gestione Versioni

### Semantic Versioning

Il progetto usa `^` per versioni minori:
```json
"react": "^19.1.0"
```

**Significato**: 
- `^19.1.0` = `>=19.1.0 <20.0.0`
- Accetta patch e minor updates
- Blocca major breaking changes

### Lock File

`package-lock.json` committato nel repository:
- Garantisce build riproducibili
- Stesso tree di dipendenze per tutti
- Versioni esatte per tutte le dipendenze transitive

### Update Strategy

```bash
# Verifica updates disponibili
npm outdated

# Update patch versions
npm update

# Update a versione specifica
npm install react@19.1.0

# Update major (con attenzione)
npm install react@latest
```

---

## Bundle Size

### Analisi Production Build

```bash
npm run build
```

**Output Tipico**:
```
dist/assets/index-[hash].js    ~150kb (gzipped: ~50kb)
dist/assets/index-[hash].css   ~8kb (gzipped: ~2kb)
sql-wasm.wasm                  ~800kb (non compresso)
```

**Breakdown**:
- React + React-DOM: ~45kb
- Applicazione: ~5kb
- SQL.js wrapper: ~100kb
- SQL.js WASM: ~800kb (caricato separatamente)

### Ottimizzazioni Vite

- Tree-shaking automatico
- Code splitting
- Minification (terser)
- CSS purge via Tailwind
- Asset optimization

---

## Troubleshooting Comune

### SQL.js Non Carica

**Sintomo**: Errore "SQL.js non trovato"

**Soluzione**:
1. Verifica connessione internet (CDN)
2. Controlla console per errori CORS
3. Aumenta timeout in `sqlPromise` (attualmente 1000ms)

### Build Fallisce

**Sintomo**: `npm run build` errore

**Soluzioni**:
1. Pulisci cache: `rm -rf node_modules package-lock.json && npm install`
2. Verifica versione Node: `node --version` (deve essere >=18)
3. Controlla errori ESLint: `npm run lint`

### Tailwind Classes Non Applicate

**Sintomo**: Stili non visibili

**Soluzioni**:
1. Verifica `tailwind.config.js` include path corretti
2. Assicurati `@tailwind` direttive in `index.css`
3. Restart dev server dopo modifiche config