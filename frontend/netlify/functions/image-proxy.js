/**
 * Proxy external image fetches server-side so the browser's CORS restriction
 * is bypassed. DigitalOcean Spaces (where profile pictures are stored) does
 * not send Access-Control-Allow-Origin headers, so a direct browser fetch()
 * fails even though <img> tags load the same URLs fine (no-cors mode).
 *
 * Usage: GET /.netlify/functions/image-proxy?url=<encoded-image-url>
 */

exports.handler = async function (event) {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return { statusCode: 400, body: "Missing url parameter" };
  }

  // Only allow fetching from known trusted hosts
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { statusCode: 400, body: "Invalid url" };
  }

  const ALLOWED_HOSTS = [
    "eventspace.sfo3.digitaloceanspaces.com",
    "api.rccgros.org",
  ];

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith("." + h))) {
    return { statusCode: 403, body: "Host not allowed" };
  }

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return { statusCode: resp.status, body: `Upstream error: ${resp.status}` };
    }

    const contentType = resp.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await resp.arrayBuffer();
    const body = Buffer.from(buffer).toString("base64");

    return {
      statusCode: 200,
      headers: {
        "content-type": contentType,
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=3600",
      },
      body,
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Proxy error", message: String(err.message) }),
    };
  }
};
