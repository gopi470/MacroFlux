# Remote Phone Control UI — Extended Technical Documentation

This document is a deep-dive reference into the internal logic, algorithms, architectural decisions, and implementation patterns of the Remote Phone Control UI system.

---

## Advanced Algorithms

### 1. Log Equalization & Noise Filtering

The dashboard polls the server every 2–30 seconds depending on activity. Without filtering, this would flood the `logs` table with hundreds of thousands of identical `/poll` entries daily.

**Solution — Probabilistic Sampling:**
```javascript
// _worker.js — Log Equalization
if (url.pathname === "/poll" && Math.random() > 0.05) return; // 95% filtered
```

- 100% of security events (unauthorized access, commands, uploads) are always logged.
- 5% sample rate on `/poll`, `/favicon.ico`, and internal route calls.
- Result: ~95% write reduction on background traffic, D1 tables stay meaningful and readable.

---

### 2. Persistent KV Status Merging

When MacroDroid sends a NetMonster-only update (just `netmonster_status` + `key`), a naive flat overwrite would erase battery level, signal strength, and volume data from the stored object.

**Solution — Merge-on-write Pipeline:**
1. Worker reads existing JSON from `LOCATION_KV["status"]`.
2. Parses it and spreads incoming params on top: `{ ...existingStatus, ...incomingData }`.
3. Overwrites KV with the merged object.

Single-parameter triggers always preserve all other telemetry fields without requiring the phone to retransmit a full payload.

---

### 3. NetMonster Dual-Parameter Safety Fallback

MacroDroid sends two NetMonster status params as a redundancy fallback: `netmonster_status` and `netmonster_status2`. Either may return `"NETMONSTER"` (a raw placeholder string) or `null` on scan failure.

**Solution — Ingestion-Level Sanitization:**
```javascript
const cleanNetmonster = (s) => {
  if (!s) return "";
  const lower = s.trim().toLowerCase();
  if (["netmonster", "n/a", "null", "undefined"].includes(lower)) return "";
  return s.trim();
};

const resolved = cleanNetmonster(netmonster_status) || cleanNetmonster(netmonster_status2);
mergedData.netmonster_status = resolved || "—";
```

- Evaluates both params in order.
- Strips generic placeholder strings before they reach KV, D1, or the terminal panel.
- Downstream views (terminal, logs, modal) automatically receive only valid network strings.

---

### 4. UTF-8 Safe Unicode Base64 Encoding

Cell tower strings contain extended Unicode characters (`•`, `᛫`) that cause `btoa()` to throw `InvalidCharacterError` beyond the Latin-1 range.

**Solution — URI-Encoding Wrapper:**
```javascript
// Worker-side (encoding for D1 storage)
const encoded = btoa(encodeURIComponent(jsonString));

// Client-side (decoding with fallback for legacy entries)
try {
  data = JSON.parse(decodeURIComponent(atob(encoded)));
} catch {
  data = JSON.parse(atob(encoded)); // Fallback for pre-migration logs
}
```

---

### 5. IP Geolocation Caching

External geo-APIs have rate limits. Repeated lookups for the same IP are wasteful.

**Solution — D1 Cache Layer:**
1. Check `geo_cache` table for existing IP data.
2. On miss: query `ipapi.co` (primary) → fallback `ip-api.com`.
3. Write result to `geo_cache` with a timestamp.
4. Future requests for same IP return instantly from D1.

---

### 6. HTTP 206 Range Request Slicing

Mobile browsers require range requests to seek within large media files. Standard Workers don't slice KV binary data automatically.

**Solution — Manual ArrayBuffer Slicing:**
- Parse incoming `Range: bytes=start-end` header.
- Slice the `ArrayBuffer` at exact byte offsets.
- Return `206 Partial Content` with `Content-Range: bytes start-end/total` and `Accept-Ranges: bytes`.
- Enables frame-accurate scrubbing on video/audio without loading entire files into memory.

---

### 7. Asynchronous Audio PCM Waveform Rendering

Instead of a fake animated bar, the vault HUD renders a real amplitude waveform from the actual audio binary.

**Pipeline:**
1. `fetch()` the audio URL as `ArrayBuffer`.
2. Pass buffer to `OfflineAudioContext.decodeAudioData()`.
3. Extract `getChannelData(0)` (mono PCM float32 samples).
4. Divide samples into 250 equal blocks; compute absolute amplitude average per block: `(1/N) Σ|sample_i|`.
5. Normalize peaks to a 90px ceiling; apply 15-bar cosine fade-in/out at boundaries.
6. Render onto `<canvas>` as vertical bars.

---

