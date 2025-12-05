# Guida Deploy su GitHub Pages

Questa guida spiega come pubblicare l'applicazione **Esportatore Note Kobo** su GitHub Pages, rendendola accessibile pubblicamente tramite URL del tipo `https://username.github.io/kobo-notes-exporter/`.

---

## Indice

1. [Prerequisiti](#prerequisiti)
2. [Configurazione Iniziale](#configurazione-iniziale)
3. [Metodo 1: Deploy Manuale](#metodo-1-deploy-manuale)
4. [Metodo 2: Deploy Automatico con GitHub Actions](#metodo-2-deploy-automatico-con-github-actions)
5. [Configurazione GitHub Pages](#configurazione-github-pages)
6. [Verifica e Testing](#verifica-e-testing)
7. [Aggiornamenti Futuri](#aggiornamenti-futuri)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisiti

Prima di iniziare, assicurati di avere:

- **Repository GitHub** creato e contenente il codice del progetto
- **Node.js** e **npm** installati localmente
- **Git** configurato con accesso al repository
- **Progetto funzionante** in locale (`npm run dev` funziona correttamente)

---

## Configurazione Iniziale

### 1. Configura Base Path in Vite

Modifica il file `vite.config.js` per includere il path base corretto:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kobo-notes-exporter/', // Sostituisci con il nome del tuo repository
})
```

**IMPORTANTE**: Il `base` deve corrispondere esattamente al nome del repository. Se il tuo repository si chiama `my-app`, usa `base: '/my-app/'`.

### 2. Verifica Build Locale

Testa che il build funzioni correttamente:

```bash
npm run build
```

Dovresti vedere un output simile a:

```
vite v6.3.5 building for production...
✓ 45 modules transformed.
dist/index.html                   0.52 kB │ gzip:  0.32 kB
dist/assets/index-BmG3Zc7s.css   8.15 kB │ gzip:  2.31 kB
dist/assets/index-DfG4Kl9p.js  152.87 kB │ gzip: 51.24 kB
✓ built in 1.23s
```

La cartella `dist/` conterrà i file buildati pronti per il deployment.

---

## Metodo 1: Deploy Manuale

Questo metodo è più semplice e diretto, ideale per iniziare.

### Step 1: Installa gh-pages

```bash
npm install --save-dev gh-pages
```

Questo aggiunge `gh-pages` come dipendenza di sviluppo.

### Step 2: Aggiungi Script Deploy

Modifica `package.json` per aggiungere uno script di deploy:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Lo script `deploy` fa due cose:
1. Builda il progetto (`npm run build`)
2. Pusha il contenuto di `dist/` sul branch `gh-pages`

### Step 3: Esegui Deploy

```bash
npm run deploy
```

Output atteso:

```
> kobo-note@0.0.0 deploy
> npm run build && gh-pages -d dist

> kobo-note@0.0.0 build
> vite build

vite v6.3.5 building for production...
✓ built in 1.23s
Published
```

Il comando:
- Crea automaticamente un branch `gh-pages` (se non esiste)
- Copia il contenuto di `dist/` in quel branch
- Pusha il branch su GitHub

### Step 4: Configura GitHub Pages

Vai su GitHub:

1. **Repository** → **Settings** → **Pages**
2. **Source**: Seleziona "Deploy from a branch"
3. **Branch**: Seleziona `gh-pages` e `/ (root)`
4. Clicca **Save**

### Step 5: Verifica Deployment

Dopo 1-2 minuti, visita:
```
https://tuo-username.github.io/kobo-notes-exporter/
```

L'applicazione dovrebbe essere live e funzionante.

---

## Metodo 2: Deploy Automatico con GitHub Actions

Questo metodo automatizza il deploy ad ogni push sul branch `main`. Più professionale e scalabile.

### Step 1: Crea Workflow File

Crea la struttura di cartelle:

```bash
mkdir -p .github/workflows
```

Crea il file `.github/workflows/deploy.yml`:

```yaml
# Workflow per il deployment automatico su GitHub Pages
name: Deploy to GitHub Pages

on:
  # Esegui quando viene fatto push sul branch main
  push:
    branches: ['main']
  
  # Permetti di eseguire manualmente dalla tab Actions
  workflow_dispatch:

# Permessi necessari per GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Previeni deployment concorrenti
concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  # Job di build
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  # Job di deployment
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 2: Committa e Pusha

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: aggiungi workflow GitHub Actions per deployment"
git push origin main
```

### Step 3: Configura GitHub Pages per Actions

Vai su GitHub:

1. **Repository** → **Settings** → **Pages**
2. **Source**: Seleziona "GitHub Actions"
3. Non serve selezionare branch, viene gestito automaticamente

### Step 4: Verifica Workflow

1. Vai su **Actions** nel repository
2. Dovresti vedere il workflow "Deploy to GitHub Pages" in esecuzione
3. Attendi che completi (circa 2-3 minuti)
4. Un segno di spunta verde indica successo

### Step 5: Verifica Deployment

Visita:
```
https://tuo-username.github.io/kobo-notes-exporter/
```

---

## Configurazione GitHub Pages

### Impostazioni Consigliate

#### Deploy from a Branch (Metodo Manuale)

```
Source: Deploy from a branch
Branch: gh-pages
Folder: / (root)
```

#### GitHub Actions (Metodo Automatico)

```
Source: GitHub Actions
```

### Enforce HTTPS

Assicurati che "Enforce HTTPS" sia abilitato (è abilitato di default).

### Custom Domain (Opzionale)

Se hai un dominio personalizzato:

1. Aggiungi il dominio nel campo "Custom domain"
2. Configura DNS del dominio per puntare a GitHub Pages
3. Attendi propagazione DNS (può richiedere 24-48 ore)

---

## Verifica e Testing

### Checklist Post-Deploy

- [ ] URL accessibile e mostra l'applicazione
- [ ] Non ci sono errori nella console browser (F12)
- [ ] Tutti gli asset caricano correttamente (CSS, JS, immagini)
- [ ] Tema chiaro/scuro funziona
- [ ] Upload file SQLite funziona
- [ ] Esportazione note funziona

### Test Completo

1. Apri l'URL in browser incognito
2. Carica un file SQLite di test
3. Verifica che lista libri appaia
4. Seleziona un libro
5. Controlla che evidenziazioni vengano mostrate
6. Testa esportazione in vari formati (JSON, CSV, Markdown)
7. Prova switch tema chiaro/scuro
8. Testa ricerca evidenziazioni

### Browser Testing

Testa su almeno:
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: Chrome mobile, Safari mobile

---

## Aggiornamenti Futuri

### Deploy Manuale

Ogni volta che modifichi il codice:

```bash
# 1. Committa modifiche
git add .
git commit -m "feat: nuova funzionalità"
git push origin main

# 2. Deploy
npm run deploy
```

### Deploy Automatico (GitHub Actions)

Con GitHub Actions, il deploy è automatico:

```bash
# Semplicemente committa e pusha
git add .
git commit -m "feat: nuova funzionalità"
git push origin main

# Il workflow si attiva automaticamente
```

Verifica progresso su **Actions** tab.

### Best Practices

1. **Testa localmente prima**: Usa sempre `npm run dev` e `npm run build` prima di deployare
2. **Linting**: Esegui `npm run lint` per verificare errori
3. **Commit messaggi chiari**: Usa convenzioni commit semantici
4. **Versionamento**: Usa tag Git per versioni major (`v1.0.0`, `v1.1.0`, etc.)

---

## Troubleshooting

### Problema: Pagina Bianca

**Sintomo**: L'URL apre una pagina bianca.

**Cause possibili**:

1. **Base path errato** in `vite.config.js`
   
   **Soluzione**: Verifica che `base: '/nome-repository/'` corrisponda esattamente al nome del repository.

2. **File non caricano** (errore 404)
   
   **Soluzione**: Apri DevTools (F12) → Network, verifica path dei file. Dovrebbero iniziare con `/nome-repository/`.

3. **Branch sbagliato** in GitHub Pages settings
   
   **Soluzione**: Verifica che source sia `gh-pages` (metodo manuale) o "GitHub Actions" (metodo automatico).

### Problema: Errore MIME Type

**Sintomo**: Errore `Il caricamento del modulo da "..." è stato bloccato a causa del tipo MIME non consentito`.

**Causa**: GitHub Pages sta servendo codice sorgente invece di file buildati.

**Soluzione**:
1. Verifica che `base` in `vite.config.js` sia corretto
2. Rebuilda: `npm run build`
3. Rideploya: `npm run deploy` o attendi workflow Actions

### Problema: 404 su Refresh

**Sintomo**: Pagina funziona ma da 404 quando si ricarica su rotte diverse.

**Causa**: GitHub Pages non supporta SPA routing di default.

**Soluzione**: Questa app non usa routing client-side, quindi il problema non dovrebbe presentarsi. Se implementi routing futuro, usa hash routing (`#/path`) o configura `404.html` trick.

### Problema: Modifiche Non Visibili

**Sintomo**: Deploy eseguito ma modifiche non appaiono.

**Soluzioni**:

1. **Svuota cache browser**: 
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Verifica timestamp deploy**: Su GitHub Pages settings, controlla "Last deployed" timestamp

3. **Verifica workflow status**: Su Actions tab, verifica che l'ultimo workflow sia completato con successo

4. **Attendi propagazione**: GitHub Pages può richiedere fino a 10 minuti per aggiornare il sito

### Problema: Build Fallisce su GitHub Actions

**Sintomo**: Workflow Actions fallisce con errore.

**Debug**:

1. Vai su **Actions** → clicca sul workflow fallito
2. Espandi step fallito per vedere errore
3. Verifica che:
   - `package.json` ha tutte le dipendenze
   - `npm run build` funziona localmente
   - Non ci sono errori di linting

**Soluzione comune**: Versioni Node.js incompatibili

Modifica workflow per usare versione Node.js corretta:

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Usa stessa versione del tuo ambiente locale
```

### Problema: Dimensione Repository Troppo Grande

**Sintomo**: Git push fallisce per dimensione.

**Causa**: Branch `gh-pages` accumula storia di tutti i build.

**Soluzione**: Force push per resettare storia

```bash
# ATTENZIONE: Questo cancella la storia del branch gh-pages
git push origin --delete gh-pages
npm run deploy
```

### Problema: Permessi Insufficienti (GitHub Actions)

**Sintomo**: Workflow fallisce con errore permessi.

**Soluzione**: Verifica permessi repository

1. **Settings** → **Actions** → **General**
2. **Workflow permissions**: Seleziona "Read and write permissions"
3. Salva e riprova workflow

---

## Comandi Utili di Riferimento

### Build e Preview Locale

```bash
# Build produzione
npm run build

# Preview build localmente
npm run preview  # Apri http://localhost:4173
```

### Deploy

```bash
# Deploy manuale
npm run deploy

# Deploy manuale con messaggio custom
npx gh-pages -d dist -m "Deploy: versione 1.2.0"
```

### Git Branch Management

```bash
# Vedi tutti i branch (incluso gh-pages)
git branch -a

# Elimina branch gh-pages locale
git branch -D gh-pages

# Elimina branch gh-pages remoto
git push origin --delete gh-pages
```

### Debug

```bash
# Testa build locale
npm run build && npm run preview

# Verifica dimensione bundle
ls -lh dist/assets/

# Linting
npm run lint
```

---

## Risorse Aggiuntive

- [Documentazione GitHub Pages](https://docs.github.com/en/pages)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)
- [gh-pages Package](https://github.com/tschaub/gh-pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## Note Finali

- **Metodo Manuale** è più semplice per progetti piccoli o personali
- **GitHub Actions** è consigliato per progetti con più contributor o che richiedono CI/CD professionale
- Puoi sempre passare da un metodo all'altro modificando le impostazioni GitHub Pages
- Il sito è pubblico di default; per renderlo privato serve GitHub Enterprise

Se hai domande o problemi non coperti da questa guida, apri una issue nel repository.