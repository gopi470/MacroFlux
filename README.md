# Remote Phone Control UI (Cloudflare Pages)

## Overview

This project provides a lightweight web interface to control an Android device remotely using MacroDroid webhooks. The UI constructs requests to a predefined endpoint and redirects the browser to trigger actions on the device.

The system is designed to be:

* Stateless (no backend required)
* Fast and lightweight (static HTML/JS only)
* Compatible with Cloudflare Pages or GitHub Pages

---

## Architecture

User → Web UI (Cloudflare Pages) → Custom Domain
→ Redirect Rule (/control) → MacroDroid Webhook
→ Android Device Action

---

## Requirements

* A configured MacroDroid webhook URL:
  https://trigger.macrodroid.com/<your-id>/control

* A custom domain (e.g., api.muffinjuice.xyz) managed via Cloudflare

* A Cloudflare Redirect Rule mapping:
  https://api.muffinjuice.xyz/control → MacroDroid webhook

---

## Project Structure

```
.
├── index.html
└── README.md
```

---

## index.html

A minimal static interface that:

* Accepts a secret key
* Allows selecting a command
* Redirects to the webhook endpoint

Example logic:

```
https://api.muffinjuice.xyz/control?cmd=<command>&key=<key>
```

---

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

1. Create a Git repository and add files
2. Push to GitHub (or GitLab)
3. Go to Cloudflare Dashboard → Pages
4. Create a new project and connect the repository
5. Build settings:

   * Framework preset: None
   * Build command: (leave empty)
   * Output directory: /
6. Deploy

### Option 2: GitHub Pages

1. Push repository to GitHub
2. Go to Repository Settings → Pages
3. Set source to:

   * Branch: main
   * Folder: / (root)
4. Save and wait for deployment

---

## Domain Configuration

1. Add a custom domain:
   api.muffinjuice.xyz

2. In Cloudflare:

   * Ensure DNS is proxied (orange cloud enabled)
   * Point domain to Pages or GitHub Pages

---

## Redirect Rule Configuration

Create a rule in Cloudflare:

* Match:
  https://api.muffinjuice.xyz/control*

* Target:
  https://trigger.macrodroid.com/<your-id>/control

* Status Code:
  302 (Temporary Redirect)

* Enable:
  Preserve Query String

---

## Usage

Open:
https://api.muffinjuice.xyz

Enter:

* Key (shared secret)
* Command (e.g., lock, aeroplane_on, location_on)

Click "Send" to execute the action on the device.

---

## Security Considerations

* The secret key is transmitted via URL query parameters
* Anyone with the URL can trigger actions if the key is known
* Recommendations:

  * Use a strong, non-trivial key
  * Restrict access via Cloudflare Access if needed
  * Avoid sharing URLs publicly

---

## Limitations

* No server-side validation beyond MacroDroid logic
* Redirect rules are static (no dynamic routing without Workers)
* Query parameters are visible in browser history

---

## Future Improvements

* Replace redirect rules with Cloudflare Workers for dynamic routing
* Add UI enhancements (mobile-first design, command buttons)
* Implement authentication via Cloudflare Access
* Add logging or feedback mechanism

---

## License

This project is provided as-is for personal use and experimentation.
