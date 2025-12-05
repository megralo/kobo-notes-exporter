# Guida al Contributo

Grazie per il tuo interesse nel contribuire al progetto Esportatore Note Kobo! Apprezziamo molto il tuo supporto e vogliamo rendere il processo di contribuzione il più semplice e trasparente possibile.

## Sommario

- [Codice di Condotta](#codice-di-condotta)
- [Come Posso Contribuire?](#come-posso-contribuire)
- [Setup Ambiente di Sviluppo](#setup-ambiente-di-sviluppo)
- [Workflow di Sviluppo](#workflow-di-sviluppo)
- [Standard di Codice](#standard-di-codice)
- [Convenzioni Commit](#convenzioni-commit)
- [Pull Request Process](#pull-request-process)
- [Segnalazione Bug](#segnalazione-bug)
- [Richiesta Funzionalità](#richiesta-funzionalità)
- [Domande Frequenti](#domande-frequenti)

---

## Codice di Condotta

Questo progetto aderisce a un Codice di Condotta. Partecipando, ti impegni a rispettare questi principi. Per maggiori dettagli, consulta [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## Come Posso Contribuire?

Ci sono molti modi per contribuire al progetto:

### 1. Segnalazione Bug

Hai trovato un bug? Aiutaci a migliorare il progetto segnalandolo:

- Verifica che il bug non sia già stato segnalato nelle [Issues](https://github.com/tuousername/esportatore-note-kobo/issues)
- Se non esiste, apri una nuova issue usando il template "Bug Report"
- Fornisci quante più informazioni possibili (vedi [Segnalazione Bug](#segnalazione-bug))

### 2. Suggerimento Nuove Funzionalità

Hai un'idea per migliorare l'applicazione?

- Controlla se la funzionalità è già stata proposta nelle Issues
- Apri una nuova issue usando il template "Feature Request"
- Spiega dettagliatamente il caso d'uso e i benefici

### 3. Contributi al Codice

Vuoi implementare una feature o fixare un bug?

- Segui il [Workflow di Sviluppo](#workflow-di-sviluppo)
- Rispetta gli [Standard di Codice](#standard-di-codice)
- Apri una Pull Request con la tua implementazione

### 4. Miglioramento Documentazione

La documentazione può sempre essere migliorata:

- Correzione typo o errori
- Aggiunta esempi o chiarimenti
- Traduzione in altre lingue (future)
- Tutorial o guide aggiuntive

### 5. Revisione Codice

Aiuta a revieware Pull Request aperte:

- Testa le modifiche localmente
- Fornisci feedback costruttivo
- Segnala potenziali problemi

---

## Setup Ambiente di Sviluppo

### Prerequisiti

- **Node.js**: versione 18.0.0 o superiore
- **npm**: versione 8.0.0 o superiore
- **Git**: versione 2.x
- **Editor**: VS Code consigliato (con estensioni suggerite)

### Installazione

```bash
# 1. Fai un fork del repository su GitHub

# 2. Clona il tuo fork
git clone https://github.com/tuo-username/esportatore-note-kobo.git
cd esportatore-note-kobo

# 3. Aggiungi il repository originale come remote
git remote add upstream https://github.com/repository-originale/esportatore-note-kobo.git

# 4. Installa le dipendenze
npm install

# 5. Verifica che tutto funzioni
npm run dev
```

### Configurazione Editor (VS Code)

Installa le estensioni consigliate:

- ESLint (`dbaeumer.vscode-eslint`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- ES7+ React/Redux snippets (`dsznajder.es7-react-js-snippets`)

Le configurazioni sono già incluse in `.vscode/settings.json`.

### Verifica Setup

```bash
# Linting
npm run lint

# Build
npm run build

# Preview build
npm run preview
```

Se tutti i comandi completano senza errori, il setup è corretto.

---

## Workflow di Sviluppo

### 1. Sincronizza Fork

Prima di iniziare a lavorare, sincronizza il tuo fork:

```bash
# Fetch modifiche da upstream
git fetch upstream

# Merge modifiche nel tuo main
git checkout main
git merge upstream/main

# Push al tuo fork
git push origin main
```

### 2. Crea Branch Feature

Crea sempre un nuovo branch per le tue modifiche:

```bash
# Branch per nuova feature
git checkout -b feature/nome-feature

# Branch per bug fix
git checkout -b fix/nome-bug

# Branch per documentazione
git checkout -b docs/argomento
```

**Convenzione nomi branch**:
- `feature/` - Nuove funzionalità
- `fix/` - Bug fix
- `docs/` - Modifiche documentazione
- `refactor/` - Refactoring codice
- `style/` - Modifiche stile/formattazione
- `test/` - Aggiunta o modifica test
- `chore/` - Manutenzione, aggiornamento dipendenze

### 3. Sviluppa

Sviluppa la tua feature/fix:

```bash
# Avvia dev server
npm run dev

# Sviluppa con hot reload
# Salva spesso, controlla browser e console
```

### 4. Testa le Modifiche

Prima di committare:

```bash
# Linting
npm run lint

# Fix automatico problemi linting
npm run lint -- --fix

# Build produzione (test)
npm run build

# Test manuale: carica un file SQLite reale
```

### 5. Commit

Committa seguendo le [Convenzioni Commit](#convenzioni-commit):

```bash
# Stage modifiche
git add .

# Commit con messaggio descrittivo
git commit -m "feat: aggiungi esportazione PDF"

# Se sono modifiche multiple correlate, dividi in commit separati
git add src/App.jsx
git commit -m "feat: aggiungi logica esportazione PDF"

git add src/PdfExport.jsx
git commit -m "feat: crea componente PdfExport"
```

### 6. Push

Pusha il tuo branch al fork:

```bash
git push origin feature/nome-feature
```

### 7. Apri Pull Request

- Vai al repository originale su GitHub
- Clicca "New Pull Request"
- Seleziona il tuo fork e branch
- Compila il template PR (vedi [Pull Request Process](#pull-request-process))

---

## Standard di Codice

### JavaScript/React

#### Style Guide

Seguiamo le best practice React e le regole ESLint configurate:

```javascript
// ✓ GOOD
const BookList = ({ books, onSelectBook }) => {
  return (
    <ul>
      {books.map(book => (
        <li key={book.id} onClick={() => onSelectBook(book.id)}>
          {book.title}
        </li>
      ))}
    </ul>
  );
};

// ✗ BAD
function BookList(props) {
  return (
    <ul>
      {props.books.map((book, index) => (  // Non usare index come key
        <li onClick={() => props.onSelectBook(book.id)}>
          {book.title}
        </li>
      ))}
    </ul>
  );
}
```

#### Naming Conventions

- **Componenti**: PascalCase (`BookList`, `HighlightPreview`)
- **Funzioni**: camelCase (`fetchBooks`, `handleClick`)
- **Costanti**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `API_ENDPOINT`)
- **File componenti**: PascalCase.jsx (`BookList.jsx`)
- **File utility**: camelCase.js (`utils.js`, `helpers.js`)

#### Hooks Rules

Rispetta le regole degli Hooks:

```javascript
// ✓ GOOD
const MyComponent = () => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Effect con dipendenze corrette
  }, [count]);
  
  return <div>{count}</div>;
};

// ✗ BAD
const MyComponent = () => {
  if (condition) {
    const [count, setCount] = useState(0);  // Hook condizionale
  }
  
  useEffect(() => {
    // Dipendenze mancanti
  }, []);  // ESLint warning
};
```

#### Props Destructuring

Preferisci destructuring delle props:

```javascript
// ✓ GOOD
const Component = ({ title, items, onAction }) => {
  return <div>{title}</div>;
};

// ✗ BAD
const Component = (props) => {
  return <div>{props.title}</div>;
};
```

### CSS/Tailwind

#### Utility-First

Preferisci utility classes Tailwind:

```jsx
// ✓ GOOD
<div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">

// ✗ BAD
<div style={{ display: 'flex', padding: '1rem', background: '#fff' }}>
```

#### Responsive Design

Usa approccio mobile-first:

```jsx
// ✓ GOOD - mobile first
<div className="w-full md:w-1/2 lg:w-1/3">

// ✗ BAD - desktop first
<div className="w-1/3 lg:w-1/2 md:w-full">
```

#### Dark Mode

Usa variante `dark:`:

```jsx
// ✓ GOOD
<div className="text-gray-900 dark:text-gray-100">

// ✗ BAD - gestione manuale
<div className={isDark ? "text-gray-100" : "text-gray-900"}>
```

### Commenti

#### Quando Commentare

Commenta quando:
- Logica complessa non ovvia
- Workaround temporanei
- Decisioni architetturali importanti
- API esterne o formati specifici

```javascript
// ✓ GOOD
// Query fallback usata quando INNER JOIN fallisce (database corrotti)
const fallbackQuery = "SELECT * FROM content WHERE ContentType = 6";

// ✗ BAD
// Incrementa counter
count++;  // Ovvio dal codice stesso
```

#### Formato Commenti

```javascript
// Commento singola linea per spiegazioni brevi

/**
 * Descrizione funzione più complessa
 * 
 * @param {string} contentId - ID del libro
 * @param {string} bookTitle - Titolo del libro
 * @returns {Promise<void>}
 */
const fetchHighlights = async (contentId, bookTitle) => {
  // ...
};
```

### File Structure

```javascript
// 1. Imports React
import React, { useState, useEffect } from 'react';

// 2. Imports terze parti
import SomeLibrary from 'some-library';

// 3. Imports componenti locali
import BookList from './BookList';
import HighlightPreview from './HighlightPreview';

// 4. Imports stili
import './App.css';

// 5. Costanti
const MAX_BOOKS = 1000;

// 6. Componente
export const App = () => {
  // Stati
  const [data, setData] = useState(null);
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

---

## Convenzioni Commit

Usiamo [Conventional Commits](https://www.conventionalcommits.org/it/) per messaggi chiari e consistenti.

### Formato

```
<tipo>[scope opzionale]: <descrizione>

[corpo opzionale]

[footer opzionale]
```

### Tipi

- **feat**: Nuova funzionalità
- **fix**: Bug fix
- **docs**: Modifiche documentazione
- **style**: Formattazione, punto e virgola mancanti, etc (no modifiche codice)
- **refactor**: Refactoring codice (no fix, no features)
- **perf**: Miglioramenti performance
- **test**: Aggiunta o correzione test
- **chore**: Manutenzione, aggiornamento dipendenze, build, etc

### Esempi

```bash
# Feature
feat: aggiungi esportazione PDF per evidenziazioni
feat(export): supporta esportazione multipla in batch

# Fix
fix: correggi crash quando database è vuoto
fix(search): ripristina ricerca case-insensitive

# Docs
docs: aggiorna guida installazione con Node 20
docs(readme): aggiungi badge build status

# Refactor
refactor: estrai logica SQL in modulo separato
refactor(components): semplifica gestione stato in BookList

# Breaking change
feat!: cambia formato export JSON

feat: modifica struttura API export

BREAKING CHANGE: Il formato export JSON ora include metadata aggiuntivo.
Aggiorna codice che consuma i file esportati.
```

### Best Practices

- Usa imperativo: "add" non "added" o "adds"
- Nessuna maiuscola iniziale
- Nessun punto finale
- Limita prima linea a 72 caratteri
- Corpo del commit per spiegazioni dettagliate
- Referenzia issue con `#numero` nel footer

---

## Pull Request Process

### Prima di Aprire PR

Checklist:

- [ ] Codice compila senza errori (`npm run build`)
- [ ] Linting passa (`npm run lint`)
- [ ] Testato manualmente con file SQLite reale
- [ ] Commit seguono convenzioni
- [ ] Branch aggiornato con main upstream
- [ ] Documentazione aggiornata se necessario

### Template Pull Request

Compila tutte le sezioni del template:

```markdown
## Descrizione

Descrizione chiara e concisa delle modifiche apportate.

## Motivazione e Contesto

Perché questa modifica è necessaria? Che problema risolve?

## Tipo di Modifica

- [ ] Bug fix (non-breaking change che risolve un issue)
- [ ] Nuova feature (non-breaking change che aggiunge funzionalità)
- [ ] Breaking change (fix o feature che causa malfunzionamento feature esistenti)
- [ ] Documentazione

## Testing

Descrivi i test eseguiti per verificare le modifiche:
- [ ] Test manuale con file SQLite di esempio
- [ ] Test su browser multipli (Chrome, Firefox, Safari)
- [ ] Test responsive su mobile
- [ ] Test tema chiaro e scuro

## Screenshots

Se applicabile, aggiungi screenshot per mostrare le modifiche UI.

## Checklist

- [ ] Codice segue style guide del progetto
- [ ] Eseguito self-review del codice
- [ ] Commentato codice complesso
- [ ] Documentazione aggiornata
- [ ] Nessun warning generato
- [ ] Build produzione funziona

## Issue Correlate

Closes #123
Related to #456
```

### Processo Review

1. **Apertura PR**: Maintainer riceve notifica
2. **Review Automatica**: CI checks (linting, build)
3. **Code Review**: Maintainer o contributor reviewano
4. **Feedback**: Richieste di modifiche se necessarie
5. **Approvazione**: PR approvata quando pronta
6. **Merge**: Maintainer fa merge nel branch main

### Rispondere a Review

```bash
# Fai modifiche richieste
git add .
git commit -m "fix: applica feedback code review"
git push origin feature/nome-feature

# PR si aggiorna automaticamente
```

### Dopo il Merge

```bash
# Sincronizza fork
git checkout main
git pull upstream main
git push origin main

# Elimina branch locale
git branch -d feature/nome-feature

# Elimina branch remoto (opzionale)
git push origin --delete feature/nome-feature
```

---

## Segnalazione Bug

### Prima di Segnalare

- Cerca nelle [Issues esistenti](https://github.com/tuousername/esportatore-note-kobo/issues)
- Verifica di usare l'ultima versione
- Testa su browser diversi se possibile

### Informazioni da Includere

Template "Bug Report":

```markdown
## Descrizione Bug
Descrizione chiara e concisa del bug.

## Riproduzione
Passi per riprodurre:
1. Vai a '...'
2. Clicca su '...'
3. Scrolla fino a '...'
4. Vedi errore

## Comportamento Atteso
Cosa ti aspettavi che succedesse.

## Comportamento Attuale
Cosa è successo invece.

## Screenshots
Se applicabile, aggiungi screenshot.

## Ambiente
- OS: [es. Windows 11, macOS 14.0, Ubuntu 22.04]
- Browser: [es. Chrome 120, Firefox 121, Safari 17]
- Versione App: [es. 1.0.0]
- Dimensione File SQLite: [es. 15MB]

## Console Errors
Copia eventuali errori dalla console del browser (F12).

## File di Test
Se possibile, allega un file SQLite di test (rimuovi dati sensibili).

## Contesto Aggiuntivo
Altre informazioni rilevanti.
```

---

## Richiesta Funzionalità

Template "Feature Request":

```markdown
## Problema da Risolvere
Descrizione chiara del problema che questa feature risolverebbe.
Es: "È frustrante quando devo [...] perché [...]"

## Soluzione Proposta
Descrizione della soluzione che vorresti implementata.

## Alternative Considerate
Altre soluzioni a cui hai pensato.

## Impatto Utenti
Chi beneficerebbe di questa feature? Quanto è importante?

## Implementazione Tecnica (Opzionale)
Se hai idee su come implementarla tecnicamente.

## Screenshots/Mockup (Opzionale)
Mockup o esempi visivi se applicabile.

## Contesto Aggiuntivo
Altre informazioni rilevanti.
```

---

## Domande Frequenti

### Come posso iniziare se sono alle prime armi?

Cerca issue con label `good first issue` o `help wanted`. Sono issue adatte a chi inizia.

### Posso lavorare su più feature contemporaneamente?

Meglio concentrarsi su una feature alla volta. Crea PR separate per feature diverse.

### Quanto tempo serve per review di una PR?

I maintainer cercano di revieware entro 3-7 giorni. Sii paziente.

### La mia PR è stata rifiutata, posso riprovarci?

Assolutamente! Leggi i feedback, apporta modifiche, e riapri la PR o creane una nuova.

### Posso contribuire senza saper programmare?

Sì! Puoi:
- Migliorare documentazione
- Segnalare bug
- Suggerire funzionalità
- Aiutare altri utenti nelle issue

### Come posso restare aggiornato sul progetto?

- Metti "Watch" al repository
- Segui le Discussions
- Leggi il CHANGELOG
- Partecipa alle issue

### Chi sono i maintainer?

Consulta il file AUTHORS o la sezione "Contributors" su GitHub.

---

## Risorse Utili

### Documentazione Progetto

- [README.md](./README.md) - Panoramica progetto
- [CHANGELOG.md](./CHANGELOG.md) - Storico modifiche
- [docs/](./docs/) - Documentazione tecnica completa

### Guide Esterne

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/it/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

### Community

- GitHub Discussions: Domande e discussioni generali
- GitHub Issues: Bug report e feature request

---

## Licenza

Contribuendo a questo progetto, accetti che i tuoi contributi saranno rilasciati sotto licenza GPL-3.0. Vedi [LICENSE](./LICENSE) per dettagli.

---

## Ringraziamenti

Grazie per il tuo contributo! Ogni contributo, grande o piccolo, è prezioso per il progetto.

Se hai domande non coperte in questa guida, apri una Discussion o contatta i maintainer.