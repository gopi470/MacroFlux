const SHARED_NAV_STYLE = `
  :root {
    --teal: #00dca0;
    --teal-dim: rgba(0, 220, 160, 0.16);
    --border: rgba(0, 220, 160, 0.2);
    --border-hi: rgba(0, 220, 160, 0.4);
    --panel: rgba(5, 26, 20, 0.95);
    --r: 4px;
    --mono: 'Share Tech Mono', monospace;
    --ui: 'Rajdhani', sans-serif;
    --ease: cubic-bezier(0.23, 1, 0.32, 1);
  }
  .top-left-menu { position: fixed; top: 20px; left: 20px; z-index: 2000; }
  .nav-btn {
    width: 42px; height: 42px; background: rgba(0, 220, 160, 0.04);
    border: 1px solid rgba(0, 220, 160, 0.15); border-radius: var(--r);
    color: var(--teal); display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.25s var(--ease); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  .nav-btn:hover { background: rgba(0, 220, 160, 0.12); border-color: rgba(0, 220, 160, 0.4); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4); }
  .nav-btn svg { transition: transform 0.4s var(--ease); opacity: 0.8; }
  .nav-btn:hover svg { transform: rotate(90deg) scale(1.05); opacity: 1; }
  
  .nav-dropdown {
    position: absolute; top: calc(100% + 8px); left: 0;
    background: #020c08; border: 1px solid rgba(0, 220, 160, 0.3); border-radius: var(--r);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.95);
    display: flex; flex-direction: column; min-width: 220px;
    opacity: 0; pointer-events: none; transform: translateY(-8px);
    transition: all 0.2s var(--ease); overflow: hidden;
  }
  .nav-dropdown.open { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .nav-drop-item {
    padding: 14px 18px; color: rgba(0, 220, 160, 0.85);
    font-family: var(--mono); font-size: 11px; letter-spacing: 0.15em;
    text-decoration: none; border-bottom: 1px solid rgba(0, 220, 160, 0.06);
    transition: all 0.2s var(--ease); display: flex; align-items: center; border-left: 2px solid transparent;
  }
  .nav-drop-item:last-child { border-bottom: none; }
  .nav-drop-item:hover { background: rgba(0, 220, 160, 0.06); color: #fff; border-left-color: var(--teal); }
  .nav-drop-item svg { opacity: 0.6; transition: all 0.2s var(--ease); margin-right: 12px; flex-shrink: 0; }
  .nav-drop-item:hover svg { opacity: 1; }
  
  /* Ctrl/Meta key override for text selection on worker logs pages */
  body.ctrl-select-mode,
  body.ctrl-select-mode * {
    user-select: text !important;
    -webkit-user-select: text !important;
    cursor: auto !important;
  }
`;

const SHARED_NAV_HTML = `
  <div class="top-left-menu">
    <button class="nav-btn" onclick="document.getElementById('navDropdown').classList.toggle('open')" title="SYSTEM MENU">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
    <div class="nav-dropdown" id="navDropdown">
      <a href="/home" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        DASHBOARD
      </a>
      <a href="/schedule" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        SCHEDULER
      </a>
      <a href="/requests" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        HTTP LOGS
      </a>
      <a href="/statuslogs" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
        STATUS LOGS
      </a>
      <a href="/schedule/logs" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        SCHEDULE LOGS
      </a>
      <a href="/vault/list" class="nav-drop-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        VAULT
      </a>
      <a href="/logout" class="nav-drop-item" style="color:#ef4444; border-top:1px solid rgba(239,68,68,0.2)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        LOGOUT
      </a>
    </div>
  </div>
  <script>
    document.addEventListener('click', (e) => {
      const drop = document.getElementById('navDropdown');
      const menu = document.querySelector('.top-left-menu');
      if (drop && menu && !menu.contains(e.target)) {
        drop.classList.remove('open');
      }
    });

    // Universal Backspace Navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        const t = e.target;
        const isEditable = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          window.history.back();
        }
      }
    });

    // Ctrl/Meta Select Bypass
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        document.body.classList.add('ctrl-select-mode');
      }
    });
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        document.body.classList.remove('ctrl-select-mode');
      }
    });
    window.addEventListener('blur', () => {
      document.body.classList.remove('ctrl-select-mode');
    });

    // Absolute 30-Minute Session Timeout Check
    function checkSessionExpiry() {
      const match = document.cookie.match(/(?:^|; )__Host-session_expiry=([^;]*)/);
      if (match) {
        const expiryUnix = parseInt(match[1]);
        if (!isNaN(expiryUnix)) {
          const nowUnix = Math.floor(Date.now() / 1000);
          if (nowUnix >= expiryUnix) {
            console.warn("Session expired (absolute 30m timeout reached)");
            window.location.href = "/logout";
          }
        }
      } else {
        // If nav is present but cookie is missing, we are on a protected page so force logout
        console.warn("Session cookie not found, redirecting to logout");
        window.location.href = "/logout";
      }
    }
    checkSessionExpiry();
    setInterval(checkSessionExpiry, 5000);
  </script>

`;

