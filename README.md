# Remote Phone Control UI

Tactical Android Command and Control Interface
Real-time device monitoring and automation powered by Cloudflare Workers, D1 SQL, KV Storage, and MacroDroid.

Live Instance: https://your-custom-domain.com

---

## Table of Contents
1. [System Overview](#system-overview)
2. [System Architecture](#system-architecture)
3. [Authentication and Security](#authentication-and-security)
4. [Endpoints and API Reference](#endpoints-and-api-reference)
5. [Backend Infrastructure](#backend-infrastructure)
6. [Frontend Design System](#frontend-design-system)
7. [Mobile Responsiveness](#mobile-responsiveness)
8. [Database Schema](#database-schema)
9. [Task Scheduling Pipeline](#task-scheduling-pipeline)
10. [Vault HUD and Media Processing](#vault-hud-and-media-processing)
11. [Performance and Optimization](#performance-and-optimization)
12. [Browser Intelligence and Device Detection](#browser-intelligence-and-device-detection)
13. [Setup Instructions](#setup-instructions)
14. [Environment Variables Reference](#environment-variables-reference)
15. [Common Troubleshooting](#common-troubleshooting)
16. [Project File Directory](#project-file-directory)
17. [Future Expansion Ideas](#future-expansion-ideas)
18. [License](#license)

---

## System Overview

This project provides a professional-grade, cyberpunk-themed dashboard to remotely monitor and control an Android device. It acts as a bridge between MacroDroid (on-device automation) and a web-based Command Center, deployed entirely as a single Cloudflare Worker with zero external backend infrastructure.

What started as a simple toggle controller grew into a full surveillance and telemetry platform with file vaulting, cellular network diagnostics, hardware monitoring, scheduled automation, and a media HUD.

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

## Backend Infrastructure

The backend is a single monolithic Cloudflare Worker handling all server-side logic:

- Dynamic Routing: A custom request handler processes API calls and renders all HTML pages server-side as template literals.
- HTMLRewriter Injection: A shared cyberpunk navigation menu and styles are injected into static assets (home.html, schedule.html, etc.) via HTMLRewriter to avoid duplication.
- Key-Value Status Merging: Incoming /status parameters are merged on top of the stored Key-Value object. A single-parameter NetMonster update will not overwrite battery or volume data.
- NetMonster Dual-Parameter Filtering: Accepts both netmonster_status and netmonster_status2 parameters as safety fallbacks. Sanitizes generic placeholders (such as NETMONSTER, N/A, null) and resolves the first valid value before storage.
- Unicode-Safe Base64 Encoding: Encodes strings on the server and decodes on the client using URL encoding and base64 transforms to safely store cell tower symbols (such as bullet points) in the D1 database.
- HTTP 206 Range Request Slicing: Slices Key-Value binary assets (video and audio) at exact byte offsets and serves them with partial content headers for mobile media seeking.

---

## Frontend Design System

The frontend utilizes vanilla HTML5, CSS3, and JavaScript without external frameworks or bundlers.

- Theming: Uses deep black (#06080a), tactical teal (#00dca0), and alert red (#ef4444) themes.
- Typography: Utilizes Share Tech Mono for the terminal aesthetic and Rajdhani for UI labels.
- Visuals: Implements glassmorphism panels, neon glow shadows, and animated teal accents.

Key UI Systems:
- Control Select Bypass: Allows the user to hold the Ctrl key to temporarily enable text selection across all panels.
- Drag-to-Slide Volumes: Maps mouse and touch drag events on vertical volume bars.
- Backspace Navigation: Intercepts the backspace key to act as a browser Back button when not typing in a form field.
- Floating Sync Button: Displays active status polling with a rotating CSS spin animation.

---

## Mobile Responsiveness

All log dashboards (/requests, /statuslogs, /schedule/logs, /vault/list) are optimized for mobile viewports:

- Horizontal Table Scroll: Tables are wrapped in a scrollable container with customized scrollbars.
- Synchronized Column Widths: Table layout is set to auto with no-wrap rules on table header and body cells, keeping widths aligned.
- Fluid Header Flex: The header container uses flexbox wrapping to dynamically unwrap control elements side-by-side on zoom-out or landscape rotation.
- Single-Line Header Titles: Prevents text wrapping on titles and scales down font sizes on mobile devices.
- Pinch-Zoom-Out Support: Viewport meta tags configure initial-scale, minimum-scale, and maximum-scale settings without using width=device-width, enabling zoom-out support down to 0.3x.

---

## Database Schema

The database schema is implemented using Cloudflare D1 tables:

- logs: Records every HTTP request, storing the timestamp, method, path, status code, IP address, client source, and location.
- status_logs: Stores hardware heartbeat data including battery percentage, temperature, signal strength, uptime, and extra status JSON.
- command_schedules: Manages queued tasks, storing the command, target execution time, status, and output log.
- geo_cache: Caches IP geolocation details to minimize redundant external API lookups.
- vault_files: Indexes vault file metadata, tracking the unique file ID, type, size, content-type, and creation timestamps.

---

## Task Scheduling Pipeline

- Cron Jobs: Fires every minute to query D1 for pending commands.
- Queued Commands: The scheduler manages tasks stored in the command_schedules table with execution targets.
- Execution States: Updates target tasks from PENDING to either EXECUTED or FAILED depending on response status.
- Retry Logic: Fails securely and records MacroDroid output logs into D1 database columns for debugging.
- Automation Lifecycle: Connects scheduling updates to D1 execution routines, notifying database logs of scheduled tasks.

---

## Vault HUD and Media Processing

The /vault/display route serves as a standalone media viewer:

- EXIF Parser: A client-side JPEG/TIFF binary parser that extracts GPS coordinates, camera model, and capture date.
- GPS Plotting: Translates rational EXIF coordinates to decimal format to display locations on Google Maps.
- Audio Waveform: Decodes raw PCM audio using the browser's OfflineAudioContext to render authentic amplitude waveforms on a canvas.
- Pinch-to-Zoom: Supports multi-touch pinch gestures on mobile and Ctrl+Wheel trackpad scrolling on desktop up to 500% zoom.
- Fullscreen: Integrates key controls to toggle fullscreen mode.
- Transform Controls: Supports 90-degree rotation and horizontal mirror flipping.
- Grab-to-Pan: Allows click-and-drag panning across zoomed media.
- Spacebar Control: Instantly toggles play and pause states for audio and video media.

---

## Performance and Optimization

- Write-Filter Ingestion: Completely bypasses D1 database logging for all static assets (.css, .js, favicon) and background authentication checking API routes (/api/auth/check), reducing database write load by up to 95% during normal operations.
- Log Equalization: Applies a five percent sampling rate to high-frequency polling requests, while maintaining one hundred percent capture of security events, commands, and errors.
- Non-blocking Analytics: Handles logging asynchronously using the waitUntil method so responses are returned to the client before D1 database writes complete.
- AJAX Smart Merge: Refreshes tables by prepending only new rows with a temporary highlight animation to avoid layout redraw lag.
- Adaptive Polling: Cadence dynamically scales from 2 seconds (post-action) to 5 seconds (active) and up to 30 seconds (idle) to conserve device resources and bandwidth.
- Cleanup Routines: Performs database cleanup checks periodically to keep logging tables under two thousand rows.

---

## Browser Intelligence and Device Detection

- User-Agent Parsing: Evaluates client user agents to capture and log operating system and browser details.
- Client Hints: Extracts platform and architecture values from user-agent client hints where supported.
- Device Classification: Classifies incoming requests as desktop, tablet, or specific mobile device models.
- Browser-Specific Handling: Applies CSS selectors and touch handlers to account for differences between Chrome, Safari, and other mobile rendering engines.

---

## Setup Instructions

For a detailed step-by-step setup guide on provisioning Cloudflare Workers, D1 database, KV namespaces, environment secrets, and configuring the MacroDroid automation on your Android device, please refer to the dedicated [setup.md](setup.md) guide.


---

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

---

## Future Expansion Ideas

- Multi-Device Support: Adding an interface selector to filter logs by specific device IDs.
- Real-time Notifications: Using external communication APIs to alert you when battery is low.
- Remote Terminal: A web-based console to send custom shell commands to the phone.
- Advanced Graphs: Visualizing battery drain and signal strength over time.

---

## License

MIT License. See [LICENSE](LICENSE) for details. Built by [gopi470](https://github.com/gopi470).