### 8. Binary JPEG EXIF/TIFF Parser

Surveillance photos embed GPS coordinates in binary EXIF headers. No external library is used.

**Parser walkthrough:**
1. Receive `ArrayBuffer` → create `DataView`.
2. Skip SOI `0xFFD8`; scan markers until APP1 `0xFFE1` is found.
3. Validate `"Exif\0\0"` signature.
4. Detect byte endianness: `0x4D4D` = Big Endian, `0x4949` = Little Endian.
5. Walk IFD tags; locate GPS Info IFD pointer `0x8825`.
6. Extract `GPSLatitudeRef`, `GPSLatitude`, `GPSLongitudeRef`, `GPSLongitude`.
7. Convert rational coordinates (numerator/denominator fractions) to decimal:
   `deg + min/60 + sec/3600`, negated for West/South.
8. Output: Google Maps URL with precise decimal coordinates.

---

### 9. Multi-Touch Pinch-to-Zoom (Vault HUD)

```javascript
// touchmove — compute pinch distance
const dx = e.touches[0].clientX - e.touches[1].clientX;
const dy = e.touches[0].clientY - e.touches[1].clientY;
const dist = Math.sqrt(dx * dx + dy * dy);
const scale = clamp((dist / startDist) * startScale, 1.0, 5.0);
```

- Tracks two-finger touch delta using hypotenuse distance.
- Maps ratio against initial touch distance to zoom scale (100%–500%).
- Desktop: `wheel` + `ctrlKey` applies ±12% increments with `preventDefault()` to block browser default zoom.

---

## Task Scheduling Pipeline

### Execution Flow:
1. **Creation**: User selects a target time and command in `/schedule`.
2. **Persistence**: Stored in `command_schedules` table with status `PENDING`.
3. **Trigger**: Cloudflare Cron (`* * * * *`) fires `scheduled()` every minute.
4. **Processing**:
   - Query: `SELECT * FROM command_schedules WHERE status = 'PENDING' AND target_time <= NOW()`
   - For each task: `fetch(macrodroid_webhook_url)`
   - Capture response, store in `log_output`
   - Update status → `EXECUTED` or `FAILED`

---

## Security Architecture

### Multi-Layer Auth

| Layer | Mechanism |
|---|---|
| Dashboard | `ACCESS_KEY` → `session=authorized` cookie, 30-min TTL |
| Vault | `VAULT_PASS` → `vault_token=authorized` cookie, 10-min TTL |
| Device API | `?key=REPORT_KEY` query parameter on all MacroDroid calls |
| Cookie flags | `HttpOnly; SameSite=Lax; Secure` on all session cookies |

### Absolute Inactivity Guard

Browser tab throttling can pause `setInterval` ticks in background tabs, causing false "still active" states.

**Solution — Timestamp Delta:**
```javascript
// Every 60s background check
if (Date.now() - lastInteractionTime > 30 * 60 * 1000) logout();
```

Event listeners for `mousemove`, `keydown`, `touchstart`, `scroll` refresh `lastInteractionTime`. If the tab was suspended and resumed after 40 minutes, the check fires immediately on wakeup and logs out correctly.

### Tactical Unauthorized Page

A full themed HTML page (red/black high-alert style) is served on unauthorized access — not a plain 401:
- Logs intruder IP, User-Agent, and Geolocation to D1 before serving the page.
- 7-second countdown auto-redirect to login.
- Provides psychological deterrence while capturing forensic data.

### Smart Redirects

| Condition | Action |
|---|---|
| Authenticated user hits `/` or `/login` | Redirect to `/home` |
| Unauthenticated user hits any `/vault/*` | Redirect to `/vault/auth?next=<path>` |
| Vault token missing on `/vault/list` | Redirect to `/vault/auth` |

---

## Frontend Implementation Details

### Shared Navigation Injection (HTMLRewriter)

```javascript
return new HTMLRewriter()
  .on(".top-left-menu", {
    element(el) { el.replace(SHARED_NAV_HTML, { html: true }); }
  })
  .transform(response);
```

The nav menu is defined once in `_worker.js` (`SHARED_NAV_HTML`, `SHARED_NAV_STYLE`) and injected into every static HTML asset response. Updating the nav requires editing one place only.

### CSS Design Tokens

```css
:root {
  --teal:      #00dca0;                    /* Primary accent */
  --teal-dim:  rgba(0, 220, 160, 0.16);   /* Panel background */
  --panel:     rgba(5, 26, 20, 0.95);     /* Glassmorphism */
  --mono:      'Courier New', monospace;  /* Terminal font */
  --r:         4px;                        /* Border radius */
}
```

