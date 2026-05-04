const https = require("https");

/**
 * General API proxy for PATCH / PUT JSON requests.
 *
 * The Netlify reverse-proxy redirect (/api/* → backend) forwards the browser's
 * Origin header to the backend. The backend CORS filter does not list PATCH in
 * its allowed methods, so every PATCH returns 403 "Invalid CORS request".
 *
 * This function receives the request from the browser, strips the Origin header,
 * and forwards the call directly to the backend server-to-server (no CORS check).
 *
 * Called by apiFetchRaw() in api.ts whenever method is PATCH or PUT.
 * The actual target path is passed as the `_path` query parameter, and any
 * original query string as `_qs`.
 *
 * Example:
 *   PATCH /.netlify/functions/api-proxy?_path=/api/v1/users/member/abc&_method=PATCH
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
  const rawBody = event.body || "";

  // Only forward the Authorization header; deliberately omit Origin so the
  // backend CORS filter does not run and block the request.
  const forwardHeaders = {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(rawBody),
  };

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
