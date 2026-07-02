# MacroFlux Setup Guide

Follow this guide to deploy your Remote Phone Control UI and connect it to your Android device using MacroDroid. 

No coding experience is required. Just follow the steps one by one.

---

## What is MacroFlux?
* **The Server/Dashboard:** Runs completely for free on **Cloudflare** (using a tool called Cloudflare Workers). It does not need you to pay for servers or database hosting.
* **The Mobile Side:** Runs on your Android phone using **MacroDroid** (a free automation app). It reads phone battery/network stats and sends them to the dashboard, and performs actions when the dashboard requests them.

---

## 1. Prerequisites (What you need on your computer)

Before starting, make sure you have:
1. **A Cloudflare Account:** Create a free account at [cloudflare.com](https://www.cloudflare.com/) if you do not have one.
2. **Node.js installed:** Node.js is a runtime tool that allows you to run commands. Download and install it from [nodejs.org](https://nodejs.org/). (Choose the **LTS** version and click Next, Next, Next until done).
3. **MacroDroid on your phone:** Download it from the Google Play Store on the Android device you want to control.
4. **Terminal / Command Prompt:**
   * **On Windows:** Press the Windows Key, type **PowerShell** or **cmd**, and open it.
   * **On Mac/Linux:** Open the **Terminal** app.

---

## 2. Cloudflare Infrastructure Provisioning

First, open your terminal and navigate to the project directory where you downloaded the MacroFlux files. (e.g., type `cd C:\path\to\MacroFlux`).

### Step 1: Install Wrangler
Wrangler is the official Cloudflare tool used to deploy your project. Run this command:
```bash
npm install -g wrangler
```
*What this does:* Installs the Cloudflare command-line tools on your computer.

### Step 2: Log in to Cloudflare
Type this command and press Enter:
```bash
wrangler login
```
*What this does:* A browser window will automatically open. Log in to your Cloudflare account and click **Authorize**. Once successful, close the browser page and return to your terminal.

### Step 3: Copy Configuration File
Run this command to create your active configuration file:
* **Windows (PowerShell):**
  ```powershell
  Copy-Item wrangler.jsonc.example wrangler.jsonc
  ```
* **Mac / Linux / Command Prompt:**
  ```bash
  cp wrangler.jsonc.example wrangler.jsonc
  ```
*What this does:* Creates a local `wrangler.jsonc` file. This file stores your database settings. (It is automatically ignored by Git, so your private details will never be leaked online).

---

### Step 4: Create the D1 Database (For logs and history)
Run this command to create a database:
```bash
wrangler d1 create remote_control_ui
```
*What this does:* Creates a database on Cloudflare. 

Look at the command output in your terminal. You will see something like this:
```text
database_id = "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```
1. Copy that long ID.
2. Open the `wrangler.jsonc` file in any text editor (like Notepad or VS Code).
3. Find the `database_id` field near the bottom and paste your ID between the quotes:
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "remote_control_ui",
    "database_id": "YOUR_NEW_D1_DATABASE_ID" // <-- Paste your ID here
  }
]
```

---

### Step 5: Create the KV Store (For live states and files)
Run this command to create a file storage namespace:
```bash
wrangler kv:namespace create LOCATION_KV
```
*What this does:* Creates a high-speed folder on Cloudflare to store live stats and photos uploaded from your phone.

Look at the terminal output. You will see something like this:
```text
{ binding = "LOCATION_KV", id = "yyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy" }
```
1. Copy the long `id` string (e.g. `yyyyyy...`).
2. Open your `wrangler.jsonc` file again.
3. Find the `id` field under `kv_namespaces` and paste your ID there:
```json
"kv_namespaces": [
  {
    "binding": "LOCATION_KV",
    "id": "YOUR_NEW_KV_NAMESPACE_ID" // <-- Paste your ID here
  }
]
```

---

### Step 6: Initialize your Database Schema
Run this command to build the database structure:
```bash
wrangler d1 execute remote_control_ui --remote --file=schema.sql
```
*What this does:* Configures the tables in your Cloudflare database so it knows where to store battery history, coordinates, and requests.

---

## 3. Configuring Environment Secrets (Passwords & Keys)

To keep your dashboard secure and prevent anyone else from controlling your phone, you must set up your security keys.

### Local Development (For testing on your computer)
If you want to test locally:
1. Copy the `.env.example` file and rename it to `.env`.
2. Open `.env` in Notepad and replace the placeholders with your own secret passwords.

### Production Secrets (For the live web deployment)
Run these commands in your terminal one by one to configure your live passwords:

```bash
# 1. Primary password to log into your web dashboard
wrangler secret put ACCESS_KEY

