# Architettura CSS e Styling - Documentazione Tecnica

## Panoramica

Il progetto utilizza un approccio ibrido per lo styling, combinando:

1. **Tailwind CSS**: Utility-first framework per la maggior parte degli stili
2. **CSS Personalizzato**: Variabili CSS custom per temi e stili specifici
3. **Inline Styles**: Raramente, solo quando strettamente necessario

---

## 1. Tailwind CSS

### Configurazione

#### tailwind.config.js

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',  // Strategia basata su classe
  theme: {
    extend: {},       // Estensioni tema personalizzate
  },
  plugins: [],
}
```

### Strategia Dark Mode

**Approccio**: `darkMode: 'class'`

**Implementazione**:
```javascript
// In App.jsx
if (isDark) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
```

**Utilizzo nei Componenti**:
```jsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-gray-100">Testo</p>
</div>
```

### Utility Classes Utilizzate

#### Layout e Spacing

```css
/* Flexbox */
.flex              /* display: flex */
.flex-col          /* flex-direction: column */
.flex-1            /* flex: 1 1 0% */
.items-center      /* align-items: center */
.justify-between   /* justify-content: space-between */
.gap-2             /* gap: 0.5rem */

/* Grid */
.grid              /* display: grid */
.grid-cols-2       /* grid-template-columns: repeat(2, 1fr) */

/* Spacing */
.p-4               /* padding: 1rem (16px) */
.px-3              /* padding-left/right: 0.75rem */
.py-2              /* padding-top/bottom: 0.5rem */
.m-4               /* margin: 1rem */
.mt-10             /* margin-top: 2.5rem */

/* Sizing */
.w-full            /* width: 100% */
.w-36              /* width: 9rem (144px) */
.h-full            /* height: 100% */
.min-h-screen      /* min-height: 100vh */
```

#### Typography

```css
.text-sm           /* font-size: 0.875rem (14px) */
.text-xl           /* font-size: 1.25rem (20px) */
.text-2xl          /* font-size: 1.5rem (24px) */
.font-medium       /* font-weight: 500 */
.font-bold         /* font-weight: 700 */
.truncate          /* text-overflow: ellipsis + overflow: hidden */
```

#### Colors

```css
/* Backgrounds */
.bg-white          /* background-color: #ffffff */
.bg-gray-50        /* background-color: #f9fafb */
.bg-blue-500       /* background-color: #3b82f6 */
.bg-green-500      /* background-color: #10b981 */

/* Text */
.text-gray-600     /* color: #4b5563 */
.text-blue-600     /* color: #2563eb */

/* Dark Mode Variants */
.dark:bg-gray-800  /* background in dark mode */
.dark:text-gray-200 /* text in dark mode */
```

#### Interactivity

```css
.cursor-pointer    /* cursor: pointer */
.hover:bg-gray-100 /* background on hover */
.transition-colors /* transition: color, background-color, border-color */
.rounded           /* border-radius: 0.25rem */
.rounded-lg        /* border-radius: 0.5rem */
.shadow-md         /* box-shadow: medium */
```

#### Borders

```css
.border            /* border-width: 1px */
.border-2          /* border-width: 2px */
.border-gray-200   /* border-color: #e5e7eb */
.border-dashed     /* border-style: dashed */
.divide-y          /* border-top su children tranne primo */
```

#### Overflow

```css
.overflow-hidden   /* overflow: hidden */
.overflow-y-auto   /* overflow-y: auto (scroll verticale) */
```

---

## 2. CSS Personalizzato (App.css)

### Variabili CSS Custom

```css
:root {
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #e2e8f0;
  --highlight-bg: #f7fafc;
  --button-bg: #4299e1;
  --button-hover: #3182ce;
  --export-button-bg: #48bb78;
  --export-button-hover: #38a169;
}