### Adaptive Polling Engine

| Phase | Interval | Trigger |
|---|---|---|
| High-speed | 2 seconds | Immediately after any command action (runs for 60s) |
| Normal | 5 seconds | Dashboard active in viewport |
| Idle | 30 seconds | No user interaction for >2 minutes |

### Fluid Clip-Path Liquid Animation

Volume bars animate only the **top edge** of the fill — the body remains solid:

```css
@keyframes liquidWobble {
  0%   { clip-path: polygon(0 100%, 0 6px, 10% 2px, 20% 5px, 30% 1px, 40% 4px, 50% 2px, 60% 5px, 70% 1px, 80% 4px, 90% 2px, 100% 5px, 100% 100%); }
  50%  { clip-path: polygon(0 100%, 0 3px, 10% 6px, 20% 2px, 30% 5px, 40% 1px, 50% 4px, 60% 2px, 70% 6px, 80% 2px, 90% 5px, 100% 2px, 100% 100%); }
  100% { clip-path: polygon(0 100%, 0 6px, 10% 2px, 20% 5px, 30% 1px, 40% 4px, 50% 2px, 60% 5px, 70% 1px, 80% 4px, 90% 2px, 100% 5px, 100% 100%); }
}
```

- 11-point polygon; top Y-coords oscillate between 1px–6px (constant 5px wave height regardless of fill%).
- GPU-composited — no canvas, no JS on every frame.

### Universal Ctrl+Select Bypass

`user-select: none` is applied globally to prevent accidental text selection breaking the console aesthetic. But copy-pasting logs is sometimes necessary:

```javascript
document.addEventListener('keydown', e => {
  if (e.key === 'Control') document.body.classList.add('ctrl-select-mode');
});
document.addEventListener('keyup', e => {
  if (e.key === 'Control') document.body.classList.remove('ctrl-select-mode');
});
```
```css
body.ctrl-select-mode * {
  user-select: text !important;
  -webkit-user-select: text !important;
}
```

Hold `Ctrl` → any text on any panel becomes selectable and copyable instantly.

### AJAX Smart Row Merge

Auto-refresh on log dashboards does not wipe and reload the entire table:
1. Fetch latest 10 rows via `?partial=true&limit=10`.
2. Compare row timestamps with existing DOM rows.
3. Prepend only genuinely new rows.
4. Apply `new-row` CSS animation (teal highlight fade) to new entries.

---

## Mobile Table Responsiveness

All four log dashboards share identical responsive CSS architecture:

### Table Synchronization

```css
.table-wrapper { overflow-x: auto; width: 100%; }
table { width: max-content; min-width: 100%; table-layout: auto; border-collapse: collapse; }
th, td { white-space: nowrap; }
```

`width: max-content` forces the table to expand to its natural content width. Combined with `overflow-x: auto` on the wrapper, both `<thead>` and `<tbody>` scroll together — column widths are always synchronized.

### Fluid Header Flex (Zoom-Responsive)

```css
@media (max-width: 768px) {
  .header {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .search-wrap { flex: 1 1 auto !important; min-width: 200px !important; }
  .c-sel        { flex: 1 1 auto !important; min-width: 120px !important; }
  .btn-refresh  { flex: 1 1 auto !important; min-width: 120px !important; }
}
```

When the user pinch-zooms out and the virtual layout width increases, controls naturally unwrap from a stacked column into a single row — no JS required.

### Pinch-Zoom-Out Support

Standard `width=device-width` locks the layout viewport to the physical screen width, which prevents zooming out below `1.0x`. All log pages intentionally omit this:

```html
<meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">
```

This allows the user to pinch-zoom out to `0.3x` to view wide tables in a single glance on narrow screens.

---

## Database Management

### Auto-Cleanup Routine

Runs with 5% probability on each worker request to avoid dedicated cron overhead:

```sql
DELETE FROM logs WHERE id IN (
  SELECT id FROM logs ORDER BY timestamp DESC LIMIT -1 OFFSET 2000
);
DELETE FROM status_logs WHERE id IN (
  SELECT id FROM status_logs ORDER BY timestamp DESC LIMIT -1 OFFSET 2000
);
```

Keeps only the 2000 most recent rows per table — a rolling window that fits comfortably within D1 free tier limits.

### One-Pass HTML Rendering

Log pages process thousands of D1 rows in a single JavaScript iteration:
- Date-group separators are inserted when `dayStr !== lastDay`.
- Status colors, charging icons, and Base64 extra-data are computed inline.
- Avoids a second pass or DOM mutation after initial render — stays within Cloudflare Worker CPU time limits.

---

