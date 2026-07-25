# Health Awareness Studio

A simple, self-contained **single HTML file** for generating daily health-awareness
posters (English + Gujarati) for personal use — no backend, no build step, no install.

**Use it:** open [`health-awareness-studio.html`](./health-awareness-studio.html) in any
modern browser.

- Works fully offline. Posters and settings are stored on your device (IndexedDB + LocalStorage).
- Covers a full **365-day 2026 observance calendar** (imported from the supplied
  spreadsheet), so every date has a real awareness topic — with **genuine Gujarati
  titles for all 365 days**.
- **Topic-specific bilingual content** (importance, 4 key points, call-to-action)
  for every health subject; civic/national days use themed content and are clearly
  **labelled as official vs studio-created** observances (no fake medical advice).
- Each day it auto-picks the topic and generates 6 posters (English + Gujarati ×
  Story / Feed / Square) from one template design.
- **Overflow-protected rendering**: adaptive font sizing, line caps, footer
  truncation and bounds checks so text never spills off the poster.
- **Non-destructive versioning**: regenerating keeps previous versions; restore any
  version from the Library. Generation and publishing are **atomic** (all-or-nothing).
- **Movable observances** (Mother's/Father's/Friendship Day) are computed per year.
- Sections: Home, Calendar, Poster Generator, Poster Library, Captions, Downloads,
  Publishing Log, Analytics, Settings.
- Download individual images or a full ZIP (with `captions.json` + `metadata.json`).
- Set organisation name, logo, QR image, colours, hashtags and image format in
  **Settings**; clear posters or reset everything there too.

Content uses only general, verified public-health advice — no invented statistics.

**Scheduler note:** a single HTML file has no background process, so it generates
the day's set the first time you open the app each day (not silently at 08:00 IST
while closed). For a true unattended 08:00 run, trigger it from an external
scheduler (n8n, Make, cron, Apps Script) — the JSON exports are built to feed those.

---

# React + TypeScript + Vite (existing template, unrelated)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
