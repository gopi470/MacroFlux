# Remote Phone Control UI (Cloudflare Pages)

## Overview

This project provides a robust, real-time web interface to control an Android device remotely using MacroDroid webhooks. The system uses Cloudflare Workers and KV storage to facilitate two-way communication between the web dashboard and the device.

---

## Architecture

1. **User Control**: User selects a command in the Web UI → Redirects via `/control` → Cloudflare Worker → MacroDroid Webhook.
2. **Device Reporting**: Phone captures data (Location/Status) → Sends to `/report` → Cloudflare Worker → Saves to **Cloudflare KV**.
3. **Real-time UI**: The Web UI polls `/poll` every 2.5s → Fetches data from KV → Updates the terminal live.

---

## Setup Requirements

### 1. Cloudflare KV Namespace
You must create a KV namespace to store the latest data:
1. Go to **Cloudflare Dashboard** → **Workers & Pages** → **KV**.
2. Create a namespace named `LOCATION_KV`.
3. Copy the **ID** of the namespace.
4. Update `wrangler.jsonc` with your Namespace ID.

### 2. MacroDroid Configuration
Update your MacroDroid actions to interface with the new endpoints:
* **Report Location**: `https://ui.muffinjuice.xyz/report?link={v=gmaps_link}&key=ABC`
* **Trigger URL**: `https://trigger.macrodroid.com/f1511af3-cec6-4889-9838-1cc4648ebed3/control?cmd={v=cmd}&key={v=key}`

### 3. Macros Key
The default key is `ABC`. All requests (`/poll`, `/report`, `/control`) are secured by this key.

---

## Security Features

* **Access Verification**: All endpoints strictly validate the `key` parameter.
* **Intelligent Waiting**: When requesting location, the UI waits for a **fresh** timestamp from the device before displaying the link.
* **Failsafe**: If the device fails to report back within 10 seconds, the UI falls back to the last known cached data.

---

## Project Structure

```
.
├── _worker.js      # Cloudflare Worker (Routing, KV, Security)
├── index.html      # Main Dashboard
├── script.js       # Real-time Logic & UI Interactions
├── style.css       # Cyberpunk Design System
└── wrangler.jsonc  # Deployment Configuration
```

---

## Usage

1. Open: `https://ui.muffinjuice.xyz`
2. Enter your **Macros Key**.
3. Select a command (e.g., `LIVE LOCATION`, `SPEAK TEXT`).
4. Click **EXECUTE**.

---

## License

This project is provided as-is for personal use and experimentation.
