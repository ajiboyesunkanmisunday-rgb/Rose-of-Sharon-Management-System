/**
 * Image proxy — fetches any image URL server-to-server and returns it as a
 * base64-encoded response so the browser never has to make a cross-origin request.
 *
 * Usage:  /.netlify/functions/img-proxy?url=<encoded-image-url>
 *
 * The caller (fetchBase64 / fetchBuffer in celebrations/page.tsx) passes the
 * raw profile-picture URL.  Because this function runs on Netlify's servers
 * there are no CORS restrictions — it can reach S3, the RCCG backend, etc.
 */
exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const url = decodeURIComponent(params.url || "");

  if (!url) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing url parameter" }),
    };
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ROSMS-ImageProxy/1.0)" },
    });

    if (!response.ok) {
      console.error(`[img-proxy] ${url} → ${response.status}`);
      return { statusCode: response.status, body: "Failed to fetch image" };
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error("[img-proxy] error:", err.message, "url:", url);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Image proxy error" }),
    };
  }
};
