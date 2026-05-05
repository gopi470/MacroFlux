export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle incoming location from MacroDroid
    if (url.pathname === "/location") {
      const params = url.searchParams;
      const locationData = {
        lat: params.get("lat"),
        lon: params.get("lon"),
        link: params.get("link"),
        timestamp: Date.now()
      };

      if (locationData.link || (locationData.lat && locationData.lon)) {
        await env.LOCATION_KV.put("latest_location", JSON.stringify(locationData), {
          expirationTtl: 300 // Store for 5 mins
        });
      }
      return new Response("OK", { status: 200 });
    }

    // 2. Handle UI polling for location
    if (url.pathname === "/get-location") {
      const data = await env.LOCATION_KV.get("latest_location");
      if (!data) {
        return new Response(JSON.stringify({ error: "No location found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(data, {
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Fallback to static assets (index.html, script.js, etc.)
    return env.ASSETS.fetch(request);
  }
};
