/**
 * Login proxy — guarantees the JWT from the Authorization response header
 * is captured regardless of how Netlify's CDN handles response headers.
 *
 * Flow:
 *  1. Browser POSTs to /api/v1/users/login  (same-origin)
 *  2. netlify.toml routes that path here BEFORE the catch-all /api/* redirect
 *  3. This function forwards the request to api.rccgros.org server-to-server
 *  4. Reads the Authorization header from the backend response
 *  5. Injects the raw token as `_token` into the JSON body so loginUser()
 *     in api.ts can extract it via its body-scan logic without relying on
 *     the browser being able to read response headers directly.
 *
 * Origin is read from the incoming request — no hardcoded URLs.
 */
exports.handler = async function (event) {
  const BACKEND_LOGIN = "https://api.rccgros.org/api/v1/users/login";
  const origin = event.headers["origin"] || event.headers["Origin"] || "";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }

  try {
    const backendRes = await fetch(BACKEND_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(origin ? { "Origin": origin } : {}),
      },
      body: event.body || "{}",
    });

    // Read the raw text first so we can parse + mutate before forwarding
    const rawText = await backendRes.text();
    let parsed = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Non-JSON body — just pass it through as-is
      return {
        statusCode: backendRes.status,
        headers: { "Content-Type": "text/plain" },
        body: rawText,
      };
    }

    // Extract JWT from Authorization response header and inject into body
    const authHeader =
      backendRes.headers.get("authorization") ||
      backendRes.headers.get("Authorization") ||
      "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token) {
      parsed._token = token;
    }

    return {
      statusCode: backendRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error("[login-proxy] error:", err.message);
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Login proxy error: " + err.message }),
    };
  }
};