## Browser Intelligence

`_worker.js` contains a User-Agent parser stored in the `source` column of `logs`:

**Detected browsers**: Chrome, Brave, Edge, Opera, Vivaldi, Firefox, Safari  
**Detected devices**: Desktop, iPhone, iPad, Samsung, Pixel, OnePlus, Xiaomi, Huawei, Motorola  
**Client Hints**: Uses `sec-ch-ua` headers where available for better accuracy.

---

## Specialized Utility Systems

### Global Backspace Navigation

```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace') {
    const isEditable = ['INPUT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
    if (!isEditable) { e.preventDefault(); window.history.back(); }
  }
});
```

Backspace acts as a browser Back button on all pages unless the user is actively typing in a form field.

### Favicon Auto-Injection

```javascript
if (contentType.includes("text/html")) {
  const injected = html.replace(/<head([^>]*)>/i, `<head$1>\n  ${faviconTag}`);
  return new Response(injected, { ... });
}
```

Applied to every HTML response — static assets and dynamically generated pages alike.

### `renderTactical()` API Response Helper

Used by `/status`, `/report`, `/upload`, and `/schedule/create` to provide consistent styled feedback:
- Green teal theme for success (200).
- Red theme for errors (400, 401, 500).
- Monospaced terminal-style box with timestamp.
- Readable even in MacroDroid's HTTP response preview.

---

## MacroDroid Integration Reference

### Hardware Status (`GET /status`)

Required params:
| Param | Type | Example |
|---|---|---|
| `key` | String | `REPORT_KEY` value |
| `battery_level` | Integer | `72` |
| `battery_status` | String | `"Charging"` |
| `battery_temperature` | String | `"34°C"` |
| `signal_strength` | Integer | `-87` (dBm) |
| `phone_uptime` | String | `"08:23:41"` |
| `netmonster_status` | String | `"Airtel 5G • LTE 2300 + NSA 3500"` |
| `netmonster_status2` | String | Safety fallback (same field, different macro) |
| `wifi_status` | `"0"` or `"1"` | Toggle state |
| `bluetooth_status` | `"0"` or `"1"` | Toggle state |
| `media_volume` | Integer | `0–100` |
| `ringer_volume` | Integer | `0–100` |

> Note: All params are optional per-call — KV merging preserves any fields not included in a given update.

### Vault Upload (`POST /upload`)

```
POST /upload?key=REPORT_KEY&type=image
Content-Type: image/jpeg
Body: <raw binary bytes>
```

- Worker generates a unique file ID, stores binary in KV, indexes metadata in D1.
- Supported types: `image`, `audio`, `video`.

---

## Performance Notes

| Concern | Solution |
|---|---|
| D1 write latency | `ctx.waitUntil()` — logging is non-blocking |
| High-frequency polling | 95% filtered by equalization algorithm |
| Geo-API rate limits | D1 cache layer with timestamp |
| Large media files | 206 range slicing — no full-file memory load |
| Worker CPU limits | Single-pass HTML rendering, no second DOM passes |
| Mobile table width mismatch | `width: max-content` on table, `overflow-x: auto` on wrapper |

---

## Troubleshooting

**"Unauthorized" after correct password?**  
→ Check that your browser allows cookies. The auth system depends on `session` cookies.

**Logs not appearing?**  
→ Verify `schema.sql` was applied to D1. Check that `REPORT_KEY` in MacroDroid matches the Worker secret exactly.

**NetMonster shows "NETMONSTER" string in terminal?**  
→ The Worker now strips this server-side. Re-deploy with `npx wrangler deploy` if on an older version.

**Zoom-out not working on mobile?**  
→ Ensure the page's viewport meta tag does **not** include `width=device-width`. Check that `user-scalable=yes` is present.

**Table columns misaligned on mobile?**  
→ The `.table-wrapper` must have `overflow-x: auto` and the `<table>` must have `width: max-content`.

**Vault media won't seek/scrub?**  
→ Ensure the Worker is responding with `206 Partial Content` and `Accept-Ranges: bytes` headers for `/vault/asset` requests.

---

## Capacity & Limits

| Resource | Limit | Notes |
|---|---|---|
| Log rows (per table) | 2000 | Auto-pruned by rolling window |
| Vault file listing | 500 (UI display) | KV storage is the actual limit |
| Poll equalization | 5% sample | ~95% write reduction |
| Geo cache | Indefinite | Stored by IP in `geo_cache` |
| Inactivity timeout | 30 minutes | Absolute timestamp, tab-throttle immune |
| Zoom range | 0.3x – 5.0x | Controlled by viewport `minimum-scale` |
