/**
 * Serverless proxy for POST /api/v1/users/login
 *
 * The backend is configured to return the JWT in the Authorization
 * response header (Access-Control-Expose-Headers: Authorization).
 * This function proxies the request server-side so it can read that
 * header and inject the token into the JSON response body.
 */
exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const postData = event.body || "{}";

  try {
    const response = await fetch("https://api.rccgros.org/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Include Origin so the backend enters CORS mode and returns
        // Access-Control-Expose-Headers: Authorization (with the JWT).
        "Origin": "https://aquamarine-chaja-11dedd.netlify.app",
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
