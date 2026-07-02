# Remote Phone Control UI

Tactical Android Command and Control Interface
Real-time device monitoring and automation powered by Cloudflare Workers, D1 SQL, KV Storage, and MacroDroid.

Live Instance: https://your-custom-domain.com

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Quick Start / Setup Guide](#quick-start--setup-guide)
3. [System Architecture](#system-architecture)
4. [Authentication and Security](#authentication-and-security)
5. [Endpoints and API Reference](#endpoints-and-api-reference)
6. [System Specifications](#system-specifications)
7. [Environment Variables Reference](#environment-variables-reference)
8. [Common Troubleshooting](#common-troubleshooting)
9. [Project File Directory](#project-file-directory)
10. [License](#license)

---

## System Overview

This project provides a professional-grade, cyberpunk-themed dashboard to remotely monitor and control an Android device. It acts as a bridge between MacroDroid (on-device automation) and a web-based Command Center, deployed entirely as a single Cloudflare Worker with zero external backend infrastructure.

What started as a simple toggle controller grew into a full surveillance and telemetry platform with file vaulting, cellular network diagnostics, hardware monitoring, scheduled automation, and a media HUD.

---

## Quick Start / Setup Guide

> [!IMPORTANT]
> To get started quickly with deploying the Cloudflare Worker, provisioning the D1 SQL database, and setting up MacroDroid on your Android device, please refer to the step-by-step **[setup.md](setup.md)** guide.
>
> You can import the pre-configured MacroDroid macro template **[docs/Webhook_Master_Control__2.macro](docs/Webhook_Master_Control__2.macro)** directly into your MacroDroid app to connect your phone.

---

## System Architecture

### High-Level Flow
- MacroDroid on the Android device pushes status, location, and upload packets to the Cloudflare Worker, which acts as the central logic processor.

### Request Lifecycle
- Incoming requests are authenticated, parsed, and logged. Valid requests interact with Cloudflare KV for transient state, and Cloudflare D1 for persistent database logs.

### Worker to MacroDroid Communication
- The dashboard sends a request to the control endpoint, which in turn triggers a secure webhook request pointing to the MacroDroid device URL.

### D1 and KV Responsibilities
- Cloudflare KV is responsible for fast read/write transient variables (such as current status and raw files), while Cloudflare D1 stores relational database logs, scheduled tasks, and metadata indexes.

### Polling and Control Pipeline
- The client dashboard polls the worker status endpoint periodically. Control actions execute asynchronously, returning immediately to the client while worker actions run in the background.

### Data Flow Diagram

![Data Flow Diagram](docs/data_flow_diagram.png)

---

## Authentication and Security

- Primary Gateway: Protected by a global ACCESS_KEY secret. Valid authentication issues a JSON Web Token (JWT) signed using HS256 with either a custom JWT_SECRET or fallback to the ACCESS_KEY, storing it in a session cookie (session=authorized) with a 30-minute Time-To-Live, using SameSite=Lax and Secure flags.
- Centralized Auth Guard: Enforces session token checks globally at the routing gateway for all browser-facing system endpoints (such as /home, /schedule, /vault/*, /control, and /poll). Unauthenticated attempts instantly trigger the themed High Alert red page with a 7-second countdown while logging the connecting IP and geolocation details.
- Inactivity Guard: Uses absolute timestamp comparison (Date.now minus lastInteractionTime), rendering the session check immune to browser background tab throttling.
- Vault Security: Routes under /vault require a secondary VAULT_PASS secret, which sets a separate vault_token cookie with a 10-minute Time-To-Live.
- MacroDroid Authentication: All device-to-server calls must include a REPORT_KEY query parameter, which is validated against the secrets configured in the Cloudflare Worker.

---

## Endpoints and API Reference

### User Interface (Authenticated Session)

| Path | Description |
|---|---|
| / | Secure Login Gateway |
| /home | Main Command Center containing the live terminal, telemetry data, and controls |
| /schedule | Task Scheduler interface to queue commands for execution at specific times |
| /requests | HTTP Request History providing a full audit log |
| /statuslogs | Hardware Health Analytics displaying battery, signal, and temperature history |
| /schedule/logs | Scheduled Command Execution History |
| /vault/list | Encrypted File Archive displaying images, audio, and video |
| /vault/display | Media HUD and media viewer |

### System APIs (MacroDroid / Automated)

| Path | Authentication | Description |
|---|---|---|
| /status | REPORT_KEY | Receives hardware and network telemetry, merging them with the existing Key-Value state. |
| /report | REPORT_KEY | Updates the live location link |
| /upload | REPORT_KEY | Uploads binary files (images, audio, or video) to the Vault |
| /poll | Session | Real-time state fetch for dashboard polling |
| /control | Session | Triggers the MacroDroid webhook command immediately |
| /intel | Session | Performs an IP Geolocation lookup, cached using D1 |
| /schedule/create | Session | Queues a new scheduled command |

---

## System Specifications

For deep-dives into the codebase technical design, edge-processing algorithms, database operations, security mechanisms, and developer reference patterns, please consult the dedicated [READMEext.md](READMEext.md) (Extended Technical Documentation).

### Core Subsystems
* **Backend Infrastructure**: Serverless execution on Cloudflare Workers edge network (V8 isolate).
* **Database Schema**: Dynamic, high-performance structured SQLite tables managed by Cloudflare D1.
* **Authentication**: Multi-tier security using HMAC SHA-256 (HS256) JSON Web Tokens (JWT) and cookies.
* **Task Scheduling**: Auto-running Cron execution queues mapping to device triggers.
* **Vault Processing**: Local client-side EXIF rendering, custom HTML5 audio PCM decoders, and mobile pinch-to-zoom handlers.
* **Performance Tuning**: DB write-bypass filters and log equalization algorithms.


## Environment Variables Reference

- ACCESS_KEY: The primary password required to log in to the dashboard.
- JWT_SECRET: An optional secret key used to sign and verify session JSON Web Tokens (JWT). Falls back to the ACCESS_KEY if not configured.
- REPORT_KEY: The authentication key used by MacroDroid to authorize status updates, location reports, and file uploads.
- VAULT_PASS: The secondary password required to authorize access to the encrypted File Vault.
- MACRO_ID: The unique identifier for the MacroDroid webhook trigger.
- MACRO_KEY: An optional secondary key for MacroDroid webhooks.
- LOCATION_KV: Binding to the Cloudflare Key-Value namespace.
- DB: Binding to the Cloudflare D1 Database.

---

## Common Troubleshooting

- Unauthorized dashboard access: Ensure your browser allows cookies. The system uses a session cookie to maintain authorization.
- Logs not appearing: Check if you have applied the database schema to your D1 database. Also, check if your report key in MacroDroid matches the one in your Worker Secrets.
- Multi-device support: Multiple devices can use the system by pointing their MacroDroid setup to the same Worker URL. Logs will identify them by their IP and Source.

---

## Project File Directory

- _worker.js: The monolithic Cloudflare Worker containing all backend API endpoints, static assets rendering logic, template utilities via HTMLRewriter, and JWT authorization helpers.
- index.html: The static secure login gateway page where ACCESS_KEY credentials are submitted.
- home.html: The main authenticated Command Center dashboard containing visual telemetry controls, toggles, terminal console logs, volume sliders, and location status tools.
- schedule.html: The authenticated task scheduling dashboard providing controls to queue, view, or manage scheduled task entries.
- vault-display.html: The standalone multimedia HUD viewer with built-in client-side EXIF/TIFF parsers, offline audio waveform decorators, zoom gestures, and spatial transforms.
- script.js: The frontend script containing polling triggers, command execution callbacks, liquid volume slider drag handlers, key state modifiers, and AJAX row rehydration logic.
- style.css: The central CSS stylesheet mapping tactical cyberpunk themes, custom typography variables, scrolling bars, keyframe wobbling polygon fills, and media query overrides.
- schema.sql: The SQLite schema declaration defining logs, status_logs, command_schedules, geo_cache, and vault_files tables initialized in Cloudflare D1.
- wrangler.jsonc: The Cloudflare configuration file binding the worker to LOCATION_KV, the D1 database, custom domain triggers, and cron pipelines.
- favicon.svg: The design icon injected automatically into all HTML head tags.
- .gitignore: Git configuration controlling repository file exclusions to prevent credential leaks.
- .assetsignore: Cloudflare assets controller listing files that should be ignored during static worker updates.
- README.md: The primary documentation detailing system architecture, credentials, endpoint references, optimization, and setup.
- READMEext.md: The extended technical documentation detailing low-level algorithmic designs, binary parsing steps, state merges, and concurrency plans.
- docs/Webhook_Master_Control__2.macro: Pre-configured MacroDroid automation script containing all triggers and telemetry dispatchers to import directly into the MacroDroid app.

---

## Future Expansion Ideas

- Multi-Device Support: Adding an interface selector to filter logs by specific device IDs.
- Real-time Notifications: Using external communication APIs to alert you when battery is low.
- Remote Terminal: A web-based console to send custom shell commands to the phone.
- Advanced Graphs: Visualizing battery drain and signal strength over time.

---

## License

MIT License. See [LICENSE](LICENSE) for details. Built by [gopi470](https://github.com/gopi470).