:root[data-theme='dark'],
.dark {
  --background-color: #1a202c;
  --text-color: #e2e8f0;
  --border-color: #2d3748;
  --highlight-bg: #2d3748;
  --button-bg: #3182ce;
  --button-hover: #2c5282;
  --export-button-bg: #38a169;
  --export-button-hover: #2f855a;
}
```

**Uso**:
```css
body {
  background-color: var(--background-color);
  color: var(--text-color);
}
```

### Stili Body Globali

```css
body {
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 
               Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
```

**Caratteristiche**:
- **System Font Stack**: Usa font nativo del sistema per performance
- **Smooth Transitions**: Cambio tema animato (0.3s)
- **Cross-platform**: Font fallback per tutti gli OS

### Container Responsive

```css
.container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}
```

### Links

```css
a {
  color: #4299e1;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

### Prose (Contenuto Testuale)

```css
.prose {
  line-height: 1.6;
}

.prose p {
  margin-bottom: 1rem;
}

.dark .prose {
  color: #e2e8f0;
}
```

**Uso**: Applicato a contenuto long-form come evidenziazioni.

### Stili Custom Specifici

#### Highlight Text Box

```css
.highlight-text {
  background-color: rgba(66, 153, 225, 0.1);
  border-left: 3px solid #4299e1;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
}

.dark .highlight-text {
  background-color: rgba(66, 153, 225, 0.2);
}
```

**Uso**: Per evidenziare testo importante.

#### Note Box

```css
.note-text {
  background-color: rgba(237, 137, 54, 0.1);
  border-left: 3px solid #ed8936;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  font-style: italic;
}

.dark .note-text {
  background-color: rgba(237, 137, 54, 0.2);
}
```

**Uso**: Per note associate alle evidenziazioni.

---

## 3. Stili PostCSS

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Autoprefixer

Aggiunge automaticamente vendor prefixes:

**Input**:
```css
.element {
  display: flex;
  user-select: none;
}
```

**Output**:
```css
.element {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
```

---

## 4. Pattern di Styling Comuni

### Pattern 1: Card Container

```jsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
  {/* Contenuto */}
</div>
```

**Breakdown**:
- `bg-white` / `dark:bg-gray-800`: Background responsive al tema
- `rounded-lg`: Angoli arrotondati
- `shadow-md`: Ombra per profondità
- `overflow-hidden`: Clip contenuto agli angoli arrotondati

### Pattern 2: Header con Azioni

```jsx
<div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
  <h2 className="font-bold">Titolo</h2>
  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
    Azione
  </button>
</div>
```

### Pattern 3: Lista Scrollabile

```jsx
<div className="overflow-y-auto flex-grow">
  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
    {items.map(item => (
      <li key={item.id} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700">
        {item.content}
      </li>
    ))}
  </ul>
</div>
```

### Pattern 4: Input con Icona

```jsx
<div className="relative">
  <input 
    type="text" 
    className="py-1 px-3 pr-8 rounded-md border focus:ring-2 focus:ring-blue-500"
  />
  <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
    🔍
  </span>
</div>
```

### Pattern 5: Pulsante Primario

```jsx
<button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
  Click Me
</button>
```

### Pattern 6: Stato Selezionato

```jsx
<div className={`p-3 cursor-pointer ${
  isSelected 
    ? 'bg-blue-50 dark:bg-blue-900/30' 
    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
}`}>
  Item
</div>
```

---

## 5. Responsive Design

### Breakpoints Tailwind

```javascript
// tailwind.config.js default breakpoints
sm: '640px'   // tablet portrait
md: '768px'   // tablet landscape  
lg: '1024px'  // desktop
xl: '1280px'  // large desktop
2xl: '1536px' // extra large
```

### Utilizzo nel Progetto

```jsx
<div className="flex flex-col md:flex-row gap-6">
  {/* Mobile: colonna, Desktop: riga */}
</div>

<div className="w-full md:w-1/3 lg:w-1/4">
  {/* Mobile: full width, Tablet: 1/3, Desktop: 1/4 */}
</div>

<input className="w-36 md:w-48 lg:w-64">
  {/* Input width responsive */}
</input>
```

### Media Query Personalizzate

In `App.css`:

```css
@media (max-width: 768px) {
  .container {
    padding: 0.5rem;
  }
}
```

---

## 6. Transizioni e Animazioni

### Transizioni CSS

```css
/* In App.css */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### Transizioni Tailwind

```jsx
<button className="transition-colors hover:bg-blue-600">
  {/* Transizione automatica su color/bg/border */}
</button>

<div className="transition-all duration-300 hover:scale-105">
  {/* Transizione con durata custom */}
</div>
```

### Durate Disponibili

```css
.duration-75    /* 75ms */
.duration-100   /* 100ms */
.duration-150   /* 150ms */
.duration-200   /* 200ms */
.duration-300   /* 300ms (default) */
.duration-500   /* 500ms */
.duration-700   /* 700ms */
.duration-1000  /* 1000ms */
```

---

## 7. Accessibilità Stili

### Focus States

```jsx
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500" />
```

**Componenti**:
- `focus:outline-none`: Rimuove outline default
- `focus:ring-2`: Aggiunge ring blu di 2px
- `focus:ring-blue-500`: Colore ring

### Contrasti Colore

**WCAG 2.1 Level AA** garantito:

```
Chiaro:
- text-gray-900 (#111827) su bg-white (#ffffff) = 19.56:1 ✓
- text-gray-600 (#4b5563) su bg-gray-50 (#f9fafb) = 6.45:1 ✓

Scuro:
- text-gray-100 (#f3f4f6) su bg-gray-900 (#111827) = 17.25:1 ✓
- text-gray-200 (#e5e7eb) su bg-gray-800 (#1f2937) = 11.63:1 ✓
```

### Hover States Visibili

```jsx
<button className="hover:bg-gray-100 dark:hover:bg-gray-700">
  {/* Chiaro feedback visivo */}
</button>
```

---

## 8. Performance CSS

### Purge/Tree-shaking

Tailwind automaticamente rimuove classi non usate in produzione:

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",  // Scansiona questi file
  ],
}
```

**Risultato**: Da ~3MB (development) a ~8KB (production)

### Critical CSS

Vite automaticamente:
1. Inline CSS critico nell'HTML
2. Lazy load CSS non-critico

### CSS Minification

```bash
npm run build
```

Output:
```
dist/assets/index-[hash].css   8.15 kB │ gzip: 2.31 kB
```

---

## 9. Debug e Troubleshooting

### Inspector Tailwind

Usa browser DevTools per vedere classi applicate:

```html
<div class="flex p-4 bg-white dark:bg-gray-800">
  <!-- Ispeziona questo elemento -->
</div>
```

In DevTools:
```
Styles:
  .flex { display: flex; }
  .p-4 { padding: 1rem; }
  .bg-white { background-color: rgb(255, 255, 255); }
```

### Tailwind Intellisense (VS Code)

Estensione `bradlc.vscode-tailwindcss`:
- Autocomplete classi
- Hover per vedere CSS generato
- Linting classi non valide

### CSS Non Applicato

**Problemi Comuni**:

1. **Classe non in `content` paths**
   ```javascript
   // tailwind.config.js
   content: [
     "./src/**/*.{js,jsx}",  // Assicurati includa tutti i file
   ],
   ```

2. **Typo nel nome classe**
   ```jsx
   <div className="bg-bule-500">  // ❌ "bule" invece di "blue"
   <div className="bg-blue-500">  // ✓ Corretto
   ```

3. **Dark mode non attivo**
   ```javascript
   // Verifica in console
   document.documentElement.classList.contains('dark')  // true/false
   ```

4. **Specificità CSS**
   ```css
   /* CSS custom vince su Tailwind */
   .my-class { background: red !important; }  /* Evita !important */
   ```

---

## 10. Best Practices

### DO: Usa Utility Classes

```jsx
// ✓ Buono
<div className="flex items-center justify-between p-4">
```

### DON'T: Inline Styles

```jsx
// ✗ Evita
<div style={{ display: 'flex', padding: '1rem' }}>
```

**Eccezioni**: Valori dinamici da state

```jsx
// ✓ OK
<div style={{ width: `${percentage}%` }}>
```

### DO: Componenti con Varianti

```jsx
// ✓ Buono
const Button = ({ variant = 'primary', children }) => {
  const classes = variant === 'primary' 
    ? 'bg-blue-500 hover:bg-blue-600'
    : 'bg-gray-500 hover:bg-gray-600';
  
  return <button className={`px-3 py-1 rounded ${classes}`}>{children}</button>;
};
```

### DO: Responsive Mobile-First

```jsx
// ✓ Buono - inizia da mobile
<div className="w-full md:w-1/2 lg:w-1/3">

// ✗ Evita - desktop-first
<div className="w-1/3 lg:w-1/2 md:w-full">
```

### DO: Consistenza Colori

```jsx
// ✓ Buono - usa palette Tailwind
<div className="bg-blue-500 text-white">

// ✗ Evita - colori custom random
<div style={{ background: '#3a82f7', color: '#fff' }}>
```

### DO: Utilities per Stati

```jsx
// ✓ Buono
<button className="hover:bg-blue-600 focus:ring-2 disabled:opacity-50">

// ✗ Evita - gestione manuale
<button onMouseEnter={...} onFocus={...}>
```

---

## 11. Estensioni Future

### Custom Utilities

In `tailwind.config.js`:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'kobo-blue': '#0078D7',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
}
```

**Uso**:
```jsx
<div className="bg-kobo-blue p-128">
```

### Plugin Tailwind

```javascript
export default {
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Animazioni Custom

```javascript
export default {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
}
```

**Uso**:
```jsx
<div className="animate-fade-in">Content</div>
```