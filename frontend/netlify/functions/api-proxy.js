/**
 * Universal API proxy — handles ALL HTTP methods (GET, POST, PATCH, PUT, DELETE).
 *
 * The Netlify CDN redirect (/api/* → backend) forwards the browser's Origin header.
 * The backend CORS filter + token checker rejects these requests.
 * This function calls the backend server-to-server (no Origin header) so the CORS
 * filter never runs, and the Authorization token is forwarded correctly.
 *
 * Uses the native fetch API (Node.js 18+, available in all Netlify functions).
 *
 * Called by apiFetchRaw() in api.ts for every request whose path starts with /api/.
 * The actual target path is passed as the `_path` query parameter,
 * the original query string as `_qs`, and the HTTP method as `_method`.
 *
 * Example:
 *   POST /.netlify/functions/api-proxy?_path=/api/v1/users&_method=GET
 *   POST /.netlify/functions/api-proxy?_path=/api/v1/users/abc&_method=PATCH
 *   Body: { "firstName": "...", ... }
 */
exports.handler = async function (event) {
  const params       = event.queryStringParameters || {};
  const targetPath   = params._path  || "";
  const targetQuery  = params._qs    || "";
  const method       = (params._method || event.httpMethod || "GET").toUpperCase();

  if (!targetPath) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing _path parameter" }),
    };
  }

  const backendUrl =
    "https://api.rccgros.org" +
    targetPath +
    (targetQuery ? `?${targetQuery}` : "");

  // Netlify base64-encodes bodies in some edge cases — decode back to UTF-8.
  let rawBody = event.body || null;
  if (event.isBase64Encoded && rawBody) {
    rawBody = Buffer.from(rawBody, "base64").toString("utf8");
  }

  // Build forward headers — deliberately omit Origin so the backend CORS
  // filter does not run. Only add Content-Type when there is an actual body.
  const forwardHeaders = {};
  if (rawBody) {
    forwardHeaders["Content-Type"] = "application/json";
  }
  const auth = event.headers?.authorization || event.headers?.Authorization;
  if (auth) forwardHeaders["Authorization"] = auth;

  try {
    const fetchOptions = {
      method,
      headers: forwardHeaders,
    };
    // GET and HEAD requests must not have a body (fetch throws if you add one)
    if (rawBody && method !== "GET" && method !== "HEAD") {
      fetchOptions.body = rawBody;
    }

    const response = await fetch(backendUrl, fetchOptions);
    const text     = await response.text();

    return {
      statusCode: response.status,
      headers:    { "Content-Type": "application/json" },
      body:       text || "{}",
    };
  } catch (err) {
    console.error("[api-proxy] fetch error →", backendUrl, ":", err.message);
    return {
      statusCode: 503,
      headers:    { "Content-Type": "application/json" },
      body:       JSON.stringify({
        message: "Service temporarily unavailable. Please try again.",
      }),
    };
  }
};
