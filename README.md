# CurlyProxy

A fast web proxy with a browser-style UI, a 117-game library, and tab cloaking to look like Google Classroom.

## Setup

```bash
git clone https://github.com/y1ruc/CurlyProxy.git
cd CurlyProxy
npm install
npm start
```

Open `http://localhost:3000`.

## How it works

A Node.js Express server that fetches remote URLs server-side and rewrites the HTML so all requests route back through the proxy. Two proxy modes:

- **Query-param** — `/proxy?url=https://example.com` (used by the URL bar)
- **Path-based** — `/proxy/https/example.com/path` (used by game embeds, preserves relative URL resolution)

## Features

- **Browser UI** — toolbar with back/forward/refresh, pill URL bar, tabs
- **Game library** — 117 games at `/games` with cover art and search
- **Game embeds** — `/game/<slug>` fullscreen pages (onlinegames.io + Y8 embed endpoints)
- **Tab cloaking** — pick a disguise (Google Classroom, Docs, Khan Academy, etc.) that changes the page title + favicon
- **Fullscreen mode** — hides chrome, Escape to exit
- **Loading spinners** — custom loaders on game pages and the main browser
- **gzip compression**, **1hr asset cache**, **keep-alive connection pool**

## Files

| Path | Purpose |
|------|---------|
| `server.js` | Express proxy engine, game library, `/games` + `/game/:slug` pages |
| `public/index.html` | Browser UI |
| `public/css/style.css` | Theme |
| `public/js/script.js` | Tabs, games fetch, cloaking, fullscreen |
| `public/gicons/` | Game icon SVGs (original 12 games) |
| `debug.js` | CLI: `node debug.js <url> [--proxy]` to inspect proxied pages |
