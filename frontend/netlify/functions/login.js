/**
 * Serverless proxy for POST /api/v1/users/login
 *
 * The backend returns the JWT in the Authorization response header
 * (Access-Control-Expose-Headers: Authorization). This function proxies
 * the request server-to-server so it can read that header and inject the
 * token into the JSON response body — bypassing browser CORS restrictions.
 *
 * The Origin we send to the backend is taken from the incoming request's
 * own Origin header. This means every Netlify deployment (production,
 * preview, branch deploy) correctly presents its own domain to the backend
 * instead of the hardcoded URL that only worked for one specific site.
 *
 * If the backend CORS policy needs updating for a new domain, add that
 * domain to the backend's allowed-origins list — not to this file.
 */
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const postData = event.body || "{}";

  // Forward the real Origin from the browser so the backend enters CORS
  // mode and exposes the Authorization header. Falls back to the
  // api.rccgros.org domain itself (same-origin, always allowed).
  const incomingOrigin =
    event.headers?.origin ||
    event.headers?.Origin ||
    "https://api.rccgros.org";

  try {
    const response = await fetch("https://api.rccgros.org/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": incomingOrigin,
        "Accept": "application/json",
      },
      body: postData,
    });

    const raw = await response.text();
    let body = {};
    try {
      body = JSON.parse(raw);
    } catch {
      body = { message: raw };
    }

    const isJwt = (v) => typeof v === "string" && v.split(".").length === 3 && v.startsWith("eyJ");

    // 1. Deep-scan body first — prefer an explicit JWT in the response payload
    if (!body.token || !isJwt(body.token)) {
      const extractJwt = (obj) => {
        for (const val of Object.values(obj)) {
          if (isJwt(val)) return val;
          if (val && typeof val === "object" && !Array.isArray(val)) {
            const found = extractJwt(val);
            if (found) return found;
          }
        }
        return null;
      };
      const jwt = extractJwt(body);
      if (jwt) body.token = jwt;
    }

    // 2. Scan response headers for a JWT (eyJ...) — skip raw session keys
    if (!body.token || !isJwt(body.token)) {
      for (const [, val] of response.headers.entries()) {
        const v = String(val || "");
        const candidate = v.toLowerCase().startsWith("bearer ")
          ? v.replace(/^Bearer\s+/i, "").trim()
          : v.trim();
        if (isJwt(candidate)) {
          body.token = candidate;
          break;
        }
      }
    }

    // 3. Last resort: Authorization header value even if not a JWT
    if (!body.token) {
      const authHeader = response.headers.get("authorization") || "";
      if (authHeader) {
        body.token = authHeader.replace(/^Bearer\s+/i, "").trim();
      }
    }

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    };
  } catch {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Service temporarily unavailable. Please try again." }),
    };
  }
};
