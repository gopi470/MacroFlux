export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. RECEIVE DATA FROM PHONE
    // MacroDroid sends: https://ui.muffinjuice.xyz/?link={v=gmaps_link}
    if (url.searchParams.has("link")) {
      const link = url.searchParams.get("link");
      // Store in KV with a short expiration
      if (env.LOCATION_KV) {
        await env.LOCATION_KV.put("latest_location", link, { expirationTtl: 3600 });
        return new Response("OK", { status: 200 });
      }
      return new Response("KV_NOT_CONFIGURED", { status: 500 });
    }

    // 2. UI POLLING ENDPOINT
    if (url.pathname === "/poll") {
      const link = env.LOCATION_KV ? await env.LOCATION_KV.get("latest_location") : null;
      return new Response(JSON.stringify({ link }), {
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        }
      });
    }

    // 3. CONTROL REDIRECT (Optional logic for /control if needed)
    if (url.pathname === "/control") {
      const cmd = url.searchParams.get("cmd");
      const key = url.searchParams.get("key");
      
      // Simple security check as requested
      if (key !== "ABC") {
        return new Response("UNAUTHORIZED", { status: 401 });
      }

      // Redirect to your MacroDroid trigger URL
      // (Replace <your-id> with your actual MacroDroid ID)
      const target = `https://trigger.macrodroid.com/YOUR_MACRODROID_ID/control?cmd=${cmd}&key=${key}`;
      return Response.redirect(target, 302);
    }

    // 4. SERVE STATIC ASSETS
    return env.ASSETS.fetch(request);
  }
};
