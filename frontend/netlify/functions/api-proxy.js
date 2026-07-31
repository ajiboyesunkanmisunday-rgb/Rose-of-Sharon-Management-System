/**
 * Netlify serverless proxy for all /api/* requests.
 *
 * Why this exists:
 * The backend's nginx CORS config blocks PATCH/PUT/DELETE (and the
 * OPTIONS preflight for them) from the Netlify origin. Routing through
 * a [[redirects]] rule doesn't help because Netlify forwards the browser's
 * Origin header verbatim, which nginx rejects.
 *
 * A serverless function makes the request server-to-server (no Origin
 * header), so nginx treats it as a same-server call and allows all methods.
 *
 * The function also correctly handles login: the backend returns the JWT
 * in the Authorization response header, and since this is now a same-origin
 * request the browser can read any response header without CORS restrictions.
 */

const BACKEND = "https://api.rccgros.org";

const STRIP_REQUEST = new Set([
  "origin",
  "referer",
  "host",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "priority",
  "cdn-loop",
  "x-forwarded-host",
]);

const STRIP_RESPONSE = new Set([
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

exports.handler = async function (event) {
  const query = event.rawQuery ? `?${event.rawQuery}` : "";
  const url = `${BACKEND}${event.path}${query}`;

  const reqHeaders = {};
  for (const [k, v] of Object.entries(event.headers || {})) {
    if (!STRIP_REQUEST.has(k.toLowerCase())) {
      reqHeaders[k] = v;
    }
  }

  const fetchOptions = {
    method: event.httpMethod,
    headers: reqHeaders,
  };

  if (
    event.body &&
    event.httpMethod !== "GET" &&
    event.httpMethod !== "HEAD"
  ) {
    fetchOptions.body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;
  }

  try {
    const resp = await fetch(url, fetchOptions);

    const respHeaders = {};
    for (const [k, v] of resp.headers.entries()) {
      if (!STRIP_RESPONSE.has(k.toLowerCase())) {
        respHeaders[k] = v;
      }
    }

    const body = await resp.text();

    return {
      statusCode: resp.status,
      headers: respHeaders,
      body,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Proxy error",
        message: String(err.message),
      }),
    };
  }
};
