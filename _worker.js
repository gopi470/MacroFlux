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
      if (!isLoggedIn) return Response.redirect(url.origin + "/", 302);
      
      // Fetch home.html from assets
      const home = await env.ASSETS.fetch(new Request(url.origin + "/home.html"));
      return home;
    }

    // 4. API Endpoints
    if (url.pathname === "/report") {
      const link = url.searchParams.get("link");
      const key = url.searchParams.get("key");
      
      if (key !== "ABC") return new Response("UNAUTHORIZED", { status: 401 });

      if (link && env.LOCATION_KV) {
        await env.LOCATION_KV.put("latest_location", link, { expirationTtl: 3600 });
        await env.LOCATION_KV.put("latest_location_time", Date.now().toString(), { expirationTtl: 3600 });
        return new Response("OK_STORED", { status: 200 });
      }
      return new Response("MISSING_DATA", { status: 400 });
    }

    if (url.pathname === "/poll") {
      if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });

      const kvExists = !!env.LOCATION_KV;
      const link = kvExists ? await env.LOCATION_KV.get("latest_location") : null;
      const time = kvExists ? await env.LOCATION_KV.get("latest_location_time") : null;
      
      return new Response(JSON.stringify({ 
        link, 
        time: time ? parseInt(time) : 0,
        debug: kvExists ? "KV_CONNECTED" : "KV_MISSING_CHECK_DASHBOARD_BINDINGS" 
      }), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      });
    }

    if (url.pathname === "/control") {
      if (!isLoggedIn) return new Response("UNAUTHORIZED", { status: 401 });

      const cmd = url.searchParams.get("cmd");
      const key = url.searchParams.get("key"); // This is the MACROS KEY
      const cmd2 = url.searchParams.get("cmd2");

      // WE NO LONGER CHECK FOR "ABC" HERE. 
      // We pass the key directly to MacroDroid as requested.
      
      let target = `https://trigger.macrodroid.com/f1511af3-cec6-4889-9838-1cc4648ebed3/control?cmd=${cmd}&key=${key}`;
      if (cmd2) target += `&cmd2=${encodeURIComponent(cmd2)}`;
      
      return Response.redirect(target, 302);
    }

    // Default: Serve Assets
    return env.ASSETS.fetch(request);
  }
};