// ── JWT Security Utilities (HS256) ──────────────────────────
const jwtUtils = {
  async base64urlEncode(data) {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  async base64urlDecode(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(base64);
    return new Uint8Array([...bin].map(c => c.charCodeAt(0)));
  },
  async sign(payload, secret) {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, enc.encode(tokenData));
    const encodedSignature = await this.base64urlEncode(signature);
    return `${tokenData}.${encodedSignature}`;
  },
  async verify(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [header, payload, signature] = parts;
      const tokenData = `${header}.${payload}`;
      const enc = new TextEncoder();
      const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
      const sigBuffer = await this.base64urlDecode(signature);
      const isValid = await crypto.subtle.verify("HMAC", key, sigBuffer, enc.encode(tokenData));
      if (!isValid) return null;
      const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      if (decodedPayload.exp && (Date.now() / 1000) > decodedPayload.exp) return null;
      return decodedPayload;
    } catch (e) { return null; }
  }
};

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const cookie = request.headers.get("Cookie") || "";
      
      let jwtSecret = env.JWT_SECRET;
      if (!jwtSecret) {
        if (env.LOCATION_KV) {
          jwtSecret = await env.LOCATION_KV.get("system_jwt_secret_fallback");
          if (!jwtSecret) {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            jwtSecret = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
            await env.LOCATION_KV.put("system_jwt_secret_fallback", jwtSecret);
          }
        } else {
          if (!globalThis.system_jwt_secret_fallback) {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            globalThis.system_jwt_secret_fallback = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
          }
          jwtSecret = globalThis.system_jwt_secret_fallback;
        }
      }

      const sessionCookie = cookie.split(';').map(c => c.trim()).find(row => row.startsWith('__Host-session='))?.split('=')[1];
      const decodedToken = sessionCookie ? await jwtUtils.verify(sessionCookie, jwtSecret) : null;
      const isLoggedIn = !!decodedToken;

      const logRequest = async (statusCode) => {
        try {
          if (url.searchParams.get("nosave") === "1") return;
          if (url.pathname === "/statuslogs") return; // Never log status logs page visits

          // Prevent D1 write flooding by completely skipping static asset requests
          const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|ico|json|woff2?|ttf|map)$/i.test(url.pathname);
          if (isAsset) return;

          // Never write D1 logs for background authentication/countdown heartbeats
          if (url.pathname === "/api/auth/check") return;

          const isNoisy = ["/poll", "/favicon.ico", "/requests"].includes(url.pathname);

          // Equalization Algorithm: Prevent /poll from taking over the hidden history
          if (url.pathname === "/poll" && Math.random() > 0.05) return;

          const ua = request.headers.get("user-agent") || "";
          const lowerUa = ua.toLowerCase();
          let source = "UNKNOWN";

          if (lowerUa.includes("macrodroid") || lowerUa.includes("dalvik")) {
            source = "MACRODROID DEVICE";
          } else if (lowerUa.includes("node-fetch") || lowerUa.includes("curl") || lowerUa.includes("python")) {
            source = "API SCRIPT";
          } else if (lowerUa.includes("mozilla") || lowerUa.includes("chrome") || lowerUa.includes("safari")) {
            let browser = "WEB BROWSER";
            const chUa = request.headers.get("sec-ch-ua") || "";
            if (lowerUa.includes("brave") || chUa.includes("Brave")) browser = "BRAVE";
            else if (lowerUa.includes("edg/")) browser = "EDGE";
            else if (lowerUa.includes("opr/") || lowerUa.includes("opera")) browser = "OPERA";
            else if (lowerUa.includes("vivaldi")) browser = "VIVALDI";
            else if (lowerUa.includes("samsungbrowser")) browser = "SAMSUNG BROWSER";
            else if (lowerUa.includes("firefox")) browser = "FIREFOX";
            else if (lowerUa.includes("chrome")) browser = "CHROME";
            else if (lowerUa.includes("safari") && !lowerUa.includes("chrome")) browser = "SAFARI";

            const isMobile = lowerUa.includes("mobi") || lowerUa.includes("android") || lowerUa.includes("iphone") || lowerUa.includes("ipad");

            let deviceType = "DESKTOP";
            if (isMobile) {
              let brand = "MOBILE";
              if (lowerUa.includes("iphone") || lowerUa.includes("ipad")) brand = "APPLE";
              else if (lowerUa.includes("sm-") || lowerUa.includes("samsung")) brand = "SAMSUNG";
              else if (lowerUa.includes("pixel")) brand = "PIXEL";
              else if (lowerUa.includes("oneplus")) brand = "ONEPLUS";
              else if (lowerUa.includes("xiaomi") || lowerUa.includes("redmi") || lowerUa.includes("poco")) brand = "XIAOMI";
              else if (lowerUa.includes("huawei")) brand = "HUAWEI";
              else if (lowerUa.includes("moto")) brand = "MOTOROLA";
              else if (lowerUa.includes("vivo")) brand = "VIVO";
              else if (lowerUa.includes("oppo")) brand = "OPPO";
              deviceType = brand;
            }
            source = `${browser} (${deviceType})`;
          } else {
            source = ua.substring(0, 20);
          }

          const cf = request.cf || {};
          const location = cf.country ? `${cf.city || "Unknown"}, ${cf.region || "Unknown"}, ${cf.country}` : "Global";

          await env.DB.prepare(
            "INSERT INTO logs (timestamp, method, path, status, ip, source, noisy, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
          ).bind(
            Date.now(),
            request.method,
            url.pathname,
            statusCode,
            request.headers.get("cf-connecting-ip") || "0.0.0.0",
            source,
            isNoisy ? 1 : 0,
            location
          ).run();

          // Auto-cleanup: 3-tier quota — 2200 Default, 300 Hidden, 500 Blocked (total 3000)
          if (Math.random() < 0.05) {
            ctx.waitUntil(Promise.all([
              env.DB.prepare("DELETE FROM logs WHERE status != 401 AND noisy = 0 AND id IN (SELECT id FROM logs WHERE status != 401 AND noisy = 0 ORDER BY timestamp DESC LIMIT -1 OFFSET 2200)").run(),
              env.DB.prepare("DELETE FROM logs WHERE status != 401 AND noisy = 1 AND id IN (SELECT id FROM logs WHERE status != 401 AND noisy = 1 ORDER BY timestamp DESC LIMIT -1 OFFSET 300)").run(),
              env.DB.prepare("DELETE FROM logs WHERE status = 401 AND id IN (SELECT id FROM logs WHERE status = 401 ORDER BY timestamp DESC LIMIT -1 OFFSET 500)").run()
            ]));
          }
        } catch (e) {
          console.error("LOG_FAIL:", e.message);
        }
      };

      const handleRequest = async () => {
        const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
        const cf = request.cf || {};
        const location = cf.country ? `${cf.city || "Unknown"}, ${cf.region || "Unknown"}, ${cf.country}` : "Global Intelligence Grid";

        // Redirect to home if already logged in and visiting root, index.html or login page
        if ((url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/login") && isLoggedIn) {
          return Response.redirect(url.origin + "/home", 302);
        }

        // Auth status endpoint for client check
        if (url.pathname === "/api/auth/check") {
          const attemptsKey = `login_attempts:${ip}`;
          let attempts = 0;
          let expiresAt = 0;
          if (env.LOCATION_KV) {
            const val = await env.LOCATION_KV.get(attemptsKey);
            if (val) {
              try {
                const data = JSON.parse(val);
                attempts = data.count || 0;
                expiresAt = data.expiresAt || 0;
              } catch (e) {
                attempts = parseInt(val) || 0;
              }
            }
          }

          const rateLimited = (attempts >= 5);
          const remainingSeconds = rateLimited ? Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)) : 0;

          return new Response(JSON.stringify({
            loggedIn: isLoggedIn,
            rateLimited: rateLimited,
            seconds: remainingSeconds
          }), {
            headers: { 
              "Content-Type": "application/json",
              "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
            }
          });
        }

        // 1. Handle Login Request
        if (url.pathname === "/login") {
          const key = url.searchParams.get("key");
          const secretKey = env.ACCESS_KEY;

          const attemptsKey = `login_attempts:${ip}`;
          let attempts = 0;
          let expiresAt = 0;
          if (env.LOCATION_KV) {
            const val = await env.LOCATION_KV.get(attemptsKey);
            if (val) {
              try {
                const data = JSON.parse(val);
                attempts = data.count || 0;
                expiresAt = data.expiresAt || 0;
              } catch (e) {
                attempts = parseInt(val) || 0;
              }
            }
          }

          if (attempts >= 5) {
            const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
            return Response.redirect(url.origin + "/?error=rate_limit&seconds=" + remainingSeconds, 302);
          }

          if (key === secretKey) {
            if (env.LOCATION_KV) {
              await env.LOCATION_KV.delete(attemptsKey);
            }
            // Issue a 30-minute JWT
            const token = await jwtUtils.sign({
              sub: "admin",
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + 1800
            }, jwtSecret);

            const sessionExpiry = Math.floor(Date.now() / 1000) + 1800;

            const headers = new Headers();
            headers.append("Location", "/home?login=success");
            headers.append("Set-Cookie", `__Host-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800; Secure`);
            headers.append("Set-Cookie", `__Host-session_expiry=${sessionExpiry}; Path=/; SameSite=Lax; Max-Age=1800; Secure`);

            return new Response(null, {
              status: 302,
              headers: headers
            });
          }

          if (env.LOCATION_KV) {
            attempts += 1;
            const newExpiry = expiresAt || (Date.now() + 900 * 1000);
            await env.LOCATION_KV.put(attemptsKey, JSON.stringify({ count: attempts, expiresAt: newExpiry }), { expirationTtl: 900 });
          }
          return Response.redirect(url.origin + "/?error=1", 302);
        }

        // 2. Handle Logout
        if (url.pathname === "/logout") {
          const headers = new Headers();
          headers.append("Location", "/");
          headers.append("Set-Cookie", "__Host-session=; Path=/; Max-Age=0; Secure");
          headers.append("Set-Cookie", "__Host-session_expiry=; Path=/; Max-Age=0; Secure");
          return new Response(null, {
            status: 302,
            headers: headers
          });
        }

        // 3. Handle Home/Dashboard
        if (url.pathname === "/home") {
          if (!isLoggedIn) return renderUnauthorized();
          const response = await env.ASSETS.fetch(new Request(url.origin + "/home.html"));
          return new HTMLRewriter()
            .on(".top-left-menu", {
              element(el) { el.replace(SHARED_NAV_HTML, { html: true }); }
            })
            .transform(response);
        }

        if (url.pathname === "/schedule") {
          if (!isLoggedIn) return renderUnauthorized();
          const response = await env.ASSETS.fetch(new Request(url.origin + "/schedule.html"));
          return new HTMLRewriter()
            .on(".top-left-menu", {
              element(el) { el.replace(SHARED_NAV_HTML, { html: true }); }
            })
            .transform(response);
        }

        // Helper for Tactical API Responses
        const renderTactical = (msg, code = 200) => {
          return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; display: flex; align-items: center; justify-content: center; height: 100vh; font-size: 14px; }
    .box { border: 1px solid rgba(0,220,160,0.4); padding: 30px 50px; background: rgba(0,220,160,0.05); text-align: center; letter-spacing: 2px; }
    .err { color: #f87171; border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
  </style>
</head>
<body>
  <div class="box ${code !== 200 ? 'err' : ''}">
    <div style="font-size:10px; opacity:0.5; margin-bottom:12px;">SYSTEM ENDPOINT RESPONSE</div>
    <div>[ ${msg} ]</div>
  </div>
</body></html>`, { status: code, headers: { "Content-Type": "text/html; charset=UTF-8" } });
        };

        // Helper for Unauthorized Access (Countdown Redirect)
        const renderUnauthorized = () => {
          const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
          const cf = request.cf || {};
          const location = cf.country ? (cf.city || "Unknown") + ", " + cf.country : "Global Intelligence Grid";

          return new Response('<!DOCTYPE html>' +
            '<html lang="en">' +
            '<head>' +
            '  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '  <title>Unauthorized Access</title>' +
            '  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">' +
            '  <style>' +
            '    * { box-sizing: border-box; margin: 0; padding: 0; }' +
            '    body { background: #020608; color: #ef4444; font-family: \'Share Tech Mono\', monospace; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }' +
            '    .alert-box { border: 1px solid rgba(239, 68, 68, 0.15); padding: 40px; background: rgba(239, 68, 68, 0.02); max-width: 420px; width: 95%; position: relative; border-radius: 4px; }' +
            '    h1 { font-size: 18px; letter-spacing: 2px; margin-bottom: 25px; text-transform: uppercase; font-weight: normal; color: #fff; text-align: center; }' +
            '    .detail { font-size: 11px; margin-bottom: 12px; opacity: 0.7; letter-spacing: 1px; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(239, 68, 68, 0.05); padding-bottom: 8px; }' +
            '    .detail span { color: #00dca0; }' +
            '    .timer-wrap { margin-top: 30px; text-align: center; }' +
            '    .timer { font-size: 10px; margin-bottom: 20px; letter-spacing: 2px; color: rgba(239,68,68,0.5); }' +
            '    #count { font-size: 22px; color: #fff; }' +
            '    .btn { background: #ef4444; color: #000; border: none; padding: 14px 28px; font-family: inherit; cursor: pointer; font-size: 11px; letter-spacing: 2px; transition: all 0.2s; text-decoration: none; display: inline-block; border-radius: 2px; }' +
            '    .btn:hover { background: #fff; color: #ef4444; }' +
            '  </style>' +
            '</head>' +
            '<body>' +
            '  <div class="alert-box">' +
            '    <h1>UNAUTHORIZED ACCESS</h1>' +
            '    <div class="detail">Target: <span>' + url.pathname + '</span></div>' +
            '    <div class="detail">Your IP: <span>' + ip + '</span></div>' +
            '    <div class="detail">Location: <span>' + location + '</span></div>' +
            '    <div class="detail">Status: <span>Restricted</span></div>' +
            '    ' +
            '    <div class="timer-wrap">' +
            '      <div class="timer">Redirecting in <span id="count">7</span>s</div>' +
            '      <a href="/" class="btn">LOGIN NOW</a>' +
            '    </div>' +
            '  </div>' +
            '  <script>' +
            '    let c = 7;' +
            '    const t = setInterval(() => {' +
            '      c--;' +
            '      document.getElementById(\'count\').innerText = c;' +
            '      if (c <= 0) {' +
            '        clearInterval(t);' +
            '        window.location.href = \'/\';' +
            '      }' +
            '    }, 1000);' +
            '    document.addEventListener("keydown", (e) => { if(e.key === "Backspace") window.history.back(); });' +
            '  </script>' +
            '</body></html>', { status: 401, headers: { "Content-Type": "text/html; charset=UTF-8" } });
        };

        // ── Centralized System Endpoint Auth Guard ─────────────────────────
        // Public routes: always accessible without a session
        const PUBLIC_ROUTES = new Set(["/", "/index.html", "/login", "/logout", "/api/auth/check"]);
        // Device routes: use secret REPORT_KEY instead of a session cookie (called by Android device)
        const DEVICE_KEY_ROUTES = new Set(["/status", "/report", "/upload"]);

        const isPublicRoute   = PUBLIC_ROUTES.has(url.pathname);
        const isDeviceRoute   = DEVICE_KEY_ROUTES.has(url.pathname);
        const isStaticAsset   = /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map)$/i.test(url.pathname);

        // Block all unrecognised system routes for unauthenticated users
        if (!isPublicRoute && !isDeviceRoute && !isStaticAsset && !isLoggedIn) {
          return renderUnauthorized();
        }
        // ──────────────────────────────────────────────────────────────────

        // ── Update Hardware Status (/status) ──────────────────
        if (url.pathname === "/status") {
          const { searchParams } = url;
          if (searchParams.get("key") !== env.REPORT_KEY) {
            return renderTactical("UNAUTHORIZED", 401);
          }

          // Dynamically capture all incoming parameters
          const hardwareData = { updated: Date.now() };
          for (const [k, v] of searchParams.entries()) {
            if (k !== "key") hardwareData[k] = v;
          }

          // ── Persistent Status Merging ──
          const existingStatusRaw = await env.LOCATION_KV.get("status");
          let mergedData = { ...hardwareData };
          if (existingStatusRaw) {
            try {
              const existingStatus = JSON.parse(existingStatusRaw);
              // Merge incoming into existing, ensuring 'updated' is always the newest
              mergedData = { ...existingStatus, ...hardwareData };
            } catch (e) { }
          }

          // ── Clean & Resolve NetMonster Status ──
          const cleanNetmonster = (s) => {
            if (!s) return "";
            const trimmed = s.trim();
            const lower = trimmed.toLowerCase();
            if (lower === "netmonster" || lower === "n/a" || lower === "null" || lower === "undefined") {
              return "";
            }
            return trimmed;
          };

          const s1 = cleanNetmonster(mergedData.netmonster_status);
          const s2 = cleanNetmonster(mergedData.netmonster_status2);

          const resolvedNetmonster = s1 || s2;
          if (resolvedNetmonster) {
            mergedData.netmonster_status = resolvedNetmonster;
          } else if (mergedData.netmonster_status && cleanNetmonster(mergedData.netmonster_status) === "") {
            mergedData.netmonster_status = "—";
          }

          // Persist to D1 for history (using merged data to avoid 0s on partial updates)
          try {
            const battery = parseInt(mergedData.battery_level || "0");
            const battStatus = (mergedData.battery_status || "").toLowerCase().trim();
            const charging = (battStatus === "on" || battStatus.includes("charging") || mergedData.battery_status === "1") ? 1 : 0;

            const signal = parseInt(mergedData.signal_strength || "0");
            const rawTemp = mergedData.battery_temperature || "0";
            const temp = rawTemp.includes("°") ? rawTemp : (rawTemp === "0" ? "0°C" : rawTemp + "°C");
            const uptime = mergedData.phone_uptime || "Unknown";

            const extraData = JSON.stringify({
              torch: mergedData.glyphtorch_status,
              alarm: mergedData.alaram_volume,
              media: mergedData.media_volume,
              ringer: mergedData.ringer_volume,
              notif: mergedData.notification_volume,
              location: mergedData.location_status,
              wifi: mergedData.wifi_status,
              bluetooth: mergedData.bluetooth_status,
              batt_status: mergedData.battery_status,
              netmonster: mergedData.netmonster_status
            });

            let commandToStore = searchParams.get("command") || searchParams.get("cmd") || "";
            if (!commandToStore) {
              const lastCmdRaw = await env.LOCATION_KV.get("last_sent_command");
              if (lastCmdRaw) {
                try {
                  const lastCmd = JSON.parse(lastCmdRaw);
                  if (Date.now() - lastCmd.timestamp < 60000) {
                    commandToStore = lastCmd.command;
                    await env.LOCATION_KV.delete("last_sent_command");
                  }
                } catch (e) {}
              }
            }

            await env.DB.prepare(
              "INSERT INTO status_logs (timestamp, battery, charging, signal, temperature, uptime, ip, location, extra_data, command) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(Date.now(), battery, charging, signal, temp, uptime, ip, location, extraData, commandToStore).run();
          } catch (e) {
            console.error("D1 Hardware Log Error:", e);
          }

          await env.LOCATION_KV.put("status", JSON.stringify(mergedData));
          return renderTactical("OK STATUS", 200);
        }

        // ── Update Location Link (/report) ──────────────────────
        if (url.pathname === "/report") {
          const { searchParams } = url;
          if (searchParams.get("key") !== env.REPORT_KEY) {
            return renderTactical("UNAUTHORIZED", 401);
          }

          const link = searchParams.get("link");
          if (link) {
            await env.LOCATION_KV.put("location", JSON.stringify({ link, updated: Date.now() }));
            return renderTactical("OK LOCATION", 200);
          }
          return renderTactical("MISSING LINK", 400);
        }

        if (url.pathname === "/poll") {
          if (!isLoggedIn) return renderUnauthorized();

          const [status, location] = await Promise.all([
            env.LOCATION_KV.get("status", { type: "json" }),
            env.LOCATION_KV.get("location", { type: "json" })
          ]);

          const accept = request.headers.get("Accept") || "";
          if (accept.includes("text/html")) {
            const payload = JSON.stringify({ status, location }, null, 2);
            return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Status</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 40px; font-size: 14px; }
    h2 { letter-spacing: 5px; font-size: 16px; margin-bottom: 20px; border-bottom: 1px solid rgba(0,220,160,0.4); padding-bottom: 10px; }
    pre { background: rgba(0,220,160,0.05); padding: 20px; border: 1px solid rgba(0,220,160,0.2); overflow-x: auto; font-size: 12px; }
  </style>
</head>
<body>
  <h2>[ RAW POLLING STATE ]</h2>
  <pre>${payload}</pre>
</body>
</html>`, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
          }

          return new Response(JSON.stringify({ status, location }), {
            headers: { "Content-Type": "application/json" }
          });
        }

        if (url.pathname === "/control") {
          if (!isLoggedIn) return renderUnauthorized();

          const cmd = url.searchParams.get("cmd");
          const key = url.searchParams.get("key"); // This is the MACROS KEY
          const cmd2 = url.searchParams.get("cmd2");
          const cmd3 = url.searchParams.get("cmd3");
          const cmd4 = url.searchParams.get("cmd4");
          const cmd5 = url.searchParams.get("cmd5");

          const macroId = env.MACRO_ID || "PASTE_YOUR_ID_FOR_LOCAL_TESTING";
          let target = `https://trigger.macrodroid.com/${macroId}/control?cmd=${cmd}&key=${key}`;
          if (cmd2) target += `&cmd2=${encodeURIComponent(cmd2)}`;
          if (cmd3) target += `&cmd3=${encodeURIComponent(cmd3)}`;
          if (cmd4) target += `&cmd4=${encodeURIComponent(cmd4)}`;
          if (cmd5) target += `&cmd5=${encodeURIComponent(cmd5)}`;

          const response = await fetch(target);

          if (response.ok) {
            let commandDesc = cmd;
            if (cmd === "set_volume") {
              commandDesc = `set_volume (media: ${cmd2 || 0}, ringer: ${cmd3 || 0}, notif: ${cmd4 || 0}, alarm: ${cmd5 || 0})`;
            } else if (cmd2) {
              commandDesc = `${cmd} (${cmd2})`;
            }
            try {
              await env.LOCATION_KV.put("last_sent_command", JSON.stringify({
                command: commandDesc,
                timestamp: Date.now()
              }));
            } catch (kvErr) {
              console.error("Failed to write last_sent_command to KV", kvErr);
            }
          }

          // Optimistically update KV so the UI doesn't bounce back during next poll
          if (response.ok && cmd === "set_volume") {
            try {
              const existingStatusRaw = await env.LOCATION_KV.get("status");
              if (existingStatusRaw) {
                let existingStatus = JSON.parse(existingStatusRaw);
                if (cmd2) existingStatus.media_volume = cmd2;
                if (cmd3) existingStatus.ringer_volume = cmd3;
                if (cmd4) existingStatus.notification_volume = cmd4;
                if (cmd5) existingStatus.alaram_volume = cmd5;
                existingStatus.updated = Date.now();
                await env.LOCATION_KV.put("status", JSON.stringify(existingStatus));
              }
            } catch (e) {
              console.error("Failed to optimistic update volumes", e);
            }
          }

          return response;
        }

        if (url.pathname === "/api/macros/execute") {
          if (!isLoggedIn) return renderUnauthorized();
          if (request.method !== "POST") return new Response("POST REQUIRED", { status: 405 });

          try {
            const { commands, key } = await request.json();
            if (!commands || !key) return new Response("MISSING PARAMS", { status: 400 });

            const macroId = env.MACRO_ID || "PASTE_YOUR_ID_FOR_LOCAL_TESTING";
            const results = [];

            for (const cmd of commands) {
              // Add a small delay between internal fetches to avoid rate limits/congestion
              await new Promise(r => setTimeout(r, 200));
              const target = `https://trigger.macrodroid.com/${macroId}/control?cmd=${encodeURIComponent(cmd)}&key=${key}`;
              const res = await fetch(target);
              results.push({ cmd, ok: res.ok });
            }

            const okCmds = results.filter(r => r.ok).map(r => r.cmd);
            if (okCmds.length > 0) {
              try {
                await env.LOCATION_KV.put("last_sent_command", JSON.stringify({
                  command: okCmds.join(", "),
                  timestamp: Date.now()
                }));
              } catch (kvErr) {
                console.error("Failed to write last_sent_command to KV", kvErr);
              }
            }

            return new Response(JSON.stringify({ success: true, results }), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), {
              status: 500, headers: { "Content-Type": "application/json" }
            });
          }
        }

        // ── File Vault Storage (/upload) ────────────────────────
        if (url.pathname === "/upload") {
          if (request.method !== "POST") {
            return renderTactical("UPLOAD ENDPOINT ACTIVE (POST REQUIRED)", 405);
          }
          try {
            const { searchParams } = url;
            const providedKey = searchParams.get("key");
            const secretKey = env.REPORT_KEY;

            if (providedKey !== secretKey) {
              return renderTactical("UNAUTHORIZED", 401);
            }

            const type = searchParams.get("type") || "image";
            const receivedAt = Date.now(); // Server receipt timestamp
            const fileId = `${type}_${receivedAt}`;
            const blob = await request.arrayBuffer();

            if (!blob || blob.byteLength === 0) {
              return renderTactical("EMPTY PAYLOAD", 400);
            }

            // Map types to proper mime-types
            let contentType = "application/octet-stream";
            if (type === "image") contentType = "image/jpeg";
            else if (type === "audio") contentType = "audio/aac";
            else if (type === "video") contentType = "video/mp4";

            const vaultLink = `/vault/${fileId}`;

            // Store raw binary data in KV
            await env.LOCATION_KV.put(`vault_${fileId}`, blob, {
              metadata: { contentType, receivedAt, size: blob.byteLength }
            });

            // Index the file in D1 for fast, quota-free listing
            await env.DB.prepare(
              "INSERT INTO vault_files (id, type, size, content_type, timestamp) VALUES (?, ?, ?, ?, ?)"
            ).bind(fileId, type.toUpperCase(), blob.byteLength, contentType, receivedAt).run();

            // Automatically update the terminal's live polling feed
            await env.LOCATION_KV.put("location", JSON.stringify({ link: vaultLink, updated: Date.now() }));

            return renderTactical(vaultLink, 200);
          } catch (err) {
            return renderTactical(`UPLOAD CRASH: ${err.message}`, 500);
          }
        }

        // ── File Vault Delete (/vault/delete) ───────────────────
        if (url.pathname === "/vault/delete") {
          try {
            if (!isLoggedIn) return renderUnauthorized();
            const fileId = url.searchParams.get("id");
            if (!fileId) return new Response("MISSING ID", { status: 400 });

            await Promise.all([
              env.LOCATION_KV.delete(`vault_${fileId}`),
              env.DB.prepare("DELETE FROM vault_files WHERE id = ?").bind(fileId).run()
            ]);

            return new Response("DELETED", { status: 200 });
          } catch (err) {
            return new Response(`DELETE CRASH: ${err.message}`, { status: 500 });
          }
        }

        if (url.pathname === "/schedule/create") {
          if (!isLoggedIn) return renderUnauthorized();

          const cmd = url.searchParams.get("cmd");
          const cmd2 = url.searchParams.get("cmd2") || "";
          const key = url.searchParams.get("key") || "";
          const targetTime = parseInt(url.searchParams.get("time"));

          if (!cmd || !targetTime) return renderTactical("INVALID PARAMS", 400);
          if (!key) return renderTactical("MACROS KEY REQUIRED", 400);

          // Rule 1: Max 3 months from now
          const maxFuture = Date.now() + (90 * 24 * 60 * 60 * 1000);
          if (targetTime > maxFuture) return renderTactical("EXCEEDS 3-MONTH LIMIT", 400);
          if (targetTime < Date.now()) return renderTactical("TIME MUST BE IN FUTURE", 400);

          // Rule 2: No 2 triggers at the exact same minute
          const targetMin = Math.floor(targetTime / 60000) * 60000;
          try {
            const existing = await env.DB.prepare(
              "SELECT id FROM command_schedules WHERE target_time >= ? AND target_time < ? AND status = 'PENDING'"
            ).bind(targetMin, targetMin + 60000).first();

            if (existing) return renderTactical("TIME CONFLICT: TRIGGER ALREADY EXISTS", 409);

            await env.DB.prepare(
              "INSERT INTO command_schedules (command, params, secret_key, target_time, created_at) VALUES (?, ?, ?, ?, ?)"
            ).bind(cmd, cmd2, key, targetTime, Date.now()).run();
            return renderTactical("SCHEDULED", 200);
          } catch (e) {
            return renderTactical(`DB ERROR: ${e.message}`, 500);
          }
        }

        // ── Schedule Cancellation (/schedule/cancel) ────────────
        if (url.pathname === "/schedule/cancel") {
          if (!isLoggedIn) return renderUnauthorized();
          const id = url.searchParams.get("id");
          if (!id) return renderTactical("MISSING ID", 400);

          try {
            await env.DB.prepare("UPDATE command_schedules SET status = 'CANCELLED' WHERE id = ?").bind(id).run();
            return renderTactical("CANCELLED", 200);
          } catch (e) {
            return renderTactical(`DB ERROR: ${e.message}`, 500);
          }
        }

        // ── File Vault Retrieval (/vault/:id) ──────────────────
        if (url.pathname.startsWith("/vault/") && !["/vault/list", "/vault/display", "/vault/auth", "/vault/delete", "/vault/logout"].includes(url.pathname)) {
          try {
            if (!isLoggedIn) return renderUnauthorized();

            const vaultPass = (env.VAULT_PASS || "").trim();
            const cookies = request.headers.get("Cookie") || "";
            const isVaultAuthenticated = cookies.includes("__Host-vault_token=authorized");

            if (vaultPass && !isVaultAuthenticated) {
              return Response.redirect(url.origin + "/vault/auth?next=" + encodeURIComponent(url.pathname), 302);
            }

            const fileId = url.pathname.replace("/vault/", "");
            const { value, metadata } = await env.LOCATION_KV.getWithMetadata(`vault_${fileId}`, { type: "arrayBuffer" });

            if (!value) return new Response("FILE NOT FOUND", { status: 404 });

            const totalLength = value.byteLength;
            const rangeHeader = request.headers.get("Range");

            if (rangeHeader && rangeHeader.startsWith("bytes=")) {
              const parts = rangeHeader.replace(/bytes=/, "").split("-");
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1;

              if (start >= 0 && end < totalLength && start <= end) {
                const chunk = value.slice(start, end + 1);
                return new Response(chunk, {
                  status: 206,
                  headers: {
                    "Content-Type": metadata?.contentType || "application/octet-stream",
                    "Content-Disposition": "inline",
                    "Content-Range": `bytes ${start}-${end}/${totalLength}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunk.byteLength.toString(),
                    "Cache-Control": "public, max-age=3600"
                  }
                });
              }
            }

            return new Response(value, {
              headers: {
                "Content-Type": metadata?.contentType || "application/octet-stream",
                "Content-Disposition": "inline",
                "Accept-Ranges": "bytes",
                "Content-Length": totalLength.toString(),
                "Cache-Control": "public, max-age=3600"
              }
            });
          } catch (err) {
            return new Response(`VAULT CRASH: ${err.message}`, { status: 500 });
          }
        }

        // ── Vault Authentication Gateway (/vault/auth) ──────────
        if (url.pathname === "/vault/auth") {
          if (!isLoggedIn) return renderUnauthorized();

          const vaultPass = (env.VAULT_PASS || "").trim();
          const cookies = request.headers.get("Cookie") || "";
          const isVaultAuthenticated = cookies.includes("__Host-vault_token=authorized");

          // Handle Password Submission (POST)
          if (request.method === "POST") {
            try {
              const rawBody = (await request.text()).trim();
              const pass = atob(rawBody).trim();

              if (vaultPass && pass === vaultPass) {
                return new Response("OK", {
                  headers: { "Set-Cookie": "__Host-vault_token=authorized; Path=/; HttpOnly; SameSite=Lax; Max-Age=600; Secure" }
                });
              }
              return new Response("INVALID", { status: 403 });
            } catch (err) {
              return new Response(`AUTH ERROR: ${err.message}`, { status: 500 });
            }
          }

          // Handle Authentication Page (GET)
          // If already authenticated, redirect to list immediately
          if (isVaultAuthenticated) {
            const next = url.searchParams.get("next") || "/vault/list";
            return Response.redirect(url.origin + next, 302);
          }
          const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vault Authorization</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #000; color: #00dca0; font-family: 'Courier New', monospace; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; user-select: none; -webkit-user-select: none; }
    .auth-card { position: relative; background: #050505; border: 1px solid #ff3e3e; padding: 40px 24px; border-radius: 4px; width: calc(100% - 40px); max-width: 340px; text-align: center; box-shadow: 0 0 10px rgba(255, 62, 62, 0.05); }
    .close-btn { position: absolute; top: 12px; right: 15px; color: rgba(255, 62, 62, 0.4); text-decoration: none; font-size: 18px; transition: color 0.2s; }
    .close-btn:hover { color: #ff3e3e; }
    h2 { font-size: 13px; letter-spacing: 4px; margin-bottom: 15px; color: #ff3e3e; font-weight: bold; }
    p { font-size: 9px; color: rgba(255, 62, 62, 0.5); margin-bottom: 25px; line-height: 1.6; letter-spacing: 1px; }
    .input-group { position: relative; margin-bottom: 20px; }
    input { background: rgba(255, 62, 62, 0.03); border: 1px solid rgba(255, 62, 62, 0.2); color: #ff3e3e; padding: 12px; width: 100%; border-radius: 2px; text-align: center; font-family: inherit; outline: none; transition: all 0.2s; font-size: 11px; }
    input:focus { border-color: #ff3e3e; background: rgba(255, 62, 62, 0.08); box-shadow: 0 0 8px rgba(255, 62, 62, 0.1); }
    input:focus::placeholder { color: transparent; }
    .btn-wrap { display: flex; justify-content: center; }
    button { background: #ff3e3e; color: #fff; border: none; padding: 10px 24px; min-width: 140px; border-radius: 2px; cursor: pointer; font-family: inherit; font-weight: bold; letter-spacing: 2px; font-size: 11px; transition: all 0.2s; }
    button:hover { background: #e11d48; box-shadow: 0 0 12px rgba(255, 62, 62, 0.3); transform: translateY(-1px); }
    button:active { transform: translateY(0); }
    .err { color: #ff3e3e; font-size: 9px; margin-top: 15px; display: none; font-weight: bold; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="auth-card">
    <a href="/home" class="close-btn" title="ABORT ACCESS">&times;</a>
    <h2>VAULT LOCKED</h2>
    <p>VAULT KEY IS REQUIRED TO ACCESS VAULT</p>
    <div class="input-group">
      <input type="password" id="vlt_input" name="vault_access_key_${Math.random().toString(36).substring(7)}" placeholder="ENTER ACCESS KEY..." onkeypress="if(event.key==='Enter') login()" autocomplete="off" data-lpignore="true">
    </div>
    <div class="btn-wrap">
      <button onclick="login()">AUTHORIZE</button>
    </div>
    <div id="errMsg" class="err">ACCESS KEY DENIED</div>
  </div>
  <script>
    document.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && e.target.tagName !== 'INPUT') window.history.back(); });
    async function login() {
      const p = document.getElementById('vlt_input').value;
      if (!p) return;
      const resp = await fetch('/vault/auth', { method: 'POST', body: btoa(p) });
      if (resp.ok) {
        const params = new URLSearchParams(window.location.search);
        const next = params.get('next') || '/vault/list';
        window.location.href = next;
      }
      else {
        const errTxt = await resp.text();
        const errDiv = document.getElementById('errMsg');
        errDiv.innerText = errTxt.includes('AUTH_ERROR') ? errTxt : 'ACCESS KEY DENIED';
        errDiv.style.display = 'block';
        const inp = document.getElementById('vlt_input');
        inp.value = '';
        inp.focus();
      }
    }
  </script>
</body>
</html>`;
          return new Response(loginHtml, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
        }

        // ── Vault Logout (/vault/logout) ────────────────────────
        if (url.pathname === "/vault/logout") {
          return new Response("", {
            status: 302,
            headers: {
              "Set-Cookie": "__Host-vault_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure",
              "Location": "/vault/list"
            }
          });
        }

        // ── Vault Standalone Display (/vault/display) ───────────
        if (url.pathname === "/vault/display") {
          if (!isLoggedIn) return renderUnauthorized();
          return env.ASSETS.fetch(new Request(url.origin + "/vault-display.html"));
        }

        // ── File Vault Index (/vault/list) ──────────────────────
        if (url.pathname === "/vault/list") {
          try {
            if (!isLoggedIn) return renderUnauthorized();

            const vaultPass = (env.VAULT_PASS || "").trim();
            const cookies = request.headers.get("Cookie") || "";
            const isVaultAuthenticated = cookies.includes("__Host-vault_token=authorized");

            if (vaultPass && !isVaultAuthenticated) {
              return Response.redirect(url.origin + "/vault/auth?next=" + encodeURIComponent(url.pathname), 302);
            }

            try {
              // Fetch file list from D1 SQL Index (Quota-free & Unlimited)
              const { results: dbFiles } = await env.DB.prepare("SELECT * FROM vault_files ORDER BY timestamp DESC LIMIT 500").all();

              const rows = dbFiles.map(r => {
                const date = new Date(r.timestamp);
                const timeStr = date.toLocaleString('en-US', {
                  timeZone: 'Asia/Kolkata',
                  month: 'short', day: 'numeric',
                  hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
                });

                const sizeMB = (r.size / (1024 * 1024)).toFixed(2);
                const receivedStr = timeStr; // Legacy fallback

                // Estimated duration
                let duration = "--";
                if (r.type === "AUDIO" && r.size > 0) {
                  const secs = Math.round(r.size / (128 * 1024 / 8));
                  duration = secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
                } else if (r.type === "VIDEO" && r.size > 0) {
                  const secs = Math.round(r.size / (3 * 1024 * 1024 / 8));
                  duration = secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`;
                }

                return { id: r.id, typeStr: r.type, timeStr, receivedStr, sizeMB, contentType: r.content_type, duration };
              });

              let tableRows = rows.map(r => `
            <tr id="row_${r.id}">
              <td>${r.id.replace(/_/g, ' ')}</td>
              <td>${r.receivedStr}</td>
              <td class="type-${r.typeStr.toLowerCase()}">${r.typeStr}</td>
              <td style="opacity:0.9; font-size:11px;">${r.contentType}</td>
              <td>${r.sizeMB} MB</td>
              <td>${r.duration}</td>
              <td style="display:flex; gap:6px; align-items:center;">
                <a href="/vault/display?id=${r.id}&type=${r.typeStr.toLowerCase()}">>> OPEN IN HUD</a>
                <button onclick="deleteVaultItem('${r.id}', this)" style="background:rgba(239,68,68,0.08); color:#f87171; border:1px solid rgba(239,68,68,0.3); padding:3px 8px; border-radius:3px; font-size:11px; cursor:pointer; font-family:inherit;">DELETE</button>
              </td>
            </tr>`).join("");

              let totalMB = 0;
              rows.forEach(r => {
                totalMB += parseFloat(r.sizeMB);
              });

              const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>File Vault</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px 24px 24px 76px; font-size: 13px; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 25px; padding-left: 0; margin-top: -4px; }
    .vault-logout { display: inline-block; background: rgba(239,68,68,0.08); color: #f87171; border: 1px solid rgba(239,68,68,0.2); font-size: 10px; padding: 7px 16px; text-decoration: none; font-weight: bold; letter-spacing: 1px; border-radius: 3px; transition: all 0.2s; }
    .vault-logout:hover { background: rgba(239,68,68,0.15); border-color: #f87171; box-shadow: 0 0 15px rgba(239,68,68,0.1); }
    .count { opacity: 0.8; font-size: 11px; }
    .table-wrapper { overflow-x: auto; width: 100%; }
    .table-wrapper::-webkit-scrollbar { height: 4px; }
    .table-wrapper::-webkit-scrollbar-track { background: rgba(0, 220, 160, 0.05); }
    .table-wrapper::-webkit-scrollbar-thumb { background: rgba(0, 220, 160, 0.3); border-radius: 2px; }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(0, 220, 160, 0.6); }
    table { width: max-content; min-width: 100%; table-layout: auto; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); white-space: nowrap; vertical-align: middle; }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); white-space: nowrap; vertical-align: middle; }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .type-image { color: #60a5fa; }
    .type-audio { color: #f59e0b; }
    .type-video { color: #f87171; }
    a { color: #00dca0; text-decoration: none; border: 1px solid rgba(0,220,160,0.4); padding: 3px 8px; border-radius: 3px; font-size: 11px; display: inline-block; white-space: nowrap; }
    a:hover { background: rgba(0,220,160,0.1); }
    .footer { margin-top: 20px; font-size: 10px; opacity: 0.6; }
    .c-sel { position: relative; display: inline-block; }
    .c-sel button { background: rgba(0,220,160,0.03); color: #00dca0; border: 1px solid rgba(0,220,160,0.15); padding: 5px 14px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; transition: all 0.2s; }
    .c-sel button:hover { border-color: rgba(0,220,160,0.4); background: rgba(0,220,160,0.08); color: #fff; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #020c08; border: 1px solid rgba(0,220,160,0.25); min-width: 140px; z-index: 100; box-shadow: 0 8px 30px rgba(0,0,0,0.9); border-radius: 3px; overflow: hidden; animation: fadeUp 0.2s ease-out; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 14px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.05); color: rgba(0,220,160,0.85); transition: all 0.2s; border-left: 2px solid transparent; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.06); color: #fff; border-left-color: #00dca0; }
    @media (max-width: 768px) {
      body { padding: 12px 12px 12px 64px; }
      .header {
        padding-left: 0;
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
      .header > div {
        width: 100%;
      }
      .header > div:first-child {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        align-items: center !important;
      }
      .header h2 {
        flex: 1 1 100%;
        white-space: nowrap !important;
        font-size: 13px !important;
        letter-spacing: 2px !important;
      }
      .c-sel {
        flex: 1 1 45%;
        min-width: 120px;
      }
      .c-sel button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .c-sel .opts {
        width: 100%;
      }
      .header > div:last-child {
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        width: 100%;
      }
      .vault-logout {
        width: 100%;
        text-align: center;
      }
      .header > div:last-child > div:last-child {
        border-top: 1px solid rgba(0, 220, 160, 0.1);
        padding-top: 8px;
        margin-top: 5px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
      }
    }
    ${SHARED_NAV_STYLE}
  </style>
</head>
<body>
  ${SHARED_NAV_HTML}
  <div class="header">
    <div style="display:flex; align-items:center; gap:10px;">
      <h2>[ VAULT INDEX ]</h2>
      <div class="c-sel" id="typeSel">
        <button onclick="toggleSel('typeSel', event)"><span id="typeLbl">FILTER: ALL</span> ▾</button>
        <div class="opts">
          <div onclick="setFilter('ALL', 'FILTER: ALL')">All</div>
          <div onclick="setFilter('IMAGE', 'FILTER: IMAGES')">IMAGES</div>
          <div onclick="setFilter('VIDEO', 'FILTER: VIDEOS')">VIDEOS</div>
          <div onclick="setFilter('AUDIO', 'FILTER: AUDIOS')">AUDIOS</div>
          <div onclick="setFilter('OTHER', 'FILTER: OTHERS')">OTHERS</div>
        </div>
      </div>
      <div class="c-sel" id="timeSel">
        <button onclick="toggleSel('timeSel', event)"><span id="timeLbl">SORT: NEWEST</span> ▾</button>
        <div class="opts">
          <div onclick="setSort('NEWEST', 'SORT: NEWEST')">Newest</div>
          <div onclick="setSort('OLDEST', 'SORT: OLDEST')">Oldest</div>
        </div>
      </div>
    </div>
    <div style="text-align:right; display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
      <div class="count" id="assetCount">${rows.length} ASSETS ON RECORD</div>
      <div style="display:flex; align-items:center; gap:15px;">
        <a href="/vault/logout" class="vault-logout" style="padding: 4px 12px; font-size: 9px;">LOGOUT FROM VAULT</a>
        <div style="font-size:11px; font-weight:bold; letter-spacing:1px; color:#00dca0;">CAPACITY: ${totalMB.toFixed(2)} MB / 1024 MB</div>
      </div>
    </div>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>ITEM NAME</th>
          <th>STORED TIMESTAMP</th>
          <th>TYPE</th>
          <th>FORMAT</th>
          <th>SIZE</th>
          <th>DURATION</th>
          <th>ACCESS</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>
  <div class="footer">END OF ARCHIVE LOG -- ui.muffinjuice.xyz/vault/list</div>
  <script>
    let curFilter = 'ALL';
    let curSort = 'NEWEST';

    function toggleSel(id, e) {
      e.stopPropagation();
      document.querySelectorAll('.c-sel').forEach(el => {
        if(el.id !== id) el.classList.remove('open');
      });
      document.getElementById(id).classList.toggle('open');
    }
    document.addEventListener('click', () => {
      document.querySelectorAll('.c-sel').forEach(el => el.classList.remove('open'));
    });

    function setFilter(val, lbl) {
      curFilter = val;
      document.getElementById('typeLbl').innerText = lbl;
      applyFilters();
    }
    function setSort(val, lbl) {
      curSort = val;
      document.getElementById('timeLbl').innerText = lbl;
      applyFilters();
    }

    function applyFilters() {
      const typeFilter = curFilter;
      const timeSort = curSort;
      const tbody = document.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      let visibleCount = 0;
      
      // Filter & Sort
      rows.sort((a, b) => {
        const idA = parseInt(a.id.split('_').pop() || "0");
        const idB = parseInt(b.id.split('_').pop() || "0");
        return timeSort === 'NEWEST' ? idB - idA : idA - idB;
      });

      tbody.innerHTML = '';
      rows.forEach(r => {
        const type = r.children[2].textContent.trim();
        const isOther = type !== 'IMAGE' && type !== 'VIDEO' && type !== 'AUDIO';
        
        if (typeFilter === 'ALL' || type === typeFilter || (typeFilter === 'OTHER' && isOther)) {
          r.style.display = '';
          visibleCount++;
        } else {
          r.style.display = 'none';
        }
        tbody.appendChild(r);
      });
      
      document.getElementById('assetCount').textContent = visibleCount + " ASSETS DISPLAYED";
    }

    let deleteTimers = {};
    function deleteVaultItem(id, btn) {
      if (btn.textContent !== 'SURE?') {
        btn.textContent = 'SURE?';
        btn.style.background = 'rgba(239,68,68,0.25)';
        btn.style.color = '#fff';
        
        deleteTimers[id] = setTimeout(() => {
          btn.textContent = 'DELETE';
          btn.style.background = 'rgba(239,68,68,0.08)';
          btn.style.color = '#f87171';
        }, 3000);
        return;
      }
      
      clearTimeout(deleteTimers[id]);
      btn.textContent = '...';
      btn.disabled = true;
      fetch('/vault/delete?id=' + id)
        .then(r => {
          if (r.ok) {
            const row = document.getElementById('row_' + id);
            if (row) {
              row.style.transition = 'opacity 0.4s, transform 0.4s';
              row.style.opacity = '0';
              row.style.transform = 'translateX(10px)';
              setTimeout(() => row.remove(), 420);
            }
          } else {
            btn.textContent = 'ERROR';
            btn.style.color = '#f87171';
          }
        })
        .catch(() => { btn.textContent = 'FAILED'; });
    }
  </script>
</body>
</html>`;

              return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
            } catch (err) {
              return new Response(`INDEX_CRASH: ${err.message}`, { status: 500 });
            }
          } catch (outerErr) {
            return new Response(`VAULT_FATAL: ${outerErr.message}`, { status: 500 });
          }
        }

        // ── Persistent IP Intelligence Endpoint ──────────────
        if (url.pathname === "/intel") {
          if (!isLoggedIn) return renderUnauthorized();
          const ip = url.searchParams.get("ip");
          if (!ip) return new Response("MISSING IP", { status: 400 });

          try {
            const cached = await env.DB.prepare("SELECT * FROM geo_cache WHERE ip = ?").bind(ip).first();
            if (cached) {
              return new Response(JSON.stringify({ ...cached, country_name: cached.country, latitude: cached.latitude, longitude: cached.longitude, source: "D1 CACHE" }), {
                headers: { "Content-Type": "application/json" }
              });
            }

            // Strategy: Try multiple providers to avoid rate limits
            let data = null;
            let lastError = "";

            // 1. Try ipapi.co
            try {
              const resp = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { "User-Agent": "Cloudflare-Worker" } });
              if (resp.ok && resp.headers.get("content-type")?.includes("application/json")) {
                const d = await resp.json();
                if (!d.error) data = { ...d, source: "IPAPI CO" };
                else lastError = d.reason || "IPAPI Rate Limit";
              } else {
                lastError = `IPAPI_${resp.status}`;
              }
            } catch (e) { lastError = e.message; }

            // 2. Try ip-api.com (Fallback)
            if (!data) {
              try {
                const resp = await fetch(`http://ip-api.com/json/${ip}`);
                if (resp.ok) {
                  const d = await resp.json();
                  if (d.status === "success") {
                    data = {
                      ip: d.query,
                      org: d.isp || d.org,
                      city: d.city,
                      region: d.regionName,
                      country_name: d.country,
                      latitude: d.lat,
                      longitude: d.lon,
                      source: "IP API COM"
                    };
                  } else lastError = d.message || "IP-API Error";
                }
              } catch (e) { lastError = e.message; }
            }

            if (data) {
              await env.DB.prepare("INSERT INTO geo_cache (ip, org, city, region, country, latitude, longitude, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                .bind(ip, data.org || "Unknown", data.city || "Unknown", data.region || "Unknown", data.country_name || "Unknown", data.latitude || 0, data.longitude || 0, Date.now())
                .run();
              return new Response(JSON.stringify({ ...data, source: data.source || "REMOTE PROVIDER" }), {
                headers: { "Content-Type": "application/json" }
              });
            }

            throw new Error(lastError || "Intelligence providers unavailable");
          } catch (err) {
            let msg = err.message;
            if (msg.includes("Unexpected token") || msg.includes("is not valid JSON")) {
              msg = "Intelligence provider returned invalid data (likely rate limited)";
            }
            return new Response(JSON.stringify({ error: true, reason: msg }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }

        // ── Migration Tool (Hidden) ──────────────────────────
        if (url.searchParams.get("migrate") === "true") {
          try {
            const [hist, noise] = await Promise.all([
              env.LOCATION_KV.list({ prefix: "hist_", limit: 1000 }),
              env.LOCATION_KV.list({ prefix: "noise_", limit: 1000 })
            ]);
            const logKeys = [...hist.keys, ...noise.keys];
            let logCount = 0;
            for (const key of logKeys) {
              const data = await env.LOCATION_KV.get(key.name, { type: "json" });
              if (data) {
                await env.DB.prepare("INSERT INTO logs (timestamp, method, path, status, ip, source, noisy, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
                  .bind(data.time, data.method, data.path, data.status, data.ip, data.source || "LEGACY", data.noisy ? 1 : 0, data.location || "KV DATA")
                  .run();
                await env.LOCATION_KV.delete(key.name);
                logCount++;
              }
            }
            const vaultList = await env.LOCATION_KV.list({ prefix: "vault_", limit: 1000 });
            let vaultCount = 0;
            for (const key of vaultList.keys) {
              const { metadata } = await env.LOCATION_KV.getWithMetadata(key.name, { type: "stream" });
              if (metadata) {
                const id = key.name.replace("vault_", "");
                const type = id.split("_")[0].toUpperCase();
                await env.DB.prepare("INSERT OR IGNORE INTO vault_files (id, type, size, content_type, timestamp) VALUES (?, ?, ?, ?, ?)")
                  .bind(id, type, metadata.size || 0, metadata.contentType || "unknown", metadata.receivedAt || Date.now())
                  .run();
                vaultCount++;
              }
            }
            return new Response(`MIGRATION_COMPLETE: Moved ${logCount} logs and indexed ${vaultCount} vault files in D1 SQL.`, { status: 200 });
          } catch (migErr) {
            return new Response(`MIGRATION_FAIL: ${migErr.message}`, { status: 500 });
          }
        }

        if (url.pathname === "/requests") {
          if (!isLoggedIn) return renderUnauthorized();

          const q = url.searchParams.get("q") || "";
          const offset = parseInt(url.searchParams.get("offset") || "0");
          const limit = parseInt(url.searchParams.get("limit") || "50");

          // Fetch logs from D1 with optional Deep Search
          let dbQuery = "SELECT * FROM logs";
          let countQuery = "SELECT COUNT(*) as count FROM logs";
          let queryParams = [limit, offset];
          let countParams = [];

          if (q) {
            const likeTerm = `%${q}%`;
            dbQuery += " WHERE path LIKE ? OR ip LIKE ? OR source LIKE ? OR location LIKE ?";
            countQuery += " WHERE path LIKE ? OR ip LIKE ? OR source LIKE ? OR location LIKE ?";
            queryParams = [likeTerm, likeTerm, likeTerm, likeTerm, limit, offset];
            countParams = [likeTerm, likeTerm, likeTerm, likeTerm];
          }

          dbQuery += " ORDER BY timestamp DESC LIMIT ? OFFSET ?";

          const { results } = await env.DB.prepare(dbQuery).bind(...queryParams).all();
          const totalLogsRows = await env.DB.prepare(countQuery).bind(...countParams).first("count");
          const totalLogs = totalLogsRows || 0;

          // Optimized One-Pass Processing to save CPU time (Prevents Error 1102)
          let tableRows = "";
          let lastDay = "";
          for (const r of results) {
            const date = new Date(r.timestamp);
            const dayStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
            const timeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

            if (dayStr !== lastDay) {
              const colspan = 6;
              tableRows += `<tr class="date-sep"><td colspan="${colspan}">${dayStr}</td></tr>`;
              lastDay = dayStr;
            }

            const isAlert = r.status === 401;
            const isRedirect = r.status === 302 || r.status === 301;
            const noisy = !!r.noisy;

            let statusCol = `<span style="color:${r.status >= 400 ? '#f87171' : '#00dca0'}">${r.status}</span>`;
            if (isAlert) statusCol = `<span class="status-alert">${r.status}</span>`;
            else if (isRedirect) statusCol = `<span style="color:#60a5fa; font-weight:bold;">${r.status}</span>`;

            let pathDisplay = r.path;
            if (isRedirect) {
              const redirectStyle = 'font-family:\'Share Tech Mono\', monospace;';
              if (r.path.startsWith("/vault")) pathDisplay += ' <span style="' + redirectStyle + '"> -> /vault/auth</span>';
              else if (r.path === "/home" || r.path === "/requests") pathDisplay += ' <span style="' + redirectStyle + '"> -> /login</span>';
              else if (r.path === "/") pathDisplay += ' <span style="' + redirectStyle + '"> -> /home</span>';
            }

            const locationLabel = (r.location || "GLOBAL").toUpperCase().replace(/_/g, ' ');

            tableRows += `<tr id="row_${r.id}" class="${isAlert ? 'row-alert' : ''}" data-noisy="${noisy}" data-method="${r.method}" data-ts="${r.timestamp}" data-status="${r.status}">
            <td>${timeStr}</td>
            <td>${r.method}</td>
            <td style="color:#fff">${pathDisplay}</td>
            <td>${statusCol}</td>
            <td><span style="color:#f59e0b">${(r.source || "").replace(/_/g, ' ')}</span></td>
            <td>
              <div style="font-size:9px; color:rgba(0,220,160,0.45); font-weight:bold; margin-bottom:2px;">${locationLabel}</div>
              <span class="ip-link" onclick="showIntel('${r.ip}', event)">${r.ip}</span>
            </td>
          </tr>`;
          }

          // Return partial rows for AJAX "Load More"
          if (url.searchParams.get("partial") === "true") {
            return new Response(tableRows, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
          }


          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Request Logs</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px 24px 24px 76px; font-size: 13px; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; padding-left: 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .c-sel { position: relative; display: inline-block; }
    .c-sel button { background: rgba(0,220,160,0.03); color: #00dca0; border: 1px solid rgba(0,220,160,0.15); padding: 5px 14px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; transition: all 0.2s; }
    .c-sel button:hover { border-color: rgba(0,220,160,0.4); background: rgba(0,220,160,0.08); color: #fff; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #020c08; border: 1px solid rgba(0,220,160,0.25); min-width: 140px; z-index: 100; box-shadow: 0 8px 30px rgba(0,0,0,0.9); border-radius: 3px; overflow: hidden; animation: fadeUp 0.2s ease-out; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 14px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.05); color: rgba(0,220,160,0.85); transition: all 0.2s; border-left: 2px solid transparent; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.06); color: #fff; border-left-color: #00dca0; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    .row-alert { background: rgba(255,62,62,0.1) !important; }
    .status-alert { color: #ff3e3e !important; font-weight: bold; }
    ${SHARED_NAV_STYLE}
    .date-sep { background: rgba(0,220,160,0.05); }
    .date-sep td { color: rgba(0,220,160,0.6); font-weight: bold; text-align: center; letter-spacing: 4px; font-size: 12px; padding: 8px 0; border-top: 1px solid rgba(0,220,160,0.15); border-bottom: 1px solid rgba(0,220,160,0.15); text-transform: uppercase; }
    .btn-refresh { background: rgba(0,220,160,0.4); color: #fff; border: 1px solid #00dca0; padding: 5px 15px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
    .btn-refresh:hover { background: rgba(0,220,160,0.6); color: #000; transform: scale(1.05); opacity: 1; }
    .btn-refresh:active { transform: scale(0.95); }
    .refreshing { opacity: 0.5; pointer-events: none; }
    .search-wrap { position: relative; display: flex; align-items: center; margin: 0 15px; }
    .search-icon { position: absolute; left: 10px; width: 12px; height: 12px; color: #00dca0; opacity: 0.7; pointer-events: none; }
    #searchInput { background: rgba(0,220,160,0.05); color: #00dca0; border: 1px solid rgba(0,220,160,0.3); padding: 5px 12px 5px 30px; border-radius: 3px; font-size: 11px; font-family: inherit; width: 220px; outline: none; transition: border 0.2s; user-select: text; -webkit-user-select: text; }
    #searchInput:focus { border-color: #00dca0; background: rgba(0,220,160,0.1); }
    .load-more-wrap { display: flex; justify-content: center; padding: 40px 0; border-top: 1px solid rgba(0,220,160,0.1); margin-top: 20px; }
    .btn-load-more { background: transparent; color: #00dca0; border: 1px solid rgba(0,220,160,0.4); padding: 12px 40px; border-radius: 4px; font-family: inherit; font-size: 11px; font-weight: bold; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; }
    .btn-load-more:hover { background: rgba(0,220,160,0.05); border-color: #00dca0; box-shadow: 0 0 15px rgba(0,220,160,0.1); }
    .btn-load-more:disabled { opacity: 0.3; cursor: default; }
    .ip-link { cursor: pointer; text-decoration: underline; text-decoration-color: rgba(0,220,160,0.2); transition: all 0.2s; user-select: text; -webkit-user-select: text; }
    .ip-link:hover { color: #fff; text-decoration-color: #00dca0; }
    .modal-intel { position: fixed; inset: 0; background: rgba(2,6,8,0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .intel-content { background: #0a0e12; border: 1px solid var(--border-hi); padding: 0; border-radius: var(--r); width: 100%; max-width: 360px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 220, 160, 0.1); overflow: hidden; animation: fadeUp 0.3s var(--ease); }
    .intel-header { display: flex; justify-content: space-between; align-items: center; background: rgba(0, 220, 160, 0.05); border-bottom: 1px solid rgba(0, 220, 160, 0.2); padding: 16px 20px; }
    .intel-body { padding: 24px; }
    .intel-body div { margin-bottom: 20px; }
    .intel-body div:last-child { margin-bottom: 0; }
    .intel-label { color: var(--teal); opacity: 0.6; font-size: 10px; letter-spacing: 2px; display: block; margin-bottom: 6px; font-weight: bold; font-family: var(--mono); text-transform: uppercase; }
    .intel-val { color: #fff; font-weight: bold; font-size: 14px; display: block; letter-spacing: 0.5px; user-select: text; -webkit-user-select: text; word-break: break-all; line-height: 1.5; font-family: var(--mono); }
    .intel-close { background: transparent; border: none; color: var(--teal); cursor: pointer; font-size: 24px; line-height: 1; opacity: 0.5; transition: all 0.2s; }
    .intel-close:hover { opacity: 1; transform: rotate(90deg); }
    .new-row td { animation: highlight-new 2s ease-out; }
    @keyframes highlight-new {
      0% { background: rgba(0,220,160,0.3); }
      100% { background: transparent; }
    }
    @media (max-width: 768px) {
      body { padding: 12px 12px 12px 64px; }
      .header {
        padding-left: 0;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 15px;
      }
      .header > div {
        flex: 1 1 auto;
      }
      .header h2 {
        white-space: nowrap !important;
        font-size: 13px !important;
        letter-spacing: 2px !important;
      }
      .header > div:last-child {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }
      .search-wrap {
        flex: 1 1 auto !important;
        min-width: 200px !important;
        margin: 0 !important;
      }
      #searchInput {
        width: 100% !important;
      }
      .c-sel {
        flex: 1 1 auto !important;
        min-width: 120px !important;
      }
      .c-sel button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .c-sel .opts {
        width: 100%;
      }
      .btn-refresh {
        flex: 1 1 auto !important;
        min-width: 120px !important;
        padding: 8px 12px;
        text-align: center;
      }
      .header > div:last-child > div:last-child {
        flex: 1 1 auto !important;
        min-width: 180px !important;
        align-items: center !important;
        text-align: center !important;
        margin-left: 0 !important;
        margin-top: 5px;
        border-top: 1px solid rgba(0, 220, 160, 0.1);
        padding-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      table { font-size: 11px; }
      th, td { padding: 10px 18px !important; }
    }
    ${SHARED_NAV_STYLE}
  </style>
</head>
<body>
  ${SHARED_NAV_HTML}
  <div class="header">
    <div style="display:flex; align-items:center;">
      <h2>[ HTTP REQUEST HISTORY ]</h2>
    </div>
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Search Logs ..." onkeyup="handleSearch(event)">
      </div>
      <div class="c-sel" id="showSel">
        <button onclick="toggleSel('showSel', event)"><span id="showLbl">Default</span> ▾</button>
        <div class="opts">
          <div onclick="setShow('DEFAULT', 'Default')">Default</div>
          <div onclick="setShow('HIDDEN', 'Hidden')">Hidden</div>
          <div onclick="setShow('BLOCKED', 'Blocked')">Blocked</div>
          <div onclick="setShow('ALL', 'All')">All</div>
        </div>
      </div>
      <div class="c-sel" id="typeSel">
        <button onclick="toggleSel('typeSel', event)"><span id="typeLbl">All</span> ▾</button>
        <div class="opts">
          <div onclick="setFilter('ALL', 'All')">All</div>
          <div onclick="setFilter('GET', 'GET')">GET</div>
          <div onclick="setFilter('POST', 'POST')">POST</div>
        </div>
      </div>
      <div class="c-sel" id="timeSel">
        <button onclick="toggleSel('timeSel', event)"><span id="timeLbl">Newest</span> ▾</button>
        <div class="opts">
          <div onclick="setSort('NEWEST', 'Newest')">Newest</div>
          <div onclick="setSort('OLDEST', 'Oldest')">Oldest</div>
        </div>
      </div>
      <button class="btn-refresh" id="refreshBtn" onclick="refreshLogs()">REFRESH</button>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; text-align:right; margin-left:8px;">
        <div id="capText" style="font-size: 11px; font-weight: bold; color: rgba(0,220,160,0.8); letter-spacing: 1px;">CAPACITY: ${totalLogs} / 3000</div>
        <div id="syncText" style="font-size: 8px; color: rgba(0,220,160,0.7); letter-spacing: 1px; font-weight: bold;">LAST SYNC: NEVER</div>
      </div>
    </div>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr><th>TIMESTAMP</th><th>METHOD</th><th>PATH</th><th>STATUS</th><th>EMERGENCE SOURCE</th><th>IP ADDRESS</th></tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  <div class="load-more-wrap" id="loadMoreWrap" style="${totalLogs <= limit ? 'display:none' : ''}">
    <button class="btn-load-more" id="loadMoreBtn" onclick="loadMore()">LOAD MORE ARCHIVE DATA</button>
  </div>

  <div id="intelModal" class="modal-intel">
    <div class="intel-content">
      <div class="intel-header">
        <span style="font-size:10px; font-weight:bold; letter-spacing:2px;">IP INTELLIGENCE</span>
        <button class="intel-close" onclick="hideIntel()">&times;</button>
      </div>
      <div class="intel-body" id="intelBody">
        <div style="text-align:center; padding:20px; opacity:0.5;">LOADING INTEL...</div>
      </div>
    </div>
  </div>

  <script>
    let curFilter = 'ALL';
    let curSort = 'NEWEST';
    let curShow = 'DEFAULT';
    let curOffset = 0;
    const PAGE_LIMIT = 50;
    let TOTAL_CAPACITY = ${totalLogs};

    async function loadMore() {
      const btn = document.getElementById('loadMoreBtn');
      const q = document.getElementById('searchInput').value.trim();
      curOffset += PAGE_LIMIT;
      btn.disabled = true;
      btn.innerText = 'FETCHING ARCHIVE...';

      try {
        const resp = await fetch("/requests?offset=" + curOffset + "&q=" + encodeURIComponent(q) + "&partial=true");
        if (!resp.ok) throw new Error('FAIL');
        const html = await resp.text();
        
        if (html.trim()) {
          const tbody = document.querySelector('tbody');
          tbody.insertAdjacentHTML('beforeend', html);
          applyFilters();
          
          if (curOffset + PAGE_LIMIT >= TOTAL_CAPACITY) {
            document.getElementById('loadMoreWrap').style.display = 'none';
          }
        } else {
          document.getElementById('loadMoreWrap').style.display = 'none';
        }
      } catch (e) {
        btn.innerText = 'ERROR LOADING MORE';
      } finally {
        if (btn.innerText === 'FETCHING ARCHIVE...') {
          btn.disabled = false;
          btn.innerText = 'LOAD MORE ARCHIVE DATA';
        }
      }
    }

    let searchTimeout;
    function handleSearch(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        curOffset = 0;
        deepSearch();
      }, 500);
    }

    async function deepSearch() {
      const q = document.getElementById('searchInput').value.trim();
      const btn = document.getElementById('refreshBtn');
      
      // Update URL to keep refreshLogs in sync
      const newUrl = window.location.pathname + (q ? "?q=" + encodeURIComponent(q) : "");
      window.history.replaceState(null, "", newUrl);

      btn.classList.add('refreshing');
      btn.innerText = 'SEARCHING...';

      try {
        const resp = await fetch("/requests?q=" + encodeURIComponent(q));
        if (!resp.ok) throw new Error('FAIL');
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const newTbody = doc.querySelector('tbody');
        const newCap = doc.getElementById('capText');
        const newLoadMore = doc.getElementById('loadMoreWrap');
        
        if (newTbody) {
          document.querySelector('tbody').innerHTML = newTbody.innerHTML;
          if (newCap) document.getElementById('capText').innerText = newCap.innerText;
          if (newLoadMore) document.getElementById('loadMoreWrap').style.display = newLoadMore.style.display;
          applyFilters();
        }
      } catch(e) {
        console.error('Deep Search Error:', e);
      } finally {
        btn.classList.remove('refreshing');
        btn.innerText = 'REFRESH';
      }
    }

    function hideIntel() {
      document.getElementById('intelModal').style.display = 'none';
    }

    async function showIntel(ip, e) {
      if (e) e.stopPropagation();
      const modal = document.getElementById('intelModal');
      const body = document.getElementById('intelBody');
      modal.style.display = 'flex';
      body.innerHTML = '<div style="text-align:center; padding:20px; opacity:0.5;">LOADING INTEL...</div>';

      try {
        const resp = await fetch("/intel?ip=" + ip);
        const contentType = resp.headers.get("content-type") || "";
        
        let d;
        if (contentType.includes("application/json")) {
          d = await resp.json();
        } else {
          const text = await resp.text();
          throw new Error("System returned non-JSON response: " + (text.substring(0, 30) || "Empty"));
        }
        
        if (d.error) throw new Error(d.reason || 'Rate Limited');

        const sourceTag = d.source === "D1 CACHE" ? 
          '<span style="font-size:9px; color:#00dca0; opacity:0.9; margin-left:12px; vertical-align:middle;">[ INSTANT CACHE ]</span>' : 
          '<span style="font-size:9px; color:#f59e0b; opacity:0.9; margin-left:12px; vertical-align:middle;">[ PROXIED FETCH ]</span>';

        body.innerHTML = '<div><span class="intel-label">IP ADDRESS</span><span class="intel-val">' + d.ip + sourceTag + '</span></div>' +
          '<div><span class="intel-label">ORGANIZATION / ISP</span><span class="intel-val">' + d.org + '</span></div>' +
          '<div><span class="intel-label">LOCATION</span><span class="intel-val">' + (d.city || "").replace(/_/g, ' ') + ', ' + (d.region || "").replace(/_/g, ' ') + ', ' + (d.country_name || "").replace(/_/g, ' ') + '</span></div>' +
          '<div style="margin-top:15px; border-top:1px solid rgba(0,220,160,0.1); padding-top:15px;">' +
            '<a href="https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude + '" style="color:#00dca0; text-decoration:none; font-size:10px; border:1px solid #00dca0; padding:5px 10px; border-radius:3px; display:inline-block;">VIEW ON SATELLITE MAP</a>' +
          '</div>';
      } catch(err) {
        body.innerHTML = '<div style="color:#f87171; text-align:center; padding:20px;">FAILED TO RETRIEVE INTEL: ' + err.message + '</div>';
      }
    }

    function updateSyncTime() {
      const now = new Date();
      document.getElementById('syncText').innerText = 'LAST SYNC: ' + now.toLocaleTimeString();
    }

    async function refreshLogs(isAuto = false) {
      // ... existing code ...
    }

    function showExtra(b64, e) {
      if (e) e.stopPropagation();
      const data = JSON.parse(atob(b64));
      const modal = document.getElementById('intelModal');
      const body = document.getElementById('intelBody');
      const header = modal.querySelector('.intel-header span');
      header.innerText = 'HARDWARE PRESCRIPTION';
      modal.style.display = 'flex';

      let html = '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">';
      
      const formatVal = (v, type) => {
        if (type === 'bool') return v === "1" ? '<span style="color:#00dca0">ACTIVE</span>' : '<span style="color:#ef4444">INACTIVE</span>';
        if (type === 'vol') return '<div style="width:100%; background:rgba(255,255,255,0.05); height:4px; margin-top:6px; border-radius:2px;"><div style="width:' + v + '%; background:#00dca0; height:100%; border-radius:2px;"></div></div><span style="font-size:9px; opacity:0.7">' + v + '%</span>';
        if (type === 'loc') {
            const locVal = parseInt(v);
            return locVal > 0 ? '<span style="color:#00dca0">ENABLED (LVL ' + locVal + ')</span>' : '<span style="color:#ef4444">DISABLED</span>';
        }
        return v || 'N/A';
      };

      const rows = [
        { label: 'GLYPH TORCH', val: data.torch, type: 'bool' },
        { label: 'WIFI STATE', val: data.wifi, type: 'bool' },
        { label: 'BLUETOOTH', val: data.bluetooth, type: 'bool' },
        { label: 'LOCATION', val: data.location, type: 'loc' },
        { label: 'MEDIA VOL', val: data.media, type: 'vol' },
        { label: 'ALARM VOL', val: data.alarm, type: 'vol' },
        { label: 'RINGER VOL', val: data.ringer, type: 'vol' },
        { label: 'NOTIF VOL', val: data.notif, type: 'vol' }
      ];

      rows.forEach(r => {
        html += '<div style="padding:10px; background:rgba(0,220,160,0.02); border:1px solid rgba(0,220,160,0.05); border-radius:4px;">' +
          '<div class="intel-label" style="margin-bottom:5px;">' + r.label + '</div>' +
          '<div class="intel-val">' + formatVal(r.val, r.type) + '</div>' +
        '</div>';
      });

      html += '</div>';
      body.innerHTML = html;
    }

    async function refreshLogs(isAuto = false) {
      const btn = document.getElementById('refreshBtn');
      const cap = document.getElementById('capText');
      const oldIds = Array.from(document.querySelectorAll('tr[id]')).map(r => r.id);
      
      if (!isAuto) {
        btn.classList.add('refreshing');
        btn.innerText = 'SYNCING...';
      }
      
      try {
        const fetchUrl = isAuto ? window.location.pathname + '?nosave=1&limit=10' : window.location.href;
        const resp = await fetch(fetchUrl);
        if (!resp.ok) throw new Error('FAIL');
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const newTbody = doc.querySelector('tbody');
        const newCap = doc.getElementById('capText');
        
        if (newTbody && newCap) {
          const tbody = document.querySelector('tbody');
          
          if (isAuto) {
            // MERGE LOGIC: Prepend only truly new rows to avoid wiping archive data
            const existingIds = Array.from(tbody.querySelectorAll('tr[id]')).map(r => r.id);
            const newRows = Array.from(newTbody.querySelectorAll('tr[id]')).filter(r => !existingIds.includes(r.id));
            
            if (newRows.length > 0) {
              newRows.forEach(r => {
                r.classList.add('new-row');
                tbody.appendChild(r);
                // Remove highlight class after animation completes to prevent re-flicker on DOM re-sort
                r.addEventListener('animationend', () => r.classList.remove('new-row'), { once: true });
              });
            }
          } else {
            // Manual refresh resets everything
            tbody.innerHTML = newTbody.innerHTML;
            curOffset = 0;
            document.getElementById('loadMoreWrap').style.display = (TOTAL_CAPACITY > PAGE_LIMIT) ? 'flex' : 'none';
          }
          
          cap.innerText = newCap.innerText;
          const capMatch = newCap.innerText.match(/CAPACITY: (\d+)/);
          if (capMatch) TOTAL_CAPACITY = parseInt(capMatch[1]);
          
          applyFilters();
          updateSyncTime();
        }
      } catch(e) {
        if (!isAuto) btn.innerText = 'ERROR';
      } finally {
        if (!isAuto) {
          setTimeout(() => {
            btn.classList.remove('refreshing');
            btn.innerText = 'REFRESH';
          }, 400);
        }
      }
    }

    updateSyncTime();
    // Auto-refresh every 5 seconds
    setInterval(() => refreshLogs(true), 5000);

    function toggleSel(id, e) {
      e.stopPropagation();
      document.querySelectorAll('.c-sel').forEach(el => {
        if(el.id !== id) el.classList.remove('open');
      });
      document.getElementById(id).classList.toggle('open');
    }

    document.addEventListener('click', () => {
      document.querySelectorAll('.c-sel').forEach(el => el.classList.remove('open'));
    });

    function setFilter(val, lbl) {
      curFilter = val;
      document.getElementById('typeLbl').innerText = lbl;
      applyFilters();
    }

    function setSort(val, lbl) {
      curSort = val;
      document.getElementById('timeLbl').innerText = lbl;
      applyFilters();
    }

    function setShow(val, lbl) {
      curShow = val;
      document.getElementById('showLbl').innerText = lbl;
      applyFilters();
    }

    function applyFilters() {
      const tbody = document.querySelector('tbody');
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      
      // 1. Collect only data rows (strip existing separators)
      const rows = Array.from(tbody.querySelectorAll('tr:not(.date-sep)'));
      tbody.querySelectorAll('tr.date-sep').forEach(s => s.remove());

      // 2. Filter rows
      const filteredRows = rows.filter(r => {
        const method = r.dataset.method;
        const isNoisy = r.dataset.noisy === 'true';
        const status = parseInt(r.dataset.status) || 200;
        const isBlocked = status === 401;
        const rowText = r.innerText.toLowerCase();
        
        let showMatch = false;
        if (curShow === 'DEFAULT' && !isNoisy && !isBlocked) showMatch = true;
        if (curShow === 'HIDDEN' && isNoisy && !isBlocked) showMatch = true;
        if (curShow === 'BLOCKED' && isBlocked) showMatch = true;
        if (curShow === 'ALL') showMatch = true;

        const searchMatch = !searchTerm || rowText.includes(searchTerm);
        const filterMatch = (curFilter === 'ALL' || method === curFilter);

        return showMatch && searchMatch && filterMatch;
      });

      // 3. Sort using raw Unix timestamp stored in data-ts (avoids year-guessing bugs)
      filteredRows.sort((a, b) => {
        const tsA = parseInt(a.dataset.ts) || 0;
        const tsB = parseInt(b.dataset.ts) || 0;
        return curSort === 'NEWEST' ? tsB - tsA : tsA - tsB;
      });

      // 4. Re-render with dynamically generated day banners
      tbody.innerHTML = '';
      let lastDay = '';
      const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
      filteredRows.forEach(r => {
        const ts = parseInt(r.dataset.ts) || 0;
        const dayStr = fmt.format(new Date(ts)).toUpperCase();

        if (dayStr !== lastDay) {
          const sep = document.createElement('tr');
          sep.className = 'date-sep';
          sep.innerHTML = '<td colspan="6">' + dayStr + '</td>';
          tbody.appendChild(sep);
          lastDay = dayStr;
        }
        tbody.appendChild(r);
      });
    }
    
    // Initial run to hide noise by default
    applyFilters();
  </script>
</body>
</html>`;
          return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
        }
        if (url.pathname === "/statuslogs") {
          if (!isLoggedIn) return renderUnauthorized();

          const q = url.searchParams.get("q") || "";
          const order = url.searchParams.get("order") === "ASC" ? "ASC" : "DESC";
          const offset = parseInt(url.searchParams.get("offset") || "0");
          const limit = parseInt(url.searchParams.get("limit") || "50");

          let dbQuery = "SELECT * FROM status_logs";
          let countQuery = "SELECT COUNT(*) as count FROM status_logs";
          let queryParams = [limit, offset];
          let countParams = [];

          if (q) {
            const likeTerm = `%${q}%`;
            dbQuery += " WHERE ip LIKE ? OR location LIKE ? OR temperature LIKE ? OR uptime LIKE ? OR command LIKE ?";
            countQuery += " WHERE ip LIKE ? OR location LIKE ? OR temperature LIKE ? OR uptime LIKE ? OR command LIKE ?";
            queryParams = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, limit, offset];
            countParams = [likeTerm, likeTerm, likeTerm, likeTerm, likeTerm];
          }

          dbQuery += ` ORDER BY timestamp ${order} LIMIT ? OFFSET ?`;

          const { results } = await env.DB.prepare(dbQuery).bind(...queryParams).all();
          const totalLogsRows = await env.DB.prepare(countQuery).bind(...countParams).first("count");
          const totalLogs = totalLogsRows || 0;

          let tableRows = "";
          let lastDay = "";
          for (const r of results) {
            // Robust timestamp handling (seconds vs ms)
            const ts = (r.timestamp < 10000000000) ? r.timestamp * 1000 : r.timestamp;
            const date = new Date(ts);
            const dayStr = date.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
            const timeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

            if (dayStr !== lastDay) {
              tableRows += `<tr class="date-sep"><td colspan="6">${dayStr}</td></tr>`;
              lastDay = dayStr;
            }

            // Safe Base64 encoding for Unicode
            const extraJson = btoa(encodeURIComponent(r.extra_data || "{}"));

            const battColor = r.battery < 20 ? '#f87171' : (r.battery < 50 ? '#fbbf24' : '#00dca0');
            const chargingIcon = r.charging ? '⚡' : '';
            const commandVal = r.command ? r.command.replace(/_/g, ' ').toUpperCase() : '—';

            tableRows += `<tr data-ts="${ts}">
            <td>${timeStr}</td>
            <td style="font-weight:bold; color:#00ffc8">${commandVal}</td>
            <td style="font-weight:bold; color:${battColor}">${r.battery}% ${chargingIcon}</td>
            <td style="color:#60a5fa;">${r.signal} dBm</td>
            <td style="color:#fb923c;">${(r.temperature || "").replace(/_/g, ' ')}</td>
            <td>
              <button class="btn-refresh" style="padding: 2px 10px; font-size: 9px;" data-extra='${extraJson}' data-battery="${r.battery}" data-charging="${r.charging ? '1' : '0'}" data-signal="${r.signal}" data-temp="${(r.temperature || '').replace(/_/g, ' ')}" data-uptime="${r.uptime || 'UNKNOWN'}" onclick="showExtra(this, event)">VIEW DETAILS</button>
            </td>
          </tr>`;
          }

          if (url.searchParams.get("partial") === "true") {
            return new Response(tableRows, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
          }

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Status Logs</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px 24px 24px 76px; font-size: 13px; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; padding-left: 0; }
    .table-wrapper { overflow-x: auto; width: 100%; }
    .table-wrapper::-webkit-scrollbar { height: 4px; }
    .table-wrapper::-webkit-scrollbar-track { background: rgba(0, 220, 160, 0.05); }
    .table-wrapper::-webkit-scrollbar-thumb { background: rgba(0, 220, 160, 0.3); border-radius: 2px; }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(0, 220, 160, 0.6); }
    table { width: max-content; min-width: 100%; table-layout: auto; border-collapse: collapse; }
    th { text-align: center; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); white-space: nowrap; vertical-align: middle; }
    td { text-align: center; padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); white-space: nowrap; vertical-align: middle; }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .date-sep { background: rgba(0,220,160,0.05); }
    .date-sep td { color: rgba(0,220,160,0.6); font-weight: bold; text-align: center; letter-spacing: 4px; font-size: 12px; padding: 8px 0; border-top: 1px solid rgba(0,220,160,0.15); border-bottom: 1px solid rgba(0,220,160,0.15); text-transform: uppercase; }
    .btn-refresh { background: rgba(0,220,160,0.4); color: #fff; border: 1px solid #00dca0; padding: 5px 15px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
    .btn-refresh:hover { background: rgba(0,220,160,0.6); color: #000; transform: scale(1.05); opacity: 1; }
    .btn-refresh:active { transform: scale(0.95); }
    .refreshing { opacity: 0.5; pointer-events: none; }
    .search-wrap { position: relative; display: flex; align-items: center; margin: 0 60px 0 0; }
    .search-icon { position: absolute; left: 10px; width: 12px; height: 12px; color: #00dca0; opacity: 0.7; pointer-events: none; }
    #searchInput { background: rgba(0,220,160,0.05); color: #00dca0; border: 1px solid rgba(0,220,160,0.3); padding: 5px 12px 5px 30px; border-radius: 3px; font-size: 11px; font-family: inherit; width: 320px; outline: none; transition: border 0.2s; user-select: text; -webkit-user-select: text; }
    #searchInput:focus { border-color: #00dca0; background: rgba(0,220,160,0.1); }
    .load-more-wrap { display: flex; justify-content: center; padding: 40px 0; border-top: 1px solid rgba(0,220,160,0.1); margin-top: 20px; }
    #intelModal { position: fixed; inset: 0; background: rgba(2, 6, 8, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
    .modal-content { background: #0a0e12; border: 1px solid var(--border-hi); width: 100%; max-width: 360px; border-radius: var(--r); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 220, 160, 0.1); overflow: hidden; animation: fadeUp 0.3s var(--ease); }
    .modal-header { padding: 16px 20px; background: rgba(0, 220, 160, 0.05); border-bottom: 1px solid rgba(0, 220, 160, 0.2); display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 24px; }
    .intel-label { display: block; font-size: 10px; color: var(--teal); opacity: 0.6; letter-spacing: 2px; margin-bottom: 6px; font-weight: bold; font-family: var(--mono); text-transform: uppercase; }
    .intel-val { display: block; color: #fff; margin-bottom: 20px; font-size: 14px; font-weight: bold; word-break: break-all; line-height: 1.5; font-family: var(--mono); }
    .c-sel { position: relative; display: inline-block; }
    .c-sel button { background: rgba(0,220,160,0.03); color: #00dca0; border: 1px solid rgba(0,220,160,0.15); padding: 5px 14px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; transition: all 0.2s; }
    .c-sel button:hover { border-color: rgba(0,220,160,0.4); background: rgba(0,220,160,0.08); color: #fff; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #020c08; border: 1px solid rgba(0,220,160,0.25); min-width: 140px; z-index: 100; box-shadow: 0 8px 30px rgba(0,0,0,0.9); border-radius: 3px; overflow: hidden; animation: fadeUp 0.2s ease-out; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 14px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.05); color: rgba(0,220,160,0.85); transition: all 0.2s; border-left: 2px solid transparent; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.06); color: #fff; border-left-color: #00dca0; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 768px) {
      body { padding: 12px 12px 12px 64px; }
      .header {
        padding-left: 0;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 15px;
      }
      .header > div {
        flex: 1 1 auto;
      }
      .header h2 {
        white-space: nowrap !important;
        font-size: 13px !important;
        letter-spacing: 2px !important;
      }
      .header > div:last-child {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }
      .search-wrap {
        flex: 1 1 auto !important;
        min-width: 200px !important;
        margin: 0 !important;
      }
      #searchInput {
        width: 100% !important;
      }
      .c-sel {
        flex: 1 1 auto !important;
        min-width: 120px !important;
      }
      .c-sel button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .c-sel .opts {
        width: 100%;
      }
      .btn-refresh {
        flex: 1 1 auto !important;
        min-width: 120px !important;
        padding: 8px 12px;
        text-align: center;
      }
      .header > div:last-child > div:last-child {
        flex: 1 1 auto !important;
        min-width: 180px !important;
        align-items: center !important;
        text-align: center !important;
        margin-left: 0 !important;
        margin-top: 5px;
        border-top: 1px solid rgba(0, 220, 160, 0.1);
        padding-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      table { font-size: 11px; }
      td, th { padding: 10px 18px !important; }
    }
    ${SHARED_NAV_STYLE}
  </style>
</head>
<body>
  ${SHARED_NAV_HTML}
  <div class="header">
    <div style="display:flex; align-items:center;">
      <h2>[ HARDWARE STATUS LOGS ]</h2>
    </div>
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Search Logs ..." onkeyup="handleSearch(event)">
      </div>
      <div class="c-sel" id="sortSel">
        <button onclick="toggleSel('sortSel', event)"><span id="sortLbl">Newest</span> ▾</button>
        <div class="opts">
          <div onclick="setSort('DESC', 'Newest')">Newest</div>
          <div onclick="setSort('ASC', 'Oldest')">Oldest</div>
        </div>
      </div>
      <button id="refreshBtn" class="btn-refresh" onclick="location.reload()">REFRESH</button>
      <div style="text-align:right; margin-left:35px;">
        <div style="font-size:10px; color:rgba(0,220,160,0.5); letter-spacing:1px; margin-bottom:3px;">STORAGE D1 SQL</div>
        <div id="capText" style="font-size:9px; letter-spacing:2px;">TOTAL RECORDS: ${totalLogs}</div>
      </div>
    </div>
  </div>

  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>TIMESTAMP</th>
          <th>COMMANDS</th>
          <th>BATTERY</th>
          <th>SIGNAL</th>
          <th>TEMP</th>
          <th>MORE STATUS</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>

  <div id="loadMoreWrap" class="load-more-wrap" style="display: ${totalLogs > limit ? 'flex' : 'none'}">
    <button id="loadMoreBtn" class="btn-refresh" style="padding: 12px 30px;" onclick="loadMore()">LOAD MORE ARCHIVE DATA</button>
  </div>

  <div id="intelModal" style="display:none; position:fixed; inset:0; background:rgba(2,6,8,0.92); backdrop-filter:blur(8px); align-items:center; justify-content:center; z-index:2000; padding:20px;" onclick="hideIntel()">
    <div class="modal-content" onclick="event.stopPropagation()" style="background:#0a0e12; border:1px solid rgba(0,220,160,0.2); width:100%; max-width:420px; border-radius:4px; box-shadow:0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(0,220,160,0.08); overflow:hidden;">
      <div class="modal-header" style="padding:14px 18px; background:rgba(0,220,160,0.04); border-bottom:1px solid rgba(0,220,160,0.15); display:flex; justify-content:space-between; align-items:center;">
        <span id="intelModalTitle" style="font-size:10px; letter-spacing:2px; color:rgba(0,220,160,0.7); font-weight:bold;">GEOGRAPHIC INTEL</span>
        <button onclick="hideIntel()" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px; line-height:1;">&times;</button>
      </div>
      <div id="intelBody" class="modal-body" style="padding:20px;"></div>
    </div>
  </div>

  <script>
    let curOffset = ${offset};
    const PAGE_LIMIT = 50;
    const TOTAL_CAPACITY = ${totalLogs};
    let currentOrder = "${order}";

    function toggleSel(id, e) {
      if (e) e.stopPropagation();
      const el = document.getElementById(id);
      const wasOpen = el.classList.contains('open');
      document.querySelectorAll('.c-sel').forEach(s => s.classList.remove('open'));
      if (!wasOpen) el.classList.add('open');
    }

    document.addEventListener('click', () => {
      document.querySelectorAll('.c-sel').forEach(s => s.classList.remove('open'));
    });

    function setSort(order, lbl) {
      currentOrder = order;
      document.getElementById('sortLbl').innerText = lbl;
      curOffset = 0;
      deepSearch();
    }

    // Live Polling Logic — only refresh if user hasn't loaded extra history
    setInterval(() => {
      const q = document.getElementById('searchInput').value.trim();
      if (q || currentOrder === "ASC" || curOffset > 0) return;
      
      fetch("/statuslogs?q=&order=DESC&partial=true&limit=10")
        .then(r => r.text())
        .then(html => {
          if (html.trim()) {
            const tbody = document.querySelector('tbody');
            // Only replace if the first row's timestamp has changed (new data arrived)
            const firstExisting = tbody.querySelector('tr[data-ts]');
            const tmp = document.createElement('tbody');
            tmp.innerHTML = html;
            const firstNew = tmp.querySelector('tr[data-ts]');
            if (!firstExisting || !firstNew || firstNew.dataset.ts !== firstExisting.dataset.ts) {
              tbody.innerHTML = html;
            }
          }
        });
    }, 5000);

    async function loadMore() {
      const btn = document.getElementById('loadMoreBtn');
      const q = document.getElementById('searchInput').value.trim();
      curOffset += PAGE_LIMIT;
      btn.disabled = true;
      btn.innerText = 'FETCHING ARCHIVE...';

      try {
        const resp = await fetch("/statuslogs?offset=" + curOffset + "&q=" + encodeURIComponent(q) + "&order=" + currentOrder + "&partial=true");
        if (!resp.ok) throw new Error('FAIL');
        const html = await resp.text();
        
        if (html.trim()) {
          document.querySelector('tbody').insertAdjacentHTML('beforeend', html);
          if (curOffset + PAGE_LIMIT >= TOTAL_CAPACITY) {
            document.getElementById('loadMoreWrap').style.display = 'none';
          }
        } else {
          document.getElementById('loadMoreWrap').style.display = 'none';
        }
      } catch (e) {
        btn.innerText = 'ERROR LOADING MORE';
      } finally {
        if (btn.innerText === 'FETCHING ARCHIVE...') {
          btn.disabled = false;
          btn.innerText = 'LOAD MORE ARCHIVE DATA';
        }
      }
    }

    let searchTimeout;
    function handleSearch(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        curOffset = 0;
        deepSearch();
      }, 500);
    }

    async function deepSearch() {
      const q = document.getElementById('searchInput').value.trim();
      const btn = document.getElementById('refreshBtn');
      btn.classList.add('refreshing');
      btn.innerText = 'SEARCHING...';

      try {
        const resp = await fetch("/statuslogs?q=" + encodeURIComponent(q) + "&order=" + currentOrder);
        if (!resp.ok) throw new Error('FAIL');
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const newTbody = doc.querySelector('tbody');
        const newCap = doc.getElementById('capText');
        const newLoadMore = doc.getElementById('loadMoreWrap');
        
        if (newTbody) {
          document.querySelector('tbody').innerHTML = newTbody.innerHTML;
          if (newCap) document.getElementById('capText').innerText = newCap.innerText;
          if (newLoadMore) document.getElementById('loadMoreWrap').style.display = newLoadMore.style.display;
        }
      } catch(e) {
        console.error('Deep Search Error:', e);
      } finally {
        btn.classList.remove('refreshing');
        btn.innerText = 'REFRESH';
      }
    }

    function hideIntel() {
      document.getElementById('intelModal').style.display = 'none';
    }

    function showExtra(btn, e) {
      if (e) e.stopPropagation();
      let data = {};
      try { 
        data = JSON.parse(decodeURIComponent(atob(btn.dataset.extra))); 
      } catch(err) {
        // Fallback for older entries encoded directly with btoa
        try { data = JSON.parse(atob(btn.dataset.extra)); } catch(fallbackErr) {}
      }
      const battery = parseInt(btn.dataset.battery) || 0;
      const charging = btn.dataset.charging === '1';
      const signal = btn.dataset.signal || 'UNKNOWN';
      const temp = btn.dataset.temp || 'UNKNOWN';
      const uptime = btn.dataset.uptime || 'UNKNOWN';

      const modal = document.getElementById('intelModal');
      const body = document.getElementById('intelBody');
      document.getElementById('intelModalTitle').innerText = 'HARDWARE PRESCRIPTION';
      modal.style.display = 'flex';

      const formatBool = (v) => v === '1' ? '<span style="color:#00dca0;font-weight:bold;">ACTIVE</span>' : '<span style="color:#ef4444;font-weight:bold;">INACTIVE</span>';
      const formatVol = (v) => {
        const pct = parseInt(v) || 0;
        return '<div style="margin-top:4px;">' +
          '<div style="width:100%;background:rgba(255,255,255,0.06);height:5px;border-radius:3px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;background:#00dca0;height:100%;border-radius:3px;"></div></div>' +
          '<span style="font-size:10px;opacity:0.7;margin-top:3px;display:inline-block;">' + pct + '%</span></div>';
      };
      const formatLoc = (v) => {
        const n = parseInt(v);
        return n > 0 ? '<span style="color:#00dca0;font-weight:bold;">ON (LEVEL ' + n + ')</span>' : '<span style="color:#ef4444;font-weight:bold;">OFF</span>';
      };

      const battColor = battery < 20 ? '#f87171' : (battery < 50 ? '#fbbf24' : '#00dca0');

      const rows = [
        { label: 'BATTERY',      html: '<span style="font-weight:bold; color:' + battColor + ';">' + battery + '% ' + (charging ? '⚡' : '') + '</span>' },
        { label: 'SIGNAL',       html: '<span style="color:#60a5fa;">' + signal + ' dBm</span>' },
        { label: 'TEMP',         html: '<span style="color:#fb923c;">' + temp + '</span>' },
        { label: 'UPTIME',       html: '<span style="color:#fff;">' + uptime + '</span>' },
        { label: 'WIFI',         html: formatBool(data.wifi) },
        { label: 'BLUETOOTH',    html: formatBool(data.bluetooth) },
        { label: 'LOCATION',     html: formatLoc(data.location) },
        { label: 'GLYPH TORCH',  html: formatBool(data.torch) },
        { label: 'MEDIA VOL',    html: formatVol(data.media) },
        { label: 'ALARM VOL',    html: formatVol(data.alarm) },
        { label: 'RINGER VOL',   html: formatVol(data.ringer) },
        { label: 'NOTIF VOL',    html: formatVol(data.notif) },
        { label: 'NETMONSTER',   html: '<span style="color:#00ffc8;font-size:10px;">' + (data.netmonster || 'N/A') + '</span>' },
      ];

      let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
      rows.forEach(function(r) {
        html += '<div style="padding:10px;background:rgba(0,220,160,0.02);border:1px solid rgba(0,220,160,0.08);border-radius:4px;">' +
          '<div style="font-size:9px;letter-spacing:2px;color:rgba(0,220,160,0.55);font-weight:bold;margin-bottom:6px;">' + r.label + '</div>' +
          '<div style="font-size:12px;font-weight:bold;">' + r.html + '</div>' +
          '</div>';
      });
      html += '</div>';

      body.innerHTML = html;
    }

    async function showIntel(ip, e) {
      if (e) e.stopPropagation();
      const body = document.getElementById('intelBody');
      document.getElementById('intelModal').style.display = 'flex';
      body.innerHTML = '<div style="text-align:center; padding:10px; opacity:0.5;">LOADING...</div>';
      try {
        const resp = await fetch("/intel?ip=" + ip);
        const contentType = resp.headers.get("content-type") || "";
        let d;
        if (contentType.includes("application/json")) {
          d = await resp.json();
        } else {
          throw new Error("Invalid Format");
        }
        
        if (d.error) throw new Error(d.reason || "Error");

        const sourceTag = d.source === "D1 CACHE" ? 
          '<span style="font-size:9px; color:#00dca0; opacity:0.9; margin-left:12px; vertical-align:middle;">[ INSTANT CACHE ]</span>' : 
          '<span style="font-size:9px; color:#f59e0b; opacity:0.9; margin-left:12px; vertical-align:middle;">[ PROXIED FETCH ]</span>';

        body.innerHTML = '<div><span class="intel-label">IP ADDRESS</span><span class="intel-val">' + d.ip + sourceTag + '</span></div>' +
          '<div><span class="intel-label">ISP</span><span class="intel-val">' + d.org + '</span></div>' +
          '<div><span class="intel-label">LOCATION</span><span class="intel-val">' + (d.city || "").replace(/_/g, ' ') + ', ' + (d.country_name || "").replace(/_/g, ' ') + '</span></div>' +
          '<div style="margin-top:15px; border-top:1px solid rgba(0,220,160,0.1); padding-top:15px;">' +
            '<a href="https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude + '" style="color:#00dca0; text-decoration:none; font-size:10px; border:1px solid #00dca0; padding:5px 10px; border-radius:3px; display:inline-block;">VIEW ON SATELLITE MAP</a>' +
          '</div>';
      } catch(e) { 
        body.innerHTML = '<div style="color:#f87171; text-align:center; padding:10px;">FAILED: ' + e.message + '</div>'; 
      }
    }
  </script>
</body>
</html>`;
          return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
        }


        // ── Command Schedule Logs (/schedule/logs) ────────────
        if (url.pathname === "/schedule/logs") {
          if (!isLoggedIn) return renderUnauthorized();

          const q = url.searchParams.get("q") || "";
          const allowedSort = ["created_at", "target_time"];
          const sort = allowedSort.includes(url.searchParams.get("sort")) ? url.searchParams.get("sort") : "created_at";
          const order = url.searchParams.get("order") === "ASC" ? "ASC" : "DESC";
          const offset = parseInt(url.searchParams.get("offset") || "0");
          const limit = parseInt(url.searchParams.get("limit") || "50");

          let dbQuery = "SELECT * FROM command_schedules";
          let countQuery = "SELECT COUNT(*) as count FROM command_schedules";
          let queryParams = [];
          let countParams = [];

          if (q) {
            const likeTerm = `%${q}%`;
            dbQuery += " WHERE (command LIKE ? OR params LIKE ? OR status LIKE ?)";
            countQuery += " WHERE (command LIKE ? OR params LIKE ? OR status LIKE ?)";
            queryParams = [likeTerm, likeTerm, likeTerm];
            countParams = [likeTerm, likeTerm, likeTerm];
          }

          dbQuery += ` ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
          queryParams.push(limit, offset);

          const [dbResult, countResult] = await Promise.all([
            env.DB.prepare(dbQuery).bind(...queryParams).all(),
            env.DB.prepare(countQuery).bind(...(q ? queryParams.slice(0, 3) : [])).first()
          ]);

          const totalSchedules = countResult?.count || 0;
          const schedulesList = dbResult.results;

          let tableRows = "";
          let lastDay = "";
          for (const r of schedulesList) {
            const createdDate = new Date(r.created_at);
            const dayStr = createdDate.toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' });
            const createdStr = createdDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', hour12: true });

            if (dayStr !== lastDay && sort === 'created_at') {
              tableRows += `<tr class="date-sep"><td colspan="6">${dayStr}</td></tr>`;
              lastDay = dayStr;
            }

            const targetDate = new Date(r.target_time);
            const timeStr = targetDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

            let statusStyle = "";
            if (r.status === 'PENDING') statusStyle = "color: #f59e0b";
            else if (r.status === 'EXECUTED') statusStyle = "color: #00dca0";
            else if (r.status === 'CANCELLED') statusStyle = "color: #94a3b8";
            else statusStyle = "color: #ef4444";

            let triggerStatus = "";
            if (r.status === 'EXECUTED') triggerStatus = '<span style="color:#00dca0; opacity:0.8">[ SENT ]</span>';
            else if (r.status === 'PENDING') triggerStatus = '<span style="color:#f59e0b; opacity:0.6">[ WAITING ]</span>';
            else if (r.status === 'CANCELLED') triggerStatus = '<span style="color:#94a3b8; opacity:0.8">[ ABORTED ]</span>';
            else triggerStatus = '<span style="color:#ef4444">[ FAIL ]</span>';

            let actionBtn = "";
            if (r.status === 'PENDING') {
              actionBtn = `<button class="btn-refresh" style="padding: 2px 8px; font-size: 9px; background: #ef4444; border:none; color: #fff; min-width: 75px;" onclick="cancelSchedule(${r.id}, this)">CANCEL</button>`;
            } else if (r.log_output) {
              actionBtn = `<button class="log-btn" style="min-width: 75px;" onclick="showLog(\`${r.log_output.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`, '${r.command.toUpperCase().replace(/_/g, ' ')}', '${(r.params || "—").replace(/'/g, "\\'").replace(/_/g, " ")}', '${timeStr}', '${r.status}')">VIEW LOG</button>`;
            } else {
              actionBtn = `<button class="log-btn" style="min-width: 75px;" disabled>—</button>`;
            }

            tableRows += `<tr id="sched_${r.id}">
          <td style="color:rgba(0,220,160,0.6)">${createdStr}</td>
          <td style="font-weight:bold; color:#00ffc8">${r.command.replace(/_/g, ' ').toUpperCase()}</td>
          <td>${(r.params || "—").replace(/_/g, ' ')}</td>
          <td style="color:#00dca0; font-weight:bold; font-size:14px;">${timeStr}</td>
          <td style="${statusStyle}; font-weight:bold; text-align:right">${r.status}</td>
          <td style="text-align:right; padding-right:12px">${actionBtn}</td>
        </tr>`;
          }

          if (url.searchParams.get("partial") === "true") {
            return new Response(tableRows, { headers: { "Content-Type": "text/html" } });
          }

          const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>Schedule Logs</title>
  <meta name="viewport" content="initial-scale=1.0, minimum-scale=0.3, maximum-scale=5.0, user-scalable=yes">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px 24px 24px 76px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; padding-left: 0; }
    .table-wrapper { overflow-x: auto; width: 100%; }
    .table-wrapper::-webkit-scrollbar { height: 4px; }
    .table-wrapper::-webkit-scrollbar-track { background: rgba(0, 220, 160, 0.05); }
    .table-wrapper::-webkit-scrollbar-thumb { background: rgba(0, 220, 160, 0.3); border-radius: 2px; }
    .table-wrapper::-webkit-scrollbar-thumb:hover { background: rgba(0, 220, 160, 0.6); }
    table { width: max-content; min-width: 100%; table-layout: auto; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); white-space: nowrap; vertical-align: middle; }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); white-space: nowrap; vertical-align: middle; }
    .btn-refresh { background: rgba(0,220,160,0.4); color: #fff; border: 1px solid #00dca0; padding: 5px 15px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: inherit; }
    .btn-refresh:hover { background: rgba(0,220,160,0.6); color: #000; opacity: 1; }
    #searchInput { background: rgba(0,220,160,0.05); color: #00dca0; border: 1px solid rgba(0,220,160,0.3); padding: 5px 12px 5px 30px; border-radius: 3px; font-size: 11px; font-family: inherit; width: 220px; outline: none; }
    .search-wrap { position: relative; display: flex; align-items: center; margin-right: 40px; }
    .search-icon { position: absolute; left: 10px; width: 12px; height: 12px; color: #00dca0; opacity: 0.7; pointer-events: none; }
    .date-sep { background: rgba(0,220,160,0.03); }
    .date-sep td { padding: 8px 12px; font-size: 11px; letter-spacing: 2px; color: #00dca0; opacity: 0.8; border-bottom: 1px solid rgba(0,220,160,0.1); font-weight: bold; border-top: 1px solid rgba(0,220,160,0.15); text-align: center; text-transform: uppercase; }
    .c-sel { position: relative; display: inline-block; }
    .c-sel button { background: rgba(0,220,160,0.03); color: rgba(0,220,160,0.8); border: 1px solid rgba(0,220,160,0.15); padding: 5px 14px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; transition: all 0.2s; }
    .c-sel button:hover { border-color: rgba(0,220,160,0.4); background: rgba(0,220,160,0.08); color: #00dca0; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); right: 0; background: #020c08; border: 1px solid rgba(0,220,160,0.25); min-width: 140px; z-index: 100; box-shadow: 0 8px 30px rgba(0,0,0,0.9); border-radius: 3px; overflow: hidden; animation: fadeUp 0.2s ease-out; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 14px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.05); color: rgba(0,220,160,0.6); transition: all 0.2s; border-left: 2px solid transparent; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.04); color: #00dca0; border-left-color: #00dca0; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

    /* Modal Styles */
    .modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(2, 6, 8, 0.9); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); align-items: center; justify-content: center; }
    .modal.open { display: flex; }
    .modal-content { background: #0a0e12; border: 1px solid var(--border-hi); width: 90%; max-width: 600px; padding: 0; border-radius: var(--r); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 220, 160, 0.1); animation: fadeUp 0.3s var(--ease); overflow: hidden; }
    .modal-header { padding: 16px 20px; background: rgba(0, 220, 160, 0.05); border-bottom: 1px solid rgba(0, 220, 160, 0.2); display: flex; justify-content: space-between; align-items: center; }
    .modal-title { font-family: var(--mono); font-size: 11px; letter-spacing: 3px; font-weight: bold; color: var(--teal); text-transform: uppercase; }
    .modal-close { background: none; border: none; color: var(--teal); font-size: 24px; cursor: pointer; opacity: 0.5; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .modal-close:hover { opacity: 1; transform: rotate(90deg); }
    .modal-body { padding: 24px; font-size: 13px; line-height: 1.6; max-height: 75vh; overflow-y: auto; color: #cbd5e1; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .log-btn { background: rgba(0, 220, 160, 0.08); border: 1px solid rgba(0, 220, 160, 0.3); color: var(--teal); padding: 4px 10px; border-radius: 2px; font-size: 9px; cursor: pointer; font-family: var(--mono); transition: all 0.2s; letter-spacing: 1px; white-space: nowrap; }
    .log-btn:hover { background: var(--teal-dim); border-color: var(--teal); box-shadow: 0 0 10px rgba(0, 220, 160, 0.2); }
    .log-btn:disabled { opacity: 0.3; cursor: not-allowed; border-color: rgba(0, 220, 160, 0.1); }
    @media (max-width: 768px) {
      body { padding: 12px 12px 12px 64px; }
      .header {
        padding-left: 0;
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 15px;
      }
      .header > div {
        flex: 1 1 auto;
      }
      .header h2 {
        white-space: nowrap !important;
        font-size: 13px !important;
        letter-spacing: 2px !important;
      }
      .header > div:last-child {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 8px !important;
        align-items: center !important;
        justify-content: flex-start !important;
      }
      .search-wrap {
        flex: 1 1 auto !important;
        min-width: 200px !important;
        margin: 0 !important;
      }
      #searchInput {
        width: 100% !important;
      }
      .c-sel {
        flex: 1 1 auto !important;
        min-width: 120px !important;
      }
      .c-sel button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .c-sel .opts {
        width: 100%;
      }
      .btn-refresh {
        flex: 1 1 auto !important;
        min-width: 120px !important;
        padding: 8px 12px;
        text-align: center;
      }
      .header > div:last-child > span {
        flex: 1 1 auto !important;
        min-width: 180px !important;
        align-items: center !important;
        text-align: center !important;
        margin-left: 0 !important;
        margin-top: 5px;
        border-top: 1px solid rgba(0, 220, 160, 0.1);
        padding-top: 8px;
        display: block;
      }
      table { font-size: 11px; }
      td, th { padding: 10px 18px !important; }
    }
    ${SHARED_NAV_STYLE}
  </style>
</head>
<body>
  ${SHARED_NAV_HTML}
  <div class="header">
    <div style="display:flex; align-items:center;">
      <h2 style="font-size:16px; letter-spacing:5px;">[ SCHEDULE LOGS ]</h2>
    </div>
    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Search Schedule..." onkeyup="if(event.key==='Enter') window.location.href='/schedule/logs?q='+this.value+'&sort=${sort}&order=${order}'" value="${q}">
      </div>
      <div class="c-sel" id="sortSel">
        <button onclick="toggleSel('sortSel', event)">SORT: ${sort === 'created_at' ? 'CREATE TIME' : 'TARGET TIME'} ▾</button>
        <div class="opts">
          <div onclick="window.location.href='/schedule/logs?q=${q}&sort=created_at&order=${order}'">CREATE TIME</div>
          <div onclick="window.location.href='/schedule/logs?q=${q}&sort=target_time&order=${order}'">TARGET TIME</div>
        </div>
      </div>
      <div class="c-sel" id="orderSel">
        <button onclick="toggleSel('orderSel', event)">ORDER: ${order} ▾</button>
        <div class="opts">
          <div onclick="window.location.href='/schedule/logs?q=${q}&sort=${sort}&order=DESC'">DESCENDING</div>
          <div onclick="window.location.href='/schedule/logs?q=${q}&sort=${sort}&order=ASC'">ASCENDING</div>
        </div>
      </div>
      <button class="btn-refresh" onclick="location.reload()">REFRESH</button>
      <span style="font-size:10px; opacity:0.9; font-weight:bold; letter-spacing:1px; margin-left:35px;">TOTAL: ${totalSchedules}</span>
    </div>
  </div>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th style="padding-left:12px">CREATED</th>
          <th>COMMAND</th>
          <th>PARAMS</th>
          <th>TARGET TIME</th>
          <th style="text-align:right">STATUS</th>
          <th style="text-align:right; padding-right:12px">LOGS</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>
  <script>
    function toggleSel(id, e) {
      e.stopPropagation();
      document.querySelectorAll('.c-sel').forEach(el => {
        if(el.id !== id) el.classList.remove('open');
      });
      document.getElementById(id).classList.toggle('open');
    }
    document.addEventListener('click', () => {
      document.querySelectorAll('.c-sel').forEach(el => el.classList.remove('open'));
    });

    let cancelTimers = {};
    async function cancelSchedule(id, btn) {
      if (btn.innerText !== 'SURE?') {
        const oldText = btn.innerText;
        btn.innerText = 'SURE?';
        cancelTimers[id] = setTimeout(() => {
          btn.innerText = oldText;
        }, 3000);
        return;
      }
      clearTimeout(cancelTimers[id]);
      btn.innerText = '...';
      try {
        const resp = await fetch('/schedule/cancel?id=' + id, { method: 'POST' });
        if (resp.ok) location.reload();
        else alert('FAILED TO CANCEL');
      } catch (e) { alert('ERROR: ' + e.message); }
    }
    
    function showLog(text, cmd, params, time, status) {
      document.getElementById('logModalTitle').textContent = 'EVENT DETAILS: ' + cmd;
      const statusColor = status === 'EXECUTED' ? '#00dca0' : (status === 'PENDING' ? '#f59e0b' : '#ef4444');
      var h = '<div style="background:rgba(0,220,160,0.03); border:1px solid rgba(0,220,160,0.1); padding:15px; margin-bottom:20px; border-radius:4px; font-family:var(--mono);">' +
              '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="opacity:0.5; font-size:10px; letter-spacing:1px;">COMMAND</span> <span style="color:#00ffc8; font-weight:bold; font-size:11px;">' + cmd + '</span></div>' +
              '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="opacity:0.5; font-size:10px; letter-spacing:1px;">PARAMS</span> <span style="color:#fff; font-size:11px;">' + params + '</span></div>' +
              '<div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="opacity:0.5; font-size:10px; letter-spacing:1px;">TARGET</span> <span style="color:#fff; font-size:11px;">' + time + '</span></div>' +
              '<div style="display:flex; justify-content:space-between;"><span style="opacity:0.5; font-size:10px; letter-spacing:1px;">STATUS</span> <span style="font-weight:bold; color:' + statusColor + '; font-size:11px;">' + status + '</span></div>' +
              '</div>' +
              '<div style="font-size:10px; color:var(--teal); font-weight:bold; margin-bottom:10px; letter-spacing:2px; display:flex; align-items:center; gap:10px;"><span style="flex:1; height:1px; background:rgba(0,220,160,0.15);"></span> RAW OUTPUT <span style="flex:1; height:1px; background:rgba(0,220,160,0.15);"></span></div>' +
              '<div style="background:#000; padding:16px; border:1px solid rgba(0,220,160,0.2); border-radius:2px; color:#00ffc8; font-family:var(--mono); white-space:pre-wrap; font-size:12px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5); border-left: 2px solid var(--teal);">' + text + '</div>';
      document.getElementById('logModalBody').innerHTML = h;
      document.getElementById('logModal').classList.add('open');
    }
    function closeLog() { document.getElementById('logModal').classList.remove('open'); }
    window.onclick = function(e) { if(e.target.id === 'logModal') closeLog(); }
  </script>

  <div id="logModal" class="modal">
    <div class="modal-content">
      <div class="modal-header">
        <span class="modal-title" id="logModalTitle">EXECUTION LOG</span>
        <button class="modal-close" onclick="closeLog()">&times;</button>
      </div>
      <div class="modal-body" id="logModalBody"></div>
    </div>
  </div>
</body></html>`;
          return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
        }

        // Default: Serve Assets
        return env.ASSETS.fetch(request);
      };


      const response = await handleRequest();
      ctx.waitUntil(logRequest(response.status));

      // Universal Favicon Injection — applies to ALL HTML responses
      const ct = response.headers.get("content-type") || "";
      if (ct.includes("text/html")) {
        const original = await response.text();
        const faviconTag = '<link rel="icon" type="image/svg+xml" href="/favicon.svg">';
        const injected = original.includes('rel="icon"')
          ? original
          : original.replace(/<head([^>]*)>/i, `<head$1>\n  ${faviconTag}`);
        return new Response(injected, {
          status: response.status,
          headers: { "Content-Type": "text/html; charset=UTF-8" }
        });
      }

      return response;
    } catch (globalErr) {
      return new Response(`GLOBAL WORKER CRASH: ${globalErr.message}`, { status: 500 });
    }
  },

  // ── Scheduled Cron Handler ────────────────────────────────
  async scheduled(event, env, ctx) {
    const macroId = env.MACRO_ID;
    if (!macroId) return;

    try {
      // Find pending commands where target_time has arrived
      const { results } = await env.DB.prepare(
        "SELECT * FROM command_schedules WHERE status = 'PENDING' AND target_time <= ?"
      ).bind(Date.now()).all();

      for (const item of results) {
        try {
          const keyToUse = item.secret_key || env.MACRO_KEY || env.REPORT_KEY;
          // Construct target URL to match manual control exactly
          let target = `https://trigger.macrodroid.com/${macroId}/control?cmd=${item.command}&key=${keyToUse}`;
          if (item.params) target += `&cmd2=${encodeURIComponent(item.params)}`;

          const resp = await fetch(target, {
            headers: { "User-Agent": "Tactical-Scheduler/1.0 (Cloudflare-Worker)" }
          });

          const logText = await resp.text();

           if (resp.ok) {
            await env.DB.prepare("UPDATE command_schedules SET status = 'EXECUTED', log_output = ? WHERE id = ?").bind(logText, item.id).run();

            // Record scheduled command sent to Macrodroid
            const commandDesc = item.params ? `${item.command} (${item.params})` : item.command;
            try {
              await env.LOCATION_KV.put("last_sent_command", JSON.stringify({
                command: commandDesc,
                timestamp: Date.now()
              }));
            } catch (kvErr) {
              console.error("Failed to write scheduled command to KV", kvErr);
            }
          } else {
            console.error(`Trigger Failed [${resp.status}]: ${logText}`);
            await env.DB.prepare("UPDATE command_schedules SET status = 'FAILED', log_output = ? WHERE id = ?").bind(`[${resp.status}] ${logText}`, item.id).run();
          }
        } catch (execErr) {
          console.error("Exec fail:", execErr);
          await env.DB.prepare("UPDATE command_schedules SET status = 'FAILED', log_output = ? WHERE id = ?").bind(`ERROR: ${execErr.message}`, item.id).run();
        }
      }
    } catch (dbErr) {
      console.error("Cron DB Error:", dbErr);
    }
  }
};
