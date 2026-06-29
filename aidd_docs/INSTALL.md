# INSTALL.md — PasswordGenerator

Technical vision and installation guide.

## Vision

A client-side password generator that creates strong, configurable passwords entirely on-device using the Web Crypto API.

Built as a clean, mobile-friendly web app with an Apple HIG aesthetic. No backend, no accounts, no telemetry — the password never leaves the browser. Personal project, open-source on GitHub for anyone who wants to use or fork it.

## Decisions

| Decision     | Choice               | Why                                                                 |
| ------------ | -------------------- | ------------------------------------------------------------------- |
| Architecture | Static SPA (no build)| No backend needed; avoids a build pipeline for a single-page tool  |
| Front-end    | Vanilla JS (ESM)     | No framework overhead for a ~200-line app; importmap handles deps   |
| Styling      | Tailwind CDN + custom CSS | Fast iteration; custom CSS for Apple HIG design tokens         |
| Crypto       | Web Crypto API       | Cryptographically secure randomness, native to the browser          |
| Strength     | zxcvbn (CDN)         | Industry-standard estimator, no backend call required               |
| Haptics      | web-haptics (esm.sh) | Tactile feedback on mobile, silent no-op on desktop                 |
| Hosting      | GitHub Pages / any static host | Static files, zero config needed                         |

## Stack summary

- **Front-end:** Vanilla JS (ES modules via importmap), HTML5, CSS3
- **Back-end:** None
- **Database:** None
- **Auth:** None
- **Hosting:** Any static host (GitHub Pages recommended)
- **Key dependencies:**
  - `web-haptics` ^0.0.6 — haptic feedback (npm + esm.sh importmap)
  - `zxcvbn` 4.4.2 — password strength estimation (CDN)
  - `tailwindcss` Play CDN — utility classes
  - `live-server` ^1.2.2 — local dev server (devDependency)

## Architecture

```
Browser
  └── index.html
        ├── style.css          (Apple HIG design tokens + component styles)
        ├── app.js (ESM)       (all logic: generate, strength, copy, haptics)
        ├── zxcvbn (CDN)       (global, loaded before app.js)
        └── web-haptics (esm.sh via importmap)
```

Single file, single module. No routing, no state management, no build step. All logic lives in `app.js` inside an IIFE.

## Folder structure

```
PasswordGenerator/
├── index.html          entry point
├── app.js              all application logic
├── style.css           design tokens and component styles
├── package.json        web-haptics dep + live-server devDep
├── package-lock.json
├── Start.sh            dev server launcher (macOS/Linux)
├── Start.bat           dev server launcher (Windows)
├── aidd_docs/
│   └── INSTALL.md      this file
└── README.md
```

## Install steps

```bash
# 1. Clone
git clone https://github.com/<your-username>/PasswordGenerator.git
cd PasswordGenerator

# 2. Install dependencies (only needed for local dev server + web-haptics node_modules)
npm install

# 3. Run locally
npm start          # or: npx live-server
# → opens http://127.0.0.1:8080
```

To deploy: push `index.html`, `app.js`, `style.css` to any static host (GitHub Pages, Netlify, Vercel). No build step required.

## Audit summary

No candidate audit was run — the stack was already implemented and is appropriate for the project scope. The chosen approach (zero-build static SPA) is the minimum viable architecture for a client-side tool with no server-side requirements.

| Aspect         | Verdict | Notes                                                     |
| -------------- | ------- | --------------------------------------------------------- |
| Security       | ✅      | `crypto.getRandomValues` — cryptographically secure       |
| Privacy        | ✅      | No network calls for password data; everything on-device  |
| Haptics        | ✅      | Fixed: copy button was double-firing; now single `success` synced with clipboard write |
| Offline        | ⚠️      | Works offline except zxcvbn and Tailwind (CDN deps); add a SW for full offline if needed |
| Mobile         | ✅      | Responsive layout + haptic feedback via web-haptics       |
