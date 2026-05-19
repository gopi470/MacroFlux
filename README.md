# Remote Phone Control UI

> **Tactical Android Command & Control Interface**
> Real-time device monitoring and automation powered by Cloudflare Workers, D1 SQL, KV Storage, and MacroDroid.

**Live Instance:** [ui.muffinjuice.xyz](https://ui.muffinjuice.xyz)

---

## System Overview

This project provides a professional-grade, cyberpunk-themed dashboard to remotely monitor and control an Android device. It acts as a bridge between **MacroDroid** (on-device automation) and a web-based **Command Center** — deployed entirely as a single **Cloudflare Worker** with zero external backend infrastructure.

What started as a simple toggle controller grew into a full surveillance and telemetry platform with file vaulting, cellular network diagnostics, hardware monitoring, scheduled automation, and a forensic media HUD.

### Architecture

```
┌─────────────────────────────┐
│     Android Device          │
│     (MacroDroid)            │
│  GET /status  ──────────┐   │
│  GET /report  ──────────┤   │
│  POST /upload ──────────┤   │
└─────────────────────────┼───┘
                          ▼
              ┌───────────────────────┐
              │   Cloudflare Worker   │
              │    (_worker.js)       │
              │                       │
              │  ┌─────────────────┐  │
              │  │  Cloudflare KV  │  │  ← Live status, location, vault files
              │  └─────────────────┘  │
              │  ┌─────────────────┐  │
              │  │  Cloudflare D1  │  │  ← Logs, schedules, geo cache, vault index
              │  └─────────────────┘  │
              └──────────┬────────────┘
                         │
              ┌──────────▼────────────┐
              │    Web Dashboard      │
              │   (You / Browser)     │
              │  Poll /status (5s)    │
              │  Send /control        │
              └───────────────────────┘
```

---

## Authentication System

- **Primary Gateway**: Protected by a global `ACCESS_KEY` secret. Valid auth sets a `session=authorized` cookie (30-min TTL, `SameSite=Lax; Secure`).
- **Inactivity Guard**: Uses absolute timestamp comparison (`Date.now() - lastInteractionTime`), immune to browser background tab throttling.
- **Unauthorized Handler**: Serves a themed "Tactical Alert" red page with a 7-second countdown and IP/Geo logging of the intruder before redirect to login.
- **Vault Security**: `/vault` routes require a secondary `VAULT_PASS` secret, setting a separate `vault_token` cookie (10-min TTL).
- **MacroDroid Auth**: All device-to-server calls use `?key=REPORT_KEY` validated against Worker secrets.

---

## Endpoints & API Reference

### User Interface (Authenticated Session)

| Path | Description |
|---|---|
| `/` | Secure Login Gateway |
| `/home` | Main Command Center — Live terminal, telemetry, controls |
| `/schedule` | Task Scheduler — Queue commands at specific times |
| `/requests` | HTTP Request History — Full audit log |
| `/statuslogs` | Hardware Health Analytics — Battery, signal, temp history |
| `/schedule/logs` | Scheduled Command Execution History |
| `/vault/list` | Encrypted File Archive — Images, audio, video |
| `/vault/display` | Forensic Media HUD — Full-featured media viewer |

### System APIs (MacroDroid / Automated)

| Path | Auth | Description |
|---|---|---|
| `/status` | `REPORT_KEY` | Receive hardware & network telemetry. Merges with existing KV state. |
| `/report` | `REPORT_KEY` | Update live location link |
| `/upload` | `REPORT_KEY` | Upload binary files (image/audio/video) to Vault |
| `/poll` | Session | Real-time state fetch for dashboard polling |
| `/control` | Session | Trigger MacroDroid webhook command immediately |
| `/intel` | Session | IP Geolocation lookup (D1-cached) |
| `/schedule/create` | Session | Queue a new scheduled command |

---

## Backend Infrastructure

The entire backend is a single monolithic **Cloudflare Worker** (`_worker.js`) handling:

- **Dynamic Routing**: Custom request handler processes API calls and renders all HTML pages server-side as template literals.
- **HTMLRewriter Injection**: Shared cyberpunk nav menu and styles are injected into static assets (`home.html`, `schedule.html`, etc.) via `HTMLRewriter`, avoiding duplication.
- **KV Status Merging**: Incoming `/status` params are merged **on top of** the stored KV object — so a single-param NetMonster update never wipes out battery or volume data.
- **NetMonster Dual-Param Filtering**: Accepts both `netmonster_status` and `netmonster_status2` as safety fallbacks. Sanitizes generic placeholders (`"NETMONSTER"`, `"N/A"`, `"null"`) and resolves the first valid value before persisting.
- **Unicode-Safe Base64 Encoding**: Uses `encodeURIComponent(btoa(...))` on the server and `decodeURIComponent(atob(...))` on the client to safely store cell tower symbols (e.g. `•`, `᛫`) in D1.
- **HTTP 206 Range Request Slicing**: KV binary assets (video/audio) are sliced at exact byte offsets and served with `206 Partial Content` + `Content-Range` headers for mobile media seeking.
- **Cron Scheduler**: `scheduled()` fires every minute, queries D1 for `PENDING` commands, executes them via MacroDroid webhook, and updates status to `EXECUTED` or `FAILED`.
- **Log Equalization**: 5% sampling of high-frequency `/poll` requests. 100% capture of all security events, commands, and errors.
- **IP Intelligence**: Multi-provider geo-lookup (ipapi.co → ip-api.com fallback) with D1 caching to stay within rate limits.
- **Non-blocking Analytics**: Logging uses `ctx.waitUntil()` so responses are returned instantly before D1 writes complete.
- **Auto Cleanup**: 5% chance on each request to prune old logs, keeping tables under 2000 rows.

---

## Frontend Design System

**Stack**: Vanilla HTML5, CSS3, JavaScript — no frameworks, no bundlers.

**Design Language**: Tactical Cyberpunk
- **Colors**: Deep black `#06080a`, tactical teal `#00dca0`, alert red `#ef4444`
- **Typography**: `Share Tech Mono` (terminal), `Rajdhani` (UI labels)
- **Effects**: Glassmorphism panels, neon glow shadows, animated teal accents

**Key UI Systems:**

| System | Description |
|---|---|
| Adaptive Polling | 2s (post-action) → 5s (active) → 30s (idle) cadence |
| Liquid Fill Animation | CSS `clip-path` polygon wobble on volume bars — top edge only |
| Ctrl+Select Bypass | Hold Ctrl to enable `user-select: text` across all panels |
| Drag-to-Slide Volumes | Mouse & touch drag mapping on vertical volume bars |
| Backspace Navigation | Global `keydown` intercept — acts as browser Back button |
| AJAX Smart Merge | Auto-refresh only prepends new rows; highlights them with animation |
| Floating Sync Button | Rotates on hover; CSS spin animation during active polling |

---

## Mobile Responsiveness

All four log dashboards (`/requests`, `/statuslogs`, `/schedule/logs`, `/vault/list`) are fully optimized for mobile:

- **Horizontal Table Scroll**: Tables wrapped in `.table-wrapper { overflow-x: auto }` with custom neon scrollbars
- **Synchronized Column Widths**: `table { width: max-content; table-layout: auto }` + `white-space: nowrap` on all `th`/`td` — header and body always aligned
- **Fluid Header Flex**: `.header` uses `flex-direction: row; flex-wrap: wrap` — controls dynamically unwrap side-by-side on zoom-out or landscape
- **Single-Line Header Titles**: `white-space: nowrap` on `h2` with scaled `font-size: 13px; letter-spacing: 2px` on mobile
- **Pinch-Zoom-Out Support**: All log pages use `<meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">` — `width=device-width` is intentionally omitted to allow zooming below 1.0x

---

## Database Schema (Cloudflare D1)

| Table | Contents |
|---|---|
| `logs` | Every HTTP request — timestamp, method, path, status, IP, source, location |
| `status_logs` | Hardware heartbeats — battery %, temp, signal dBm, uptime, extra JSON |
| `command_schedules` | Scheduled tasks — command, target time, status, output log |
| `geo_cache` | IP geolocation cache — avoids repeated external API calls |
| `vault_files` | Vault file metadata index — ID, type, size, content-type, timestamps |

---

## Vault HUD Media Center (`/vault/display`)

A fully standalone forensic media viewer:

| Feature | Description |
|---|---|
| EXIF Parser | Binary JPEG/TIFF parser — extracts GPS coords, camera model, capture date |
| GPS Plotting | Converts rational EXIF coordinates → decimal → Google Maps link |
| Audio Waveform | `OfflineAudioContext` decodes raw PCM, builds real amplitude waveform |
| Pinch-to-Zoom | Touch pinch gestures + Ctrl+Wheel trackpad — `100%` to `500%` zoom |
| Fullscreen | `F` key toggle, `Escape` to exit |
| Rotation & Mirror | 90° rotation, horizontal mirror flip |
| Grab-to-Pan | Mouse drag panning at any zoom level |
| Spacebar Play | Instant play/pause toggle |

---

## Setup Instructions

### 1. Requirements
- Cloudflare Account
- Node.js + Wrangler CLI (`npm install -g wrangler`)
- MacroDroid installed on Android

### 2. Provisioning
```bash
# Create D1 Database
npx wrangler d1 create remote_control_ui

# Create KV Namespace
npx wrangler kv:namespace create LOCATION_KV

# Apply Schema
npx wrangler d1 execute remote_control_ui --remote --file=schema.sql
```

### 3. Secrets
```bash
npx wrangler secret put ACCESS_KEY    # Dashboard login password
npx wrangler secret put REPORT_KEY    # MacroDroid auth key
npx wrangler secret put VAULT_PASS    # File vault password
npx wrangler secret put MACRO_ID      # MacroDroid Webhook ID
```

### 4. Deploy
```bash
npx wrangler deploy
```

---

## Environment Variables Reference

| Secret | Required | Purpose |
|---|---|---|
| `ACCESS_KEY` | ✅ | Primary dashboard login password |
| `REPORT_KEY` | ✅ | Auth key for MacroDroid device calls |
| `VAULT_PASS` | ✅ | Secondary vault authentication password |
| `MACRO_ID` | ✅ | MacroDroid webhook trigger ID |
| `MACRO_KEY` | Optional | Secondary MacroDroid key (if enabled) |
| `LOCATION_KV` | ✅ | KV namespace binding (in `wrangler.jsonc`) |
| `DB` | ✅ | D1 database binding (in `wrangler.jsonc`) |

---

## License

Personal use and experimentation. Built by [MuffinJuice](https://github.com/gopi470).
