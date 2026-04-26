const http = require("http");

/**
 * Serverless proxy for POST /api/v1/users/login
 *
 * The backend returns the JWT in the Authorization response header.
 * This function proxies the request server-side so it can read that
 * header and inject the token into the JSON response body before
 * it is returned to the browser.
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

        // Inject token from Authorization response header if not in body
        const authHeader = res.headers["authorization"] || "";
        if (authHeader && !body.token) {
          body.token = authHeader.replace(/^Bearer\s+/i, "").trim();
        }

        // Deep-scan every string value for a JWT signature as a fallback
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

    req.on("error", (err) => {
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
