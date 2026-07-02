# MacroFlux Setup Guide

Follow this guide to deploy your Remote Phone Control UI and connect it to your Android device using MacroDroid.

---

## 1. Prerequisites

Before starting, ensure you have the following:
* A **Cloudflare Account** (free tier is fully sufficient).
* **Node.js** installed on your computer.
* **Wrangler CLI** installed globally (or run via `npx`):
  ```bash
  npm install -g wrangler
  ```
* **MacroDroid** installed on your target Android device.

---

## 2. Cloudflare Infrastructure Provisioning

Log in to Cloudflare from your terminal:
```bash
wrangler login
```

### Step A: Copy Configuration Template
Copy the template configuration file to create your active configuration:
```bash
cp wrangler.jsonc.example wrangler.jsonc
```
*(Note: `wrangler.jsonc` is already ignored in `.gitignore` so your private IDs won't be pushed back to Git).*

### Step B: Create D1 SQL Database
Run the following command to create a D1 database:
```bash
wrangler d1 create remote_control_ui
```
Copy the `database_id` output from this command and paste it into the `database_id` field in your `wrangler.jsonc` file:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "remote_control_ui",
    "database_id": "YOUR_NEW_D1_DATABASE_ID"
  }
]
```

### Step C: Create Key-Value (KV) Namespace
Create a KV namespace to store live states and uploaded vault files:
```bash
wrangler kv:namespace create LOCATION_KV
```
Copy the `id` output from the command and paste it into the `id` field under `kv_namespaces` in your `wrangler.jsonc`:
```json
"kv_namespaces": [
  {
    "binding": "LOCATION_KV",
    "id": "YOUR_NEW_KV_NAMESPACE_ID"
  }
]
```

### Step D: Initialize the Database Schema
Apply the database schema to your newly created remote D1 database:
```bash
wrangler d1 execute remote_control_ui --remote --file=schema.sql
```

---

## 3. Configuring Environment Secrets

You need to define keys and passwords. The application looks for these environment variables.

### Local Development / Testing
For local testing (`wrangler dev`), copy the template environment file:
```bash
cp .env.example .env
# OR
cp .dev.vars.example .dev.vars
```
Open `.env` (or `.dev.vars`) and replace the placeholders with your own secret tokens.

### Production Secrets
For production deployments, push the secrets directly to Cloudflare:
```bash
# 1. Primary password for logging into the web dashboard
wrangler secret put ACCESS_KEY

# 2. Key used by your phone (MacroDroid) to authorize status and uploads
wrangler secret put REPORT_KEY

# 3. Secondary password to access the encrypted Media Vault
wrangler secret put VAULT_PASS

# 4. The unique ID of your MacroDroid Webhook Trigger (incoming commands)
wrangler secret put MACRO_ID
```

---

## 4. Production Deployment

Deploy the monolithic Cloudflare Worker and static assets to your Cloudflare account:
```bash
wrangler deploy
```
Once deployed, Cloudflare will output your worker's live URL (e.g. `https://remote-control-ui.your-subdomain.workers.dev`).

*(Optional)*: If you want to bind the worker to a custom domain, uncomment the `routes` block in `wrangler.jsonc` and replace the placeholder patterns with your own domain name before deploying.

---

## 5. MacroDroid Device Configuration

To connect your Android device to the server, you can import the pre-built MacroDroid template file **[docs/Webhook_Master_Control__2.macro](docs/Webhook_Master_Control__2.macro)** directly into your MacroDroid app and configure the local variables.

Alternatively, to manually configure the device connection:

### A. Telemetry Dispatch (Outgoing Status)
Configure a MacroDroid macro triggered by interval (e.g., every 5 minutes) or battery/network changes to make a `GET` request:
* **Target URL**: `https://[your-worker-url]/status`
* **Query Parameters**:
  * `key`: Your configured `REPORT_KEY`.
  * `battery_level`: Your phone's battery level.
  * `battery_status`: Charging state (`charging` or `discharging`).
  * `battery_temperature`: Battery temperature.
  * `signal_strength`: Mobile connection signal strength.
  * `phone_uptime`: Device uptime.
  * `netmonster_status`: Network details/operator.

### B. Location Dispatch (Outgoing Location)
Configure a macro triggered by location changes or interval to make a `GET` request:
* **Target URL**: `https://[your-worker-url]/report`
* **Query Parameters**:
  * `key`: Your configured `REPORT_KEY`.
  * `link`: A Google Maps pin link (or custom lat/long string).

### C. Vault Media Ingestion (Outgoing Uploads)
Configure a macro to upload captured photos, videos, or voice recordings:
* **Target URL**: `https://[your-worker-url]/upload?key=[REPORT_KEY]&type=[image|audio|video]&name=[filename]`
* **Request Method**: `POST`
* **Content Body**: Upload the target media file as multipart form-data.

### D. Incoming Command Execution (Webhook Receiver)
Configure a webhook trigger in MacroDroid using the `MACRO_ID` string. Set up conditional triggers based on incoming `cmd` URL query parameters (e.g. `cmd=take_photo`, `cmd=record_audio`, `cmd=set_volume`).
