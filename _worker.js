export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const cookie = request.headers.get("Cookie") || "";
      const isLoggedIn = cookie.includes("session=authorized");
  
      const logRequest = async (statusCode) => {
        try {
          if (url.searchParams.get("nosave") === "1") return;
          if (url.pathname === "/statuslogs") return; // Never log status history page visits

          
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

          // Auto-cleanup (Keep last 2000 logs)
          if (Math.random() < 0.05) {
            ctx.waitUntil(env.DB.prepare("DELETE FROM logs WHERE id IN (SELECT id FROM logs ORDER BY timestamp DESC LIMIT -1 OFFSET 2000)").run());
          }
        } catch (e) {
          console.error("LOG_FAIL:", e.message);
        }
      };

    const handleRequest = async () => {
      const ip = request.headers.get("cf-connecting-ip") || "0.0.0.0";
      const cf = request.cf || {};
      const location = cf.country ? `${cf.city || "Unknown"}, ${cf.region || "Unknown"}, ${cf.country}` : "Global Intelligence Grid";

    // 1. Handle Login Request
    if (url.pathname === "/login") {
      const key = url.searchParams.get("key");
      const secretKey = env.ACCESS_KEY || "123"; // Fallback to 123 until secret is set
      
      if (key === secretKey) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/home?login=success",
            "Set-Cookie": "session=authorized; Path=/; HttpOnly; SameSite=Lax; Max-Age=1800"
          }
        });
      }
      return Response.redirect(url.origin + "/?error=1", 302);
    }

    // 2. Handle Logout
    if (url.pathname === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/",
          "Set-Cookie": "session=; Path=/; Max-Age=0"
        }
      });
    }

    // 3. Handle Home/Dashboard
    if (url.pathname === "/home") {
      if (!isLoggedIn) return renderUnauthorized();
      
      // Fetch home.html from assets
      const home = await env.ASSETS.fetch(new Request(url.origin + "/home.html"));
      return home;
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
'  </script>' +
'</body></html>', { status: 401, headers: { "Content-Type": "text/html; charset=UTF-8" } });
    };

    // 4. API Endpoints
    // ── Update Hardware Status (/status) ──────────────────
    if (url.pathname === "/status") {
      const { searchParams } = url;
      if (searchParams.get("key") !== (env.REPORT_KEY || "REPORT_SECRET")) {
        return renderTactical("UNAUTHORIZED", 401);
      }

      const hardwareData = {
        battery_level: searchParams.get("battery_level"),
        battery_status: searchParams.get("battery_status"),
        battery_temperature: searchParams.get("battery_temperature"),
        signal_strength: searchParams.get("signal_strength"),
        phone_uptime: searchParams.get("phone_uptime"),
        updated: Date.now()
      };
      
      // Persist to D1 for history
      try {
        const battery = parseInt(hardwareData.battery_level || "0");
        const charging = (hardwareData.battery_status || "").toLowerCase().includes("charging") ? 1 : 0;
        const signal = parseInt(hardwareData.signal_strength || "0");
        const rawTemp = hardwareData.battery_temperature || "0";
        const temp = rawTemp.includes("°") ? rawTemp : rawTemp + "°C";
        const uptime = hardwareData.phone_uptime || "Unknown";
        
        await env.DB.prepare(
          "INSERT INTO status_logs (timestamp, battery, charging, signal, temperature, uptime, ip, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(Date.now(), battery, charging, signal, temp, uptime, ip, location).run();
      } catch (e) {
        console.error("D1 Hardware Log Error:", e);
      }

      await env.LOCATION_KV.put("status", JSON.stringify(hardwareData));
      return renderTactical("OK_STATUS", 200);
    }

    // ── Update Location Link (/report) ──────────────────────
    if (url.pathname === "/report") {
      const { searchParams } = url;
      if (searchParams.get("key") !== (env.REPORT_KEY || "REPORT_SECRET")) {
        return renderTactical("UNAUTHORIZED", 401);
      }

      const link = searchParams.get("link");
      if (link) {
        await env.LOCATION_KV.put("location", JSON.stringify({ link, updated: Date.now() }));
        return renderTactical("OK_LOCATION", 200);
      }
      return renderTactical("MISSING_LINK", 400);
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
      
      const macroId = env.MACRO_ID || "PASTE_YOUR_ID_FOR_LOCAL_TESTING";
      let target = `https://trigger.macrodroid.com/${macroId}/control?cmd=${cmd}&key=${key}`;
      if (cmd2) target += `&cmd2=${encodeURIComponent(cmd2)}`;
      
      return await fetch(target);
    }

    // ── File Vault Storage (/upload) ────────────────────────
    if (url.pathname === "/upload") {
      if (request.method !== "POST") {
        return renderTactical("UPLOAD_ENDPOINT_ACTIVE (POST REQUIRED)", 405);
      }
      try {
        const { searchParams } = url;
        const providedKey = searchParams.get("key");
        const secretKey = env.REPORT_KEY || "REPORT_SECRET";

        if (providedKey !== secretKey) {
          return renderTactical("UNAUTHORIZED", 401);
        }

        const type = searchParams.get("type") || "image";
        const receivedAt = Date.now(); // Server receipt timestamp
        const fileId = `${type}_${receivedAt}`;
        const blob = await request.arrayBuffer();

        if (!blob || blob.byteLength === 0) {
          return renderTactical("EMPTY_PAYLOAD", 400);
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
        return renderTactical(`UPLOAD_CRASH: ${err.message}`, 500);
      }
    }

    // ── File Vault Delete (/vault/delete) ───────────────────
    if (url.pathname === "/vault/delete") {
      try {
        if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });
        const fileId = url.searchParams.get("id");
        if (!fileId) return new Response("MISSING_ID", { status: 400 });
        
        await Promise.all([
          env.LOCATION_KV.delete(`vault_${fileId}`),
          env.DB.prepare("DELETE FROM vault_files WHERE id = ?").bind(fileId).run()
        ]);
        
        return new Response("DELETED", { status: 200 });
      } catch (err) {
        return new Response(`DELETE_CRASH: ${err.message}`, { status: 500 });
      }
    }

    // ── File Vault Retrieval (/vault/:id) ──────────────────
    if (url.pathname.startsWith("/vault/") && !["/vault/list", "/vault/auth", "/vault/delete", "/vault/logout"].includes(url.pathname)) {
      try {
        if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });

        const vaultPass = (env.VAULT_PASS || env.VALULT_PASS || "").trim();
        const cookies = request.headers.get("Cookie") || "";
        const isVaultAuthenticated = cookies.includes("vault_token=authorized");

        if (vaultPass && !isVaultAuthenticated) {
          return Response.redirect(url.origin + "/vault/auth?next=" + encodeURIComponent(url.pathname), 302);
        }

        const fileId = url.pathname.replace("/vault/", "");
        const { value, metadata } = await env.LOCATION_KV.getWithMetadata(`vault_${fileId}`, { type: "arrayBuffer" });

        if (!value) return new Response("FILE_NOT_FOUND", { status: 404 });

        return new Response(value, {
          headers: { 
            "Content-Type": metadata?.contentType || "application/octet-stream",
            "Content-Disposition": "inline"
          }
        });
      } catch (err) {
        return new Response(`VAULT_CRASH: ${err.message}`, { status: 500 });
      }
    }

    // ── Vault Authentication Gateway (/vault/auth) ──────────
    if (url.pathname === "/vault/auth") {
      if (!isLoggedIn) return Response.redirect(url.origin + "/", 302);

      const vaultPass = (env.VAULT_PASS || env.VALULT_PASS || "").trim();
      const cookies = request.headers.get("Cookie") || "";
      const isVaultAuthenticated = cookies.includes("vault_token=authorized");

      // Handle Password Submission (POST)
      if (request.method === "POST") {
        try {
          const rawBody = (await request.text()).trim();
          const pass = atob(rawBody).trim();
          
          if (vaultPass && pass === vaultPass) {
            return new Response("OK", {
              headers: { "Set-Cookie": "vault_token=authorized; Path=/; HttpOnly; SameSite=Lax; Max-Age=600" }
            });
          }
          return new Response("INVALID", { status: 403 });
        } catch (err) {
          return new Response(`AUTH_ERROR: ${err.message}`, { status: 500 });
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
    <p>VALUT KEY IS REQUIRED TO ACCESS VALUT</p>
    <div class="input-group">
      <input type="text" id="vlt_input" name="vault_access_key_${Math.random().toString(36).substring(7)}" placeholder="ENTER ACCESS KEY..." onkeypress="if(event.key==='Enter') login()" autocomplete="off" data-lpignore="true">
    </div>
    <div class="btn-wrap">
      <button onclick="login()">AUTHORIZE</button>
    </div>
    <div id="errMsg" class="err">ACCESS KEY DENIED</div>
  </div>
  <script>
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
          "Set-Cookie": "vault_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
          "Location": "/vault/list"
        }
      });
    }

    // ── File Vault Index (/vault/list) ──────────────────────
    if (url.pathname === "/vault/list") {
      try {
        if (!isLoggedIn) return renderUnauthorized();

        const vaultPass = (env.VAULT_PASS || env.VALULT_PASS || "").trim();
        const cookies = request.headers.get("Cookie") || "";
        const isVaultAuthenticated = cookies.includes("vault_token=authorized");

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
              duration = secs >= 60 ? `${Math.floor(secs/60)}m ${secs%60}s` : `${secs}s`;
            } else if (r.type === "VIDEO" && r.size > 0) {
              const secs = Math.round(r.size / (3 * 1024 * 1024 / 8));
              duration = secs >= 60 ? `${Math.floor(secs/60)}m ${secs%60}s` : `${secs}s`;
            }

            return { id: r.id, typeStr: r.type, timeStr, receivedStr, sizeMB, contentType: r.content_type, duration };
          });

          let tableRows = rows.map(r => `
            <tr id="row_${r.id}">
              <td>${r.id}</td>
              <td>${r.receivedStr}</td>
              <td class="type-${r.typeStr.toLowerCase()}">${r.typeStr}</td>
              <td style="opacity:0.9; font-size:11px;">${r.contentType}</td>
              <td>${r.sizeMB} MB</td>
              <td>${r.duration}</td>
              <td style="display:flex; gap:6px; align-items:center;">
                <a href="/vault/${r.id}" target="_blank">>> OPEN</a>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px; font-size: 13px; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; }
    .count { opacity: 0.8; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .type-image { color: #60a5fa; }
    .type-audio { color: #f59e0b; }
    .type-video { color: #f87171; }
    a { color: #00dca0; text-decoration: none; border: 1px solid rgba(0,220,160,0.4); padding: 3px 8px; border-radius: 3px; font-size: 11px; }
    a:hover { background: rgba(0,220,160,0.1); }
    .footer { margin-top: 20px; font-size: 10px; opacity: 0.6; }
    .c-sel { position: relative; display: inline-block; }
    .c-sel button { background: rgba(0,220,160,0.15); color: #00dca0; border: 1px solid rgba(0,220,160,0.5); padding: 5px 12px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #06080a; border: 1px solid rgba(0,220,160,0.6); min-width: 120px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.8); border-radius: 3px; overflow: hidden; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 12px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.2); color: #00dca0; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.15); color: #00dca0; }
  </style>
</head>
<body>
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
      <div style="font-size:11px; font-weight:bold; letter-spacing:1px; color:#00dca0;">CAPACITY: ${totalMB.toFixed(2)} MB / 1024 MB</div>
      <a href="/vault/logout" style="background:rgba(239,68,68,0.1); color:#f87171; border:1px solid rgba(239,68,68,0.3); font-size:9px; padding:2px 10px; margin-top:4px; text-decoration:none;">LOGOUT FROM VAULT</a>
    </div>
  </div>
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
      if (!ip) return new Response("MISSING_IP", { status: 400 });

      try {
        const cached = await env.DB.prepare("SELECT * FROM geo_cache WHERE ip = ?").bind(ip).first();
        if (cached) {
          return new Response(JSON.stringify({ ...cached, country_name: cached.country, latitude: cached.latitude, longitude: cached.longitude, source: "D1_CACHE" }), {
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
            if (!d.error) data = { ...d, source: "IPAPI_CO" };
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
                  source: "IP_API_COM"
                };
              } else lastError = d.message || "IP-API Error";
            }
          } catch (e) { lastError = e.message; }
        }

        if (data) {
          await env.DB.prepare("INSERT INTO geo_cache (ip, org, city, region, country, latitude, longitude, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
            .bind(ip, data.org || "Unknown", data.city || "Unknown", data.region || "Unknown", data.country_name || "Unknown", data.latitude || 0, data.longitude || 0, Date.now())
            .run();
          return new Response(JSON.stringify({ ...data, source: data.source || "REMOTE_PROVIDER" }), {
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
              .bind(data.time, data.method, data.path, data.status, data.ip, data.source || "LEGACY", data.noisy ? 1 : 0, data.location || "KV_DATA")
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
        const limit = 500;

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
          const dayStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });

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

          const locationLabel = (r.location || "GLOBAL").toUpperCase();
          
          tableRows += `<tr id="row_${r.id}" class="${isAlert ? 'row-alert' : ''}" data-noisy="${noisy}" data-method="${r.method}">
            <td>${timeStr}</td>
            <td>${r.method}</td>
            <td style="color:#fff">${pathDisplay}</td>
            <td>${statusCol}</td>
            <td><span style="color:#f59e0b">${r.source}</span></td>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px; font-size: 13px; user-select: none; -webkit-user-select: none; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .row-alert { background: rgba(255,62,62,0.1) !important; }
    .status-alert { color: #ff3e3e !important; font-weight: bold; }
    .date-sep { background: rgba(0,220,160,0.05); }
    .date-sep td { color: rgba(0,220,160,0.6); font-weight: bold; text-align: center; letter-spacing: 4px; font-size: 12px; padding: 8px 0; border-top: 1px solid rgba(0,220,160,0.15); border-bottom: 1px solid rgba(0,220,160,0.15); text-transform: uppercase; }
    .c-sel { position: relative; display: inline-block; margin-right: 5px; }
    .c-sel button { background: rgba(0,220,160,0.15); color: #00dca0; border: 1px solid rgba(0,220,160,0.5); padding: 5px 12px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #06080a; border: 1px solid rgba(0,220,160,0.6); min-width: 120px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.8); border-radius: 3px; overflow: hidden; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 12px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.2); color: #00dca0; }
    .btn-refresh { background: rgba(0,220,160,0.25); color: #00dca0; border: 1px solid #00dca0; padding: 5px 15px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
    .btn-refresh:hover { background: rgba(0,220,160,0.4); transform: scale(1.05); }
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
    .modal-intel { position: fixed; inset: 0; background: rgba(2,6,8,0.95); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .intel-content { background: #050505; border: 1px solid #00dca0; padding: 25px; border-radius: 4px; width: 100%; max-width: 340px; box-shadow: none; }
    .intel-header { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,220,160,0.2); padding-bottom: 10px; margin-bottom: 15px; }
    .intel-body div { margin-bottom: 15px; }
    .intel-label { color: #00dca0; opacity: 0.6; font-size: 9px; letter-spacing: 2px; display: block; margin-bottom: 4px; font-weight: bold; }
    .intel-val { color: #fff; font-weight: bold; font-size: 13px; display: block; letter-spacing: 0.5px; user-select: text; -webkit-user-select: text; word-break: break-all; line-height: 1.4; }
    .intel-close { background: transparent; border: none; color: rgba(0,220,160,0.5); cursor: pointer; font-size: 20px; line-height: 1; }
    .intel-close:hover { color: #00dca0; }
    .new-row td { animation: highlight-new 2s ease-out; }
    @keyframes highlight-new {
      0% { background: rgba(0,220,160,0.3); }
      100% { background: transparent; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; align-items:center; gap:10px;">
      <h2>[ HTTP REQUEST HISTORY ]</h2>
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" id="searchInput" placeholder="Search Logs ..." onkeyup="handleSearch(event)">
      </div>
      <div class="c-sel" id="showSel">
        <button onclick="toggleSel('showSel', event)"><span id="showLbl">Default</span> ▾</button>
        <div class="opts">
          <div onclick="setShow('DEFAULT', 'Default')">Default</div>
          <div onclick="setShow('HIDDEN', 'Hidden')">Hidden</div>
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
    </div>
    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px; text-align:right;">
      <div id="capText" style="font-size: 11px; font-weight: bold; color: rgba(0,220,160,0.8); letter-spacing: 1px;">
        CAPACITY: ${totalLogs} / 2000
      </div>
      <div id="syncText" style="font-size: 8px; color: rgba(0,220,160,0.7); letter-spacing: 1px; font-weight: bold;">LAST SYNC: NEVER</div>
    </div>
  </div>
  <table>
    <thead>
      <tr><th>TIMESTAMP</th><th>METHOD</th><th>PATH</th><th>STATUS</th><th>EMERGENCE SOURCE</th><th>IP ADDRESS</th></tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

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
    const PAGE_LIMIT = 500;
    const TOTAL_CAPACITY = ${totalLogs};

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

        const sourceTag = d.source === "D1_CACHE" ? 
          '<span style="font-size:7px; color:#00dca0; opacity:0.8; margin-left:10px;">[ INSTANT_CACHE ]</span>' : 
          '<span style="font-size:7px; color:#f59e0b; opacity:0.8; margin-left:10px;">[ PROXIED_FETCH ]</span>';

        body.innerHTML = '<div><span class="intel-label">IP ADDRESS</span><span class="intel-val">' + d.ip + sourceTag + '</span></div>' +
          '<div><span class="intel-label">ORGANIZATION / ISP</span><span class="intel-val">' + d.org + '</span></div>' +
          '<div><span class="intel-label">LOCATION</span><span class="intel-val">' + d.city + ', ' + d.region + ', ' + d.country_name + '</span></div>' +
          '<div style="margin-top:15px; border-top:1px solid rgba(0,220,160,0.1); padding-top:15px;">' +
            '<a href="https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude + '" target="_blank" style="color:#00dca0; text-decoration:none; font-size:10px; border:1px solid #00dca0; padding:5px 10px; border-radius:3px; display:inline-block;">VIEW ON SATELLITE MAP</a>' +
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
      const btn = document.getElementById('refreshBtn');
      const cap = document.getElementById('capText');
      const oldIds = Array.from(document.querySelectorAll('tr[id]')).map(r => r.id);
      
      if (!isAuto) {
        btn.classList.add('refreshing');
        btn.innerText = 'SYNCING...';
      }
      
      try {
        const fetchUrl = isAuto ? window.location.pathname + '?nosave=1' : window.location.href;
        const resp = await fetch(fetchUrl);
        if (!resp.ok) throw new Error('FAIL');
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        
        const newTbody = doc.querySelector('tbody');
        const newCap = doc.getElementById('capText');
        
        if (newTbody && newCap) {
          document.querySelector('tbody').innerHTML = newTbody.innerHTML;
          cap.innerText = newCap.innerText;
          
          // Highlight new rows
          document.querySelectorAll('tbody tr').forEach(r => {
            if (r.id && !oldIds.includes(r.id)) {
              r.classList.add('new-row');
            }
          });
          
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
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      
      rows.sort((a, b) => {
        const timeA = new Date(a.children[0].innerText).getTime();
        const timeB = new Date(b.children[0].innerText).getTime();
        return curSort === 'NEWEST' ? timeB - timeA : timeA - timeB;
      });

      tbody.innerHTML = '';
      rows.forEach(r => {
        const method = r.dataset.method;
        const isNoisy = r.dataset.noisy === 'true';
        const rowText = r.innerText.toLowerCase();
        
        let showMatch = false;
        if (curShow === 'DEFAULT' && !isNoisy) showMatch = true;
        if (curShow === 'HIDDEN' && isNoisy) showMatch = true;
        if (curShow === 'ALL') showMatch = true;

        const searchMatch = !searchTerm || rowText.includes(searchTerm);

        if (showMatch && searchMatch && (curFilter === 'ALL' || method === curFilter)) {
          r.style.display = '';
        } else {
          r.style.display = 'none';
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
        const limit = 500;

        let dbQuery = "SELECT * FROM status_logs";
        let countQuery = "SELECT COUNT(*) as count FROM status_logs";
        let queryParams = [limit, offset];
        let countParams = [];

        if (q) {
          const likeTerm = `%${q}%`;
          dbQuery += " WHERE ip LIKE ? OR location LIKE ? OR temperature LIKE ? OR uptime LIKE ?";
          countQuery += " WHERE ip LIKE ? OR location LIKE ? OR temperature LIKE ? OR uptime LIKE ?";
          queryParams = [likeTerm, likeTerm, likeTerm, likeTerm, limit, offset];
          countParams = [likeTerm, likeTerm, likeTerm, likeTerm];
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
          const dayStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeStr = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true });
          
          if (dayStr !== lastDay) {
            tableRows += `<tr class="date-sep"><td colspan="5">${dayStr}</td></tr>`;
            lastDay = dayStr;
          }

          const battColor = r.battery < 20 ? '#f87171' : (r.battery < 50 ? '#fbbf24' : '#00dca0');
          const chargingIcon = r.charging ? '⚡' : '';
          
          tableRows += `<tr>
            <td>${timeStr}</td>
            <td style="font-weight:bold; color:${battColor}">${r.battery}% ${chargingIcon}</td>
            <td style="color:#60a5fa;">${r.signal} dBm</td>
            <td style="color:#fb923c;">${r.temperature}</td>
            <td style="color:#a855f7; font-size:11px;">${r.uptime}</td>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080a; color: #00dca0; font-family: 'Courier New', monospace; padding: 24px; font-size: 13px; user-select: none; -webkit-user-select: none; }
    h2 { letter-spacing: 5px; font-size: 16px; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00dca0; padding-bottom: 12px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 10px; letter-spacing: 2px; color: rgba(0,220,160,0.85); border-bottom: 1px solid rgba(0,220,160,0.15); }
    td { padding: 10px 12px; border-bottom: 1px solid rgba(0,220,160,0.07); }
    tr:hover td { background: rgba(0,220,160,0.03); }
    .date-sep { background: rgba(0,220,160,0.05); }
    .date-sep td { color: rgba(0,220,160,0.6); font-weight: bold; text-align: center; letter-spacing: 4px; font-size: 12px; padding: 8px 0; border-top: 1px solid rgba(0,220,160,0.15); border-bottom: 1px solid rgba(0,220,160,0.15); text-transform: uppercase; }
    .btn-refresh { background: rgba(0,220,160,0.25); color: #00dca0; border: 1px solid #00dca0; padding: 5px 15px; border-radius: 3px; font-size: 11px; font-weight: bold; cursor: pointer; transition: all 0.2s; font-family: inherit; white-space: nowrap; }
    .btn-refresh:hover { background: rgba(0,220,160,0.4); transform: scale(1.05); }
    .btn-refresh:active { transform: scale(0.95); }
    .refreshing { opacity: 0.5; pointer-events: none; }
    .search-wrap { position: relative; display: flex; align-items: center; margin: 0 15px; }
    .search-icon { position: absolute; left: 10px; width: 12px; height: 12px; color: #00dca0; opacity: 0.7; pointer-events: none; }
    #searchInput { background: rgba(0,220,160,0.05); color: #00dca0; border: 1px solid rgba(0,220,160,0.3); padding: 5px 12px 5px 30px; border-radius: 3px; font-size: 11px; font-family: inherit; width: 220px; outline: none; transition: border 0.2s; user-select: text; -webkit-user-select: text; }
    #searchInput:focus { border-color: #00dca0; background: rgba(0,220,160,0.1); }
    .load-more-wrap { display: flex; justify-content: center; padding: 40px 0; border-top: 1px solid rgba(0,220,160,0.1); margin-top: 20px; }
    #intelModal { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(2,6,8,0.95); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal-content { background: #050505; border: 1px solid #00dca0; width: 100%; max-width: 340px; border-radius: 4px; box-shadow: none; animation: modalIn 0.2s ease-out; }
    @keyframes modalIn { from { opacity: 0; transform: translateY(5px); } }
    .modal-header { padding: 15px 20px; border-bottom: 1px solid rgba(0,220,160,0.2); display: flex; justify-content: space-between; align-items: center; }
    .modal-body { padding: 25px; }
    .intel-label { display: block; font-size: 9px; color: #00dca0; opacity: 0.6; letter-spacing: 2px; margin-bottom: 4px; font-weight: bold; }
    .intel-val { display: block; color: #fff; margin-bottom: 15px; font-size: 13px; font-weight: bold; word-break: break-all; line-height: 1.4; }
    .c-sel { position: relative; display: inline-block; margin-right: 5px; }
    .c-sel button { background: rgba(0,220,160,0.15); color: #00dca0; border: 1px solid rgba(0,220,160,0.5); padding: 5px 12px; border-radius: 3px; font-size: 11px; font-weight: bold; font-family: inherit; cursor: pointer; outline: none; }
    .c-sel .opts { display: none; position: absolute; top: calc(100% + 5px); left: 0; background: #06080a; border: 1px solid rgba(0,220,160,0.6); min-width: 120px; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.8); border-radius: 3px; overflow: hidden; }
    .c-sel.open .opts { display: block; }
    .c-sel .opts div { padding: 10px 12px; font-size: 11px; font-weight: bold; cursor: pointer; border-bottom: 1px solid rgba(0,220,160,0.2); color: #00dca0; }
    .c-sel .opts div:last-child { border-bottom: none; }
    .c-sel .opts div:hover { background: rgba(0,220,160,0.15); color: #00dca0; }
    @media (max-width: 768px) {
      .header { flex-direction: column; align-items: flex-start; }
      .search-wrap { margin: 10px 0; width: 100%; }
      #searchInput { width: 100%; }
      table { font-size: 11px; }
      td, th { padding: 8px 5px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex; align-items:center; gap:10px;">
      <h2>[ HARDWARE STATUS HISTORY ]</h2>
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
    </div>
    <div style="text-align:right;">
      <div style="font-size:10px; color:rgba(0,220,160,0.5); letter-spacing:1px; margin-bottom:3px;">STORAGE_D1_SQL</div>
      <div id="capText" style="font-size:9px; letter-spacing:2px;">TOTAL_RECORDS: ${totalLogs}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>TIMESTAMP</th>
        <th>BATTERY</th>
        <th>SIGNAL</th>
        <th>TEMPERATURE</th>
        <th>UPTIME</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div id="loadMoreWrap" class="load-more-wrap" style="display: ${totalLogs > limit ? 'flex' : 'none'}">
    <button id="loadMoreBtn" class="btn-refresh" style="padding: 12px 30px;" onclick="loadMore()">LOAD MORE ARCHIVE DATA</button>
  </div>

  <div id="intelModal" onclick="hideIntel()">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-header">
        <span style="font-size:10px; letter-spacing:2px; color:rgba(0,220,160,0.6);">GEOGRAPHIC_INTEL</span>
        <button onclick="hideIntel()" style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:18px;">&times;</button>
      </div>
      <div id="intelBody" class="modal-body"></div>
    </div>
  </div>

  <script>
    let curOffset = ${offset};
    const PAGE_LIMIT = ${limit};
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

    // Live Polling Logic
    setInterval(() => {
      const q = document.getElementById('searchInput').value.trim();
      if (q || currentOrder === "ASC") return; // Don't auto-refresh while searching or viewing oldest
      
      fetch("/statuslogs?q=&order=DESC&partial=true")
        .then(r => r.text())
        .then(html => {
          if (html.trim()) {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = html;
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

    function hideIntel() { document.getElementById('intelModal').style.display = 'none'; }
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

        body.innerHTML = '<div><span class="intel-label">IP ADDRESS</span><span class="intel-val">' + d.ip + '</span></div>' +
          '<div><span class="intel-label">ISP</span><span class="intel-val">' + d.org + '</span></div>' +
          '<div><span class="intel-label">LOCATION</span><span class="intel-val">' + d.city + ', ' + d.country_name + '</span></div>' +
          '<div style="margin-top:15px; border-top:1px solid rgba(0,220,160,0.1); padding-top:15px;">' +
            '<a href="https://www.google.com/maps?q=' + d.latitude + ',' + d.longitude + '" target="_blank" style="color:#00dca0; text-decoration:none; font-size:10px; border:1px solid #00dca0; padding:5px 10px; border-radius:3px; display:inline-block;">VIEW ON SATELLITE MAP</a>' +
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


      // Default: Serve Assets
      return env.ASSETS.fetch(request);
    };

      const response = await handleRequest();
      ctx.waitUntil(logRequest(response.status));
      return response;
    } catch (globalErr) {
      return new Response(`GLOBAL_WORKER_CRASH: ${globalErr.message}\nStack: ${globalErr.stack}`, { status: 500 });
    }
  }
};
