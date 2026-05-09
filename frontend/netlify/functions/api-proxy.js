const https = require("https");

/**
 * Universal API proxy — handles ALL HTTP methods (GET, POST, PATCH, PUT, DELETE).
 *
 * The Netlify CDN redirect (/api/* → backend) forwards the browser's Origin header.
 * The backend CORS filter + token checker now rejects these requests.
 * This function calls the backend server-to-server (no Origin header) so the CORS
 * filter never runs, and the Authorization token is forwarded correctly.
 *
 * Called by apiFetchRaw() in api.ts for every request whose path starts with /api/.
 * The actual target path is passed as the `_path` query parameter, and any
 * original query string as `_qs`. The actual HTTP method is passed as `_method`.
 *
 * Example:
 *   POST /.netlify/functions/api-proxy?_path=/api/v1/users&_method=GET
 *   POST /.netlify/functions/api-proxy?_path=/api/v1/users/abc&_method=PATCH
 *   Body: { "firstName": "...", ... }
 */
exports.handler = async function (event) {
  const params = event.queryStringParameters || {};
  const targetPath = params._path || "";
  const targetQuery = params._qs  || "";
  const method      = params._method || event.httpMethod;

  if (!targetPath) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing _path parameter" }),
    };
  }

  const backendPath = targetPath + (targetQuery ? `?${targetQuery}` : "");

  // Netlify base64-encodes bodies when the content is binary or the platform
  // determines it necessary. Decode before forwarding so the backend receives
  // the original UTF-8 JSON instead of a base64 string.
  let rawBody = event.body || "";
  if (event.isBase64Encoded && rawBody) {
    rawBody = Buffer.from(rawBody, "base64").toString("utf8");
  }

  // Only forward Authorization (and Content-Type for requests with a body).
  // Deliberately omit Origin so the backend CORS filter does not run and
  // block the request.
  const forwardHeaders = {};

  if (rawBody) {
    forwardHeaders["Content-Type"] = "application/json";
    forwardHeaders["Content-Length"] = Buffer.byteLength(rawBody);
  }

  const auth =
    event.headers?.authorization ||
    event.headers?.Authorization;
  if (auth) forwardHeaders["Authorization"] = auth;

  return new Promise((resolve) => {
    const options = {
      hostname: "api.rccgros.org",
      port: 443,
      path: backendPath,
      method,
      headers: forwardHeaders,
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: { "Content-Type": "application/json" },
          body: raw || "{}",
        });
      });
    });

    req.on("error", () => {
      resolve({
        statusCode: 503,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Service temporarily unavailable. Please try again." }),
      });
    });

    if (rawBody) req.write(rawBody);
    req.end();
  });
};
