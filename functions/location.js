export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const params = url.searchParams;

  // Extract location data
  const lat = params.get("lat");
  const lon = params.get("lon");
  const link = params.get("link");
  const key = params.get("key");

  // Redirect to the home page with the data as query params
  // This allows the static frontend to parse and display it
  const redirectUrl = new URL("/", url.origin);
  if (lat) redirectUrl.searchParams.set("lat", lat);
  if (lon) redirectUrl.searchParams.set("lon", lon);
  if (link) redirectUrl.searchParams.set("link", link);
  if (key) redirectUrl.searchParams.set("key", key);

  return Response.redirect(redirectUrl.toString(), 302);
}
