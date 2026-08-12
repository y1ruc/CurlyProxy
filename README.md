# CurlyProxy

A sleek, fast web proxy with a glassmorphism sidebar UI and built-in Discord recon logging.

## Setup

```bash
git clone https://github.com/y1ruc/CurlyProxy.git
cd CurlyProxy
npm install
npm start
```

Open `http://localhost:3000`.

## Deploy

**SITE COMING SOON**

```bash
npm start
```

## Features

- **Sidebar UI** — glass backdrop with vertical tabs, always-visible URL bar
- **12-game library** — overlay grid, one-click proxy to popular titles
- **Fullscreen mode** — hides chrome, Escape to exit
- **Recon logging** — every connection and proxy request fires a Discord embed (IP, UA, timestamp)
- **30s TTL cache** — repeat hits served from memory
- **Keep-alive agent pool** — no cold-start connections

## Files

| Path | Purpose |
|------|---------|
| `server.js` | Express proxy, webhook logger, fetch+rewrite engine |
| `setup.js` | Postinstall — copies UV engine files |
| `public/index.html` | Sidebar layout |
| `public/css/style.css` | Glassmorphism theme |
| `public/js/script.js` | Tab management, game overlay, fullscreen |
