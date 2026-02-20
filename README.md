# Finance Tracker

A mobile-first Progressive Web App (PWA) for tracking personal expenses, income, and savings.

## Features

- **Home Dashboard** -- Monthly summary with income, expenses, and balance at a glance. Last 3 months bar chart overview.
- **Expenses** -- Add, view, and delete expenses. Overview with monthly trend charts, category doughnut breakdown, and full history.
- **Income** -- Track income sources with the same unified interface as expenses.
- **Savings** -- Monitor your money keeping: savings rate, net savings by month, income vs expenses comparison.
- **Dashboard** -- Combined view of income vs expenses with interactive bar charts (tap to select month).
- **Statistics** -- Averages, cheapest/most expensive months, category breakdowns, and monthly balance history.
- **Dark/Light Mode** -- Toggle in Settings, persisted across sessions.
- **Data Export/Import** -- Backup and restore your data as JSON.
- **PWA** -- Install on your phone's home screen for a native app experience.

## Tech Stack

- React + Vite
- Chart.js + react-chartjs-2
- Lucide React (icons)
- LocalStorage (no backend required)

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

Build for production:

```bash
npm run build
```

Deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages).

## License

MIT
