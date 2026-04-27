const http = require("http");

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

  return new Promise((resolve) => {
    const postData = event.body || "{}";

    const options = {
      hostname: "137.184.72.16",
      port: 6001,
      path: "/api/v1/users/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        // Include Origin so the backend enters CORS mode and returns
        // Access-Control-Expose-Headers: Authorization (with the JWT).
        "Origin": "https://aquamarine-chaja-11dedd.netlify.app",
        "Accept": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        let body = {};
        try {
          body = JSON.parse(raw);
        } catch {
          body = { message: raw };
        }

        const allHeaders = res.headers || {};

        // 1. Check Authorization header
        const authHeader = allHeaders["authorization"] || "";
        if (authHeader && !body.token) {
          body.token = authHeader.replace(/^Bearer\s+/i, "").trim();
        }

        // 2. Scan every response header for a Bearer token or raw JWT
        if (!body.token) {
          for (const [, val] of Object.entries(allHeaders)) {
            const v = Array.isArray(val) ? val.join(",") : String(val || "");
            if (v.toLowerCase().startsWith("bearer ")) {
              body.token = v.replace(/^Bearer\s+/i, "").trim();
              break;
            }
            if (v.startsWith("eyJ") && v.includes(".")) {
              body.token = v.trim();
              break;
            }
          }
        }

        // 3. Deep-scan body for any JWT-shaped string
        if (!body.token) {
          const extractJwt = (obj) => {
            for (const val of Object.values(obj)) {
              if (typeof val === "string" && val.startsWith("eyJ") && val.includes(".")) {
                return val;
              }
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

        resolve({
          statusCode: res.statusCode,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
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

    req.write(postData);
    req.end();
  });
};
