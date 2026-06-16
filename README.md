# 📅 Life Planner

A personal life planner with Google Calendar sync and Colombian holidays built in.

## Features
- Google Calendar sync (read + write)
- 10 event categories (workout, medical, travel, family, friends, freelance...)
- Colombian public holidays (festivos) pre-loaded for 2025 & 2026
- Day preview when tapping a date
- Fully customizable: colors, fonts, dark/light mode
- Works as an installable app on phone and desktop (PWA)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

### 4. Deploy to Vercel
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Hit Deploy — done!

## Project structure
```
life-planner/
├── index.html          # Entry point
├── package.json        # Dependencies
├── vite.config.js      # Build config
├── public/
│   ├── icon.svg        # App icon
│   └── manifest.json   # PWA manifest (install as app)
└── src/
    ├── main.jsx        # React bootstrap
    └── App.jsx         # Main planner component
```
