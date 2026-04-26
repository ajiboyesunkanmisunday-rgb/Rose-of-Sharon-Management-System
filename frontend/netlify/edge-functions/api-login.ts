/**
 * Netlify Edge Function — Login proxy
 *
 * The Spring Boot backend returns the JWT in the `Authorization` response
 * header (not the body). Netlify's standard redirect proxy strips that header
 * before it reaches the browser. This edge function intercepts only the login
 * endpoint, extracts the token from the header, and injects it as `token` in
 * the JSON response body so the frontend can store it in localStorage.
 */

export default async function handler(request: Request) {
  // Forward the request to the real backend
  const backendUrl = "http://137.184.72.16:6001/api/v1/users/login";
  const body = await request.text();

  const backendResponse = await fetch(backendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  // Parse the response body
  const responseText = await backendResponse.text();
  let responseData: Record<string, unknown> = {};
  try {
    responseData = JSON.parse(responseText);
  } catch {
    responseData = { raw: responseText };
  }

  // Inject token from Authorization response header if not already in body
  const authHeader =
    backendResponse.headers.get("Authorization") ||
    backendResponse.headers.get("authorization");

  if (authHeader && !responseData.token) {
    responseData.token = authHeader.replace(/^Bearer\s+/i, "").trim();
  }

  // Also scan all string fields for a JWT-like value (starts with "eyJ")
  if (!responseData.token) {
    for (const value of Object.values(responseData)) {
      if (
        typeof value === "string" &&
        value.startsWith("eyJ") &&
        value.includes(".")
      ) {
        responseData.token = value;
        break;
      }
    }
  }

  return new Response(JSON.stringify(responseData), {
    status: backendResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = { path: "/api/v1/users/login" };
