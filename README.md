# Remote Phone Control UI

> Real-time Android device control & monitoring via Cloudflare Workers + D1 + MacroDroid.

**Live:** [https://ui.muffinjuice.xyz](https://ui.muffinjuice.xyz)

---

## Architecture

```
MacroDroid (Android)
    │
    ├── GET /status   → Hardware heartbeat (battery, signal, temp, uptime)
    ├── GET /report   → Location link update
    └── GET /control  → Trigger command via webhook
           │
    Cloudflare Worker (_worker.js)
           │
    ├── Cloudflare KV  (LOCATION_KV)   → Real-time status cache
    └── Cloudflare D1  (remote_control_ui) → Persistent SQL logs
           │
    Web Dashboard (ui.muffinjuice.xyz)
    ├── /home        → Command center (poll + execute)
    ├── /requests    → HTTP request history log
    └── /statuslogs  → Hardware status history log
```

---

## Endpoints

| Endpoint | Auth | Description |
|---|---|---|
| `GET /` | — | Login page |
| `GET /home` | Session cookie | Main dashboard |
| `GET /requests` | Session cookie | HTTP request log (D1, day-grouped) |
| `GET /statuslogs` | Session cookie | Hardware heartbeat history (D1, day-grouped, live-tail) |
| `GET /status` | `REPORT_KEY` | Receive device heartbeat from MacroDroid |
| `GET /report` | `REPORT_KEY` | Update live location link |
| `GET /poll` | Session cookie | Real-time KV data fetch |
| `GET /intel?ip=` | Session cookie | IP geolocation lookup (cached in D1) |
| `GET /vault` | Session cookie | Encrypted file vault |

---

## Database Schema (D1 — `remote_control_ui`)

### `logs`
Stores every HTTP request (with equalization to prevent `/poll` flooding).

| Column | Type | Description |
|---|---|---|
| timestamp | INTEGER | Unix ms |
| method | TEXT | GET / POST |
| path | TEXT | Request path |
| status | INTEGER | HTTP status code |
| ip | TEXT | Caller IP |
| source | TEXT | Browser / MacroDroid / API |
| noisy | INTEGER | 1 = noisy endpoint |
| location | TEXT | Geo from Cloudflare headers |

### `status_logs`
Stores every hardware heartbeat from the device.

| Column | Type | Description |
|---|---|---|
| timestamp | INTEGER | Unix ms |
| battery | INTEGER | Battery % |
| charging | INTEGER | 1 = charging |
| signal | INTEGER | Signal strength (dBm) |
| temperature | TEXT | Battery temperature (°C) |
| uptime | TEXT | Device uptime |
| ip | TEXT | Device IP |
| location | TEXT | Geo location |

### `geo_cache`
Caches IP geolocation results to avoid rate-limiting external APIs.

### `vault_files`
Metadata for encrypted file vault uploads.

---

## Setup

### 1. Cloudflare KV
Create a KV namespace named `LOCATION_KV` and add its ID to `wrangler.jsonc`.

### 2. Cloudflare D1
Create a D1 database named `remote_control_ui` and apply the schema:
```bash
npx wrangler d1 execute remote_control_ui --remote --file=schema.sql
```

### 3. Worker Secrets
Set the following secrets via the Cloudflare dashboard or CLI:
```bash
npx wrangler secret put ACCESS_KEY    # Login key for the dashboard
npx wrangler secret put REPORT_KEY    # Key for MacroDroid heartbeat requests
```

### 4. MacroDroid Configuration
Configure MacroDroid HTTP actions to hit these endpoints:

| Action | URL |
|---|---|
| Hardware Heartbeat | `https://ui.muffinjuice.xyz/status?key=YOUR_KEY&battery_level=%battery%&battery_status=%battery_state%&battery_temperature=%battery_temperature%&signal_strength=%signal_strength%&phone_uptime=%uptime%` |
| Location Report | `https://ui.muffinjuice.xyz/report?key=YOUR_KEY&link={maps_link}` |
| Command Trigger | `https://trigger.macrodroid.com/.../control?cmd={cmd}&key=YOUR_KEY` |

### 5. Deploy
```bash
npx wrangler deploy
```

---

## Features

- 🛡️ **Security Gateway** — Session cookie auth with 7-second countdown redirect for unauthorized access
- 📊 **HTTP Request History** (`/requests`) — Searchable, filterable, paginated log with day-based date separators and IP intelligence
- 🔋 **Hardware Status History** (`/statuslogs`) — Live-tail (5s auto-refresh), sortable Newest/Oldest, day-grouped date banners, battery/signal/temperature/uptime tracking
- 🌍 **IP Intelligence** — Multi-provider geo lookup (ipapi.co → ip-api.com fallback) cached in D1
- 📁 **Vault** — Encrypted file storage
- 🗂️ **Day-Grouped Logs** — Both `/requests` and `/statuslogs` show date separator banners when the day changes

---

## Project Structure

```
.
├── _worker.js      # Cloudflare Worker — all routing, security, rendering
├── home.html       # Main dashboard (served as static asset)
├── schema.sql      # D1 database schema
└── wrangler.jsonc  # Deployment configuration
```

---

## License

Provided as-is for personal use and experimentation.
