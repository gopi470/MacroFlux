export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const params = url.searchParams;

  const locationData = {
    lat: params.get("lat"),
    lon: params.get("lon"),
    link: params.get("link"),
    timestamp: Date.now()
  };

  if (locationData.link || (locationData.lat && locationData.lon)) {
    // Store in KV for 5 minutes (300 seconds)
    await env.LOCATION_KV.put("latest_location", JSON.stringify(locationData), {
      expirationTtl: 300 
    });
  }

  return new Response("OK", { status: 200 });
}