# 2. Secret key used by your phone to send status reports (make this a unique random phrase)
wrangler secret put REPORT_KEY

# 3. Secondary password required to access your Vault files (images/recordings)
wrangler secret put VAULT_PASS

# 4. Your MacroDroid Webhook Trigger ID (We will get this from your phone in the next section)
wrangler secret put MACRO_ID
```
*What this does:* After typing each command and pressing Enter, the terminal will ask you to **"Enter a secret value"**. Paste/type your password or key, then press Enter.

---

## 4. Production Deployment

Deploy the dashboard to your Cloudflare account by running:
```bash
wrangler deploy
```
*What this does:* Uploads the code to Cloudflare. 

Once finished, the terminal will output your live URL (e.g., `https://remote-control-ui.your-subdomain.workers.dev`). Write this URL down! You will need it to connect your phone.

---

## 5. MacroDroid Device Configuration

To connect your phone, we will use the pre-built macro template included in the repository.

### Easy Setup (Recommended):
1. Locate the file named `Webhook_Master_Control__2.macro` inside the `/docs` folder of this project.
2. Send this file to your Android phone (via Email, Google Drive, WhatsApp, or USB cable).
3. On your phone, open the **MacroDroid** app.
4. Tap **Templates** -> **Import/Export** (or tap the **+** button -> **Import Macro**).
5. Choose the `Webhook_Master_Control__2.macro` file you transferred.
6. Once imported, click the **Local Variables** section inside the macro and update these three variables:
   * `url`: Set this to your deployed Cloudflare URL (e.g., `https://remote-control-ui.your-subdomain.workers.dev`). (Do not add a trailing slash at the end).
   * `report_key`: Set this to the exact same phrase you configured in the server secret `REPORT_KEY`.
   * `macro_id`: Look at the top trigger in your imported MacroDroid macro named "Webhook (incoming)". Copy the unique ID string shown there, and paste it here. *(Also run `wrangler secret put MACRO_ID` in your PC terminal to configure it on Cloudflare).*
7. Save the macro by tapping the checkmark/save icon at the bottom right.

---

### Manual Setup (If you prefer to configure triggers manually):

If you do not want to import the pre-built file, configure these actions manually in MacroDroid:

#### A. Telemetry Dispatch (Status Update)
Configure a macro triggered by a time interval (e.g., every 5 minutes) to perform an **HTTP GET** request:
* **Target URL:** `https://[your-worker-url]/status`
* **Query Parameters:**
  * `key`: Your configured `REPORT_KEY`.
  * `battery_level`: `[battery]` (MacroDroid battery level token).
  * `battery_status`: `[battery_status]` (charging or discharging).
  * `battery_temperature`: `[battery_temp]` (battery temperature).
  * `signal_strength`: Mobile signal strength variable.
  * `phone_uptime`: Device uptime variable.

#### B. Location Dispatch (Location Update)
Configure a macro triggered by location changes or time interval to perform an **HTTP GET** request:
* **Target URL:** `https://[your-worker-url]/report`
* **Query Parameters:**
  * `key`: Your configured `REPORT_KEY`.
  * `link`: A Google Maps pin link (or custom lat/long string).

#### C. Vault Media Upload
Configure a macro to upload captured photos, videos, or voice recordings to the server:
* **Target URL:** `https://[your-worker-url]/upload?key=[REPORT_KEY]&type=[image|audio|video]&name=[filename]`
* **Request Method:** `POST`
* **Content Body:** Select multipart form-data or direct file upload, and select your captured file path.

#### D. Remote Command Webhook Trigger (Incoming Commands)
Set up a webhook trigger using your unique `MACRO_ID` string. In your actions list, add conditional tests to evaluate the incoming URL parameter (e.g., `cmd=take_photo`, `cmd=record_audio`, `cmd=set_volume`) to trigger corresponding hardware actions on your phone.
