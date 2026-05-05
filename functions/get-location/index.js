export async function onRequestGet({ env }) {
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
