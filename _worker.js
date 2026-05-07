export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cookie = request.headers.get("Cookie") || "";
    const isLoggedIn = cookie.includes("session=authorized");

    // 1. Handle Login Request
    if (url.pathname === "/login") {
      const key = url.searchParams.get("key");
      const secretKey = env.ACCESS_KEY || "123"; // Fallback to 123 until secret is set
      
      if (key === secretKey) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/home?login=success",
            "Set-Cookie": "session=authorized; Path=/; HttpOnly; SameSite=Lax; Max-Age=900"
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
      if (!isLoggedIn) return Response.redirect(url.origin + "/", 302);
      
      // Fetch home.html from assets
      const home = await env.ASSETS.fetch(new Request(url.origin + "/home.html"));
      return home;
    }

    // 4. API Endpoints
    // ── Update Hardware Status (/status) ──────────────────
    if (url.pathname === "/status") {
      const { searchParams } = url;
      if (searchParams.get("key") !== (env.REPORT_KEY || "REPORT_SECRET")) {
        return new Response("UNAUTHORIZED", { status: 401 });
      }

      const hardwareData = {
        battery_level: searchParams.get("battery_level"),
        battery_status: searchParams.get("battery_status"),
        battery_temperature: searchParams.get("battery_temperature"),
        signal_strength: searchParams.get("signal_strength"),
        phone_uptime: searchParams.get("phone_uptime"),
        updated: Date.now()
      };
      await env.LOCATION_KV.put("status", JSON.stringify(hardwareData));
      return new Response("OK_STATUS");
    }

    // ── Update Location Link (/report) ──────────────────────
    if (url.pathname === "/report") {
      const { searchParams } = url;
      if (searchParams.get("key") !== (env.REPORT_KEY || "REPORT_SECRET")) {
        return new Response("UNAUTHORIZED", { status: 401 });
      }

      const link = searchParams.get("link");
      if (link) {
        await env.LOCATION_KV.put("location", JSON.stringify({ link, updated: Date.now() }));
        return new Response("OK_LOCATION");
      }
      return new Response("MISSING_LINK", { status: 400 });
    }

    if (url.pathname === "/poll") {
      if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });
      
      const [status, location] = await Promise.all([
        env.LOCATION_KV.get("status", { type: "json" }),
        env.LOCATION_KV.get("location", { type: "json" })
      ]);

      return new Response(JSON.stringify({ status, location }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (url.pathname === "/control") {
      if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });

      const cmd = url.searchParams.get("cmd");
      const key = url.searchParams.get("key"); // This is the MACROS KEY
      const cmd2 = url.searchParams.get("cmd2");

      // WE NO LONGER CHECK FOR "ABC" HERE. 
      // We pass the key directly to MacroDroid as requested.
      
      const macroId = env.MACRO_ID || "PASTE_YOUR_ID_FOR_LOCAL_TESTING";
      let target = `https://trigger.macrodroid.com/${macroId}/control?cmd=${cmd}&key=${key}`;
      if (cmd2) target += `&cmd2=${encodeURIComponent(cmd2)}`;
      
      // PROXY the request so the browser doesn't deal with CORS
      return await fetch(target);
    }

    // Default: Serve Assets
    return env.ASSETS.fetch(request);
  }
};
