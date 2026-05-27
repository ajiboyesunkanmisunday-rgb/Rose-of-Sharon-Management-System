/**
 * ROSMS API Service
 * Base URL: http://137.184.72.16:6001
 * Sprint 1 endpoints: User Management, Settings, Groups, Events
 */

// Empty string = relative URL, so requests go to /api/...
// Netlify proxies /api/* → http://137.184.72.16:6001/api/* server-side,
// avoiding the browser's mixed-content (HTTPS→HTTP) block.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ─── Token helpers ─────────────────────────────────────────────────────────────

const TOKEN_KEY = "rosms_token";
const USER_KEY = "rosms_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType?: string;
  profilePictureUrl?: string;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * True when the stored token is a JWT we can prove is expired.
 * Returns false when there is no token, or when the token is opaque
 * (non-JWT) — those cases are handled elsewhere (apiFetchRaw / login flow).
 */
export function isSessionExpired(): boolean {
  const token = getToken();
  if (!token) return false;
  return isTokenExpired(token);
}

// ─── Core fetch wrapper ─────────────────────────────────────────────────────────

interface ApiFetchResult<T> {
  data: T;
  headers: Headers;
}

/**
 * Decode a JWT payload. Returns the claims object, or null if the token is
 * not a structurally valid JWT (wrong number of segments or non-base64 data).
 * JWTs use base64url (no padding, `-` and `_` instead of `+` and `/`).
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64url → base64, then add `=` padding so atob() doesn't throw
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Returns true only when we can confirm the token is an expired JWT.
 * Non-JWT session tokens issued by the backend are passed through — the
 * backend decides if they are valid or not.
 */
function isTokenExpired(token: string): boolean {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload) return false; // not a JWT — let the backend decide
  if (typeof payload.exp === "number") {
    return payload.exp * 1000 < Date.now();
  }
  return false;
}

async function apiFetchRaw<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiFetchResult<T>> {
  const token = getToken();
  const method = (options.method ?? "GET").toUpperCase();

  // Only include Content-Type for requests that have a body.
  // GET/HEAD with Content-Type causes browsers to add Content-Length: 0,
  // which confuses Netlify's function body parsing.
  const headers: Record<string, string> = {
    ...(method !== "GET" && method !== "HEAD"
      ? { "Content-Type": "application/json" }
      : {}),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    // If we can confirm the token is expired, clear it and redirect now
    // rather than letting the backend crash with 500.
    if (isTokenExpired(token)) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ALL requests to /api/* are routed through the serverless proxy function.
  // Netlify's CDN redirect rules forward the browser's Origin header to the backend.
  // The backend CORS filter + token checker now rejects these requests.
  // The serverless function calls the backend server-to-server (no Origin header)
  // so the CORS filter never runs, and the Authorization header is forwarded correctly.
  //
  // Requests to /.netlify/functions/* (e.g. login) are NOT proxied — they
  // call the function directly.
  let fetchUrl = `${BASE_URL}${path}`;
  let fetchMethod = method;
  // Backend now accepts the Netlify origin header directly.
  // All /api/* requests route through the [[redirects]] rule in netlify.toml.
  const needsProxy = false;
  if (needsProxy) {
    // Separate the path from any query string the caller already attached
    const [basePath, existingQs] = path.split("?");
    let proxyUrl = `/.netlify/functions/api-proxy?_path=${encodeURIComponent(basePath)}&_method=${method}`;
    if (existingQs) proxyUrl += `&_qs=${encodeURIComponent(existingQs)}`;
    fetchUrl = proxyUrl;
    fetchMethod = "POST"; // transport method to the function; actual method sent via _method param
  }

  const response = await fetch(fetchUrl, {
    ...options,
    method: fetchMethod,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    const status = response.status;
    let errorMessage = ""; // empty = no specific message yet
    let backendMessage = ""; // what the backend actually said

    try {
      const errBody = await response.json();
      // Log the full error body so developers can see the exact backend response.
      console.error(`[api] ${status} on ${path} — full error body:`, errBody);

      // Spring Boot can return validation errors in several formats:
      // 1. { "message": "..." }
      // 2. { "error": "Bad Request", "message": "..." }
      // 3. { "errors": [{ "defaultMessage": "..." }] }  ← Spring @Valid
      // 4. { "fieldErrors": [{ "message": "..." }] }
      const springErrors: string[] = [];
      if (Array.isArray(errBody?.errors)) {
        for (const e of errBody.errors) {
          const msg = e?.defaultMessage ?? e?.message ?? JSON.stringify(e);
          if (msg) springErrors.push(msg);
        }
      }
      if (Array.isArray(errBody?.fieldErrors)) {
        for (const e of errBody.fieldErrors) {
          const msg = e?.message ?? e?.defaultMessage ?? JSON.stringify(e);
          if (msg) springErrors.push(msg);
        }
      }
      if (springErrors.length > 0) {
        backendMessage = springErrors.join("; ");
      } else {
        backendMessage =
          errBody?.message ?? errBody?.error ?? errBody?.detail ?? "";
      }
    } catch {
      // non-JSON error body — ignore
    }

    // Log the extracted message for quick scanning.
    console.error(
      `[api] ${status} on ${path} — backend said:`,
      backendMessage || "(no message)",
    );

    const raw = backendMessage.toLowerCase();

    // Backend sometimes returns session-expiry messages with a non-401 status.
    // Treat any such message as an auth failure: clear the token and send the
    // user to the login page immediately.
    const isSessionExpired =
      (raw.includes("session") &&
        (raw.includes("expired") || raw.includes("login again"))) ||
      raw.includes("please login") ||
      raw.includes("please log in");
    if (isSessionExpired) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    // Always keep a meaningful backend message when the server provides one.
    // Only fall back to generic text when the backend gives us nothing useful,
    // or when the message is just a raw HTTP phrase (e.g. "Bad Request").
    const isGenericPhrase =
      !backendMessage ||
      raw === "bad request" ||
      raw === "not found" ||
      raw === "forbidden" ||
      raw === "internal server error" ||
      raw === "method not allowed" ||
      raw === "bad gateway" ||
      raw === "service unavailable";

    if (!isGenericPhrase) {
      // Backend gave a real message — use it as-is
      errorMessage = backendMessage;
    } else if (status === 405 || raw.includes("method not allowed")) {
      errorMessage =
        "This action is not yet supported by the server. Please contact the backend team.";
    } else if (
      status === 502 ||
      status === 503 ||
      raw.includes("bad gateway") ||
      raw.includes("service unavailable")
    ) {
      errorMessage =
        "Server is temporarily unavailable. Please try again in a moment.";
    } else if (status === 404 || raw.includes("not found")) {
      errorMessage =
        "Record not found. It may have been deleted or the ID is incorrect.";
    } else if (status === 500 || raw.includes("internal server error")) {
      errorMessage = "Server error. Please try again or contact support.";
    } else if (status === 400 || raw.includes("bad request")) {
      errorMessage = "Invalid request. Please check the form and try again.";
    } else if (status === 403 || raw.includes("forbidden")) {
      errorMessage = "You don't have permission to perform this action.";
    } else {
      errorMessage = `Request failed (${status})`;
    }

    throw new Error(errorMessage);
  }

  // Some endpoints return empty body on success; some return malformed JSON
  // even on a successful 2xx. Guard so a bad response body never masks a
  // successful operation.
  const text = await response.text();
  let data: T;
  try {
    data = text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    // Backend returned 2xx but non-parseable body — treat as success
    data = {} as T;
  }

  // Extract token from Authorization header if present and not already in body.
  // The backend often returns the JWT in the header only.
  if (data && typeof data === "object" && !("token" in data)) {
    const authHeader = response.headers.get("authorization");
    if (authHeader) {
      (data as any).token = authHeader.replace(/^Bearer\s+/i, "").trim();
    }
  }

  return { data, headers: response.headers };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { data } = await apiFetchRaw<T>(path, options);
  return data;
}

// ─── API Response Types ─────────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode?: string;
  sex?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  maritalStatus?: string;
  profilePictureUrl?: string;
  occupation?: string;
  userType?: string;
  groups?: GroupResponse[];
  serviceAttended?: string;
  token?: string;
  // Follow-up tracking fields
  noOfCalls?: number;
  noOfVisits?: number;
  assignedFollowUp?: UserResponse;
  // Visitor / first-timer specific fields
  howDidYouHear?: string;
  howWasService?: string;
  favouriteParts?: string;
  isVisiting?: boolean;
  worshippedOnline?: boolean;
  // New convert specific
  believersClass?: string;
  // Service history
  firstTimeService?: EventResponse;
  secondTimeService?: EventResponse;
  // WhatsApp contact
  whatsappNumber?: string;
  // Wedding date
  dayOfWedding?: number;
  monthOfWedding?: number;
  yearOfWedding?: number;
  // Reason for leaving / stopping attendance
  reasonForLeaving?: string;
  // Last service attended
  lastServiceAttendedDate?: string;
  // Spouse / couple info
  spouse?: UserBasicResponse;
  couplePictureUrl?: string;
  // Record timestamps
  createdOn?: string;
}

export interface CustomPageResponse<T> {
  content: T[];
  totalPages: number;
  size: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface OperationalResponse {
  message: string;
  success: boolean;
}

export interface EventFormField {
  id: string;
  label: string;
  type:
    | "TEXTFIELD"
    | "TEXTAREA"
    | "SINGLE_SELECT"
    | "MULTI_SELECT"
    | "RADIO"
    | "FILE"
    | "EMAIL";
  required?: boolean;
  options?: string[];
}

export interface EventResponse {
  id: string;
  title: string;
  preacher?: string;
  topic?: string;
  eventCategory?: string;
  date: string;
  startTime?: number;
  endTime?: number;
  locationType?: string;
  virtualMeetingLink?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  additionalInstructions?: string;
  requiresRegistration?: boolean;
  isCanceled?: boolean;
  eflyer?: string;
  createdOn?: string;
  // Embedded attendee data (returned by detail endpoints)
  firstTimers?: UserResponse[];
  secondTimers?: UserResponse[];
  newConverts?: NewConvertResponse[];
  eventForms?: EventFormField[];
}

// ─── Auth Endpoints ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginUser(body: LoginRequest): Promise<UserResponse> {
  // Use the direct backend login endpoint if BASE_URL is set (development);
  // otherwise use the Netlify function proxy (production).
  const path = BASE_URL ? "/api/v1/users/login" : "/.netlify/functions/login";
  const response = await apiFetch<UserResponse>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (response.token) {
    setToken(response.token);
  } else if (response.id) {
    // Backend returned a valid user but no token field.
    // Store a session marker so the UI remains accessible until the backend
    // consistently returns a token on every login response.
    setToken(`session_${response.id}`);
  }

  setStoredUser({
    id: response.id,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    userType: response.userType,
    profilePictureUrl: response.profilePictureUrl,
  });

  return response;
}

export function logoutUser(): void {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ─── User Management — Members ──────────────────────────────────────────────────

export interface CreateMemberRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  sex?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  maritalStatus?: string;
  occupation?: string;
  profilePictureUrl?: string;
  groupIds?: string[];
  spouseId?: string;
  // Required when maritalStatus === "MARRIED"
  dayOfWedding?: number;
  monthOfWedding?: number;
  yearOfWedding?: number;
}

export async function getMembers(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/member?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createMember(
  body: CreateMemberRequest,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/member", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateMember(
  id: string,
  body: Partial<CreateMemberRequest>,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/member/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * Dedicated call that sends ONLY groupIds to the member update endpoint.
 * Called as a second step after updateMember so the backend processes
 * the group list in isolation (works around backends that only save the
 * first element when groupIds is mixed with other fields).
 */
export async function assignMemberGroups(
  id: string,
  groupIds: string[],
): Promise<void> {
  await apiFetch<UserResponse>(`/api/v1/users/member/${id}`, {
    method: "PUT",
    body: JSON.stringify({ groupIds }),
  });
}

export async function deleteMembersBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/member", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export async function getUser(id: string): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${id}`);
}

// ─── User Management — E-Members ───────────────────────────────────────────────

export interface CreateEMemberRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  state?: string;
  country: string;
  sex?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  maritalStatus?: string;
  occupation?: string;
  profilePictureUrl?: string;
  serviceAttended?: string;
  spouseId?: string;
  couplePictureUrl?: string;
  groupIds?: string[];
  // Required when maritalStatus === "MARRIED"
  dayOfWedding?: number;
  monthOfWedding?: number;
  yearOfWedding?: number;
}

export async function getEMembers(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/e-member?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createEMember(
  body: CreateEMemberRequest,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/e-member", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEMember(
  id: string,
  body: Partial<CreateEMemberRequest>,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/e-member/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteEMembersBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/e-member", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// ─── User Management — First Timers ────────────────────────────────────────────

export interface CreateFirstTimerRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  countryCode: string;
  sex?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  maritalStatus?: string;
  occupation?: string;
  profilePictureUrl?: string;
  // Event/service the person attended (UUID of the event record)
  eventId?: string;
  // Visitor-specific fields
  isVisiting?: boolean;
  mediumOfInvitation?: string; // how they heard about the church
  serviceRating?: number; // 1–5 numeric rating of the service
  favouritePartOfService?: string;
  fromOnline?: boolean; // worshipped online before
  whatsappNumber?: string; // WhatsApp contact number
  howWasService?: string; // service quality feedback ("Excellent", "Good", etc.)
}

export async function getFirstTimers(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/first-timer?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createFirstTimer(
  body: CreateFirstTimerRequest,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/first-timer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateFirstTimer(
  id: string,
  body: Partial<CreateFirstTimerRequest>,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/first-timer/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteFirstTimersBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/first-timer", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// ─── User Management — Second Timers ───────────────────────────────────────────

// Second timers share the same request shape as first timers
export type CreateSecondTimerRequest = CreateFirstTimerRequest;

export async function getSecondTimers(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/second-timer?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createSecondTimer(
  body: CreateSecondTimerRequest,
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/second-timer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateSecondTimer(
  id: string,
  body: Partial<CreateSecondTimerRequest>,
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/second-timer/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteSecondTimersBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/second-timer", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// ─── User Management — New Converts ────────────────────────────────────────────

export interface CreateNewConvertRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  countryCode: string;
  sex?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  // Event/service the person attended (UUID of the event record)
  eventId?: string;
}

// New converts have their own dedicated response type
export interface NewConvertResponse {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  sex?: string;
  believerClassStage?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  phoneNumber: string;
  profilePictureUrl?: string;
  service?: EventResponse;
  serviceAttended?: string;
  createdOn?: string;
}

export async function getNewConverts(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<NewConvertResponse>> {
  return apiFetch<CustomPageResponse<NewConvertResponse>>(
    `/api/v1/new-converts?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getNewConvert(id: string): Promise<NewConvertResponse> {
  try {
    return await apiFetch<NewConvertResponse>(`/api/v1/new-converts/${id}`);
  } catch {
    // Backend /new-converts/:id returns 400 — fall back to list search
    const list = await getNewConverts(0, 500);
    const found = (list.content ?? []).find((nc) => nc.id === id);
    if (!found) throw new Error("New convert not found.");
    return found;
  }
}

export async function createNewConvert(
  body: CreateNewConvertRequest,
): Promise<NewConvertResponse> {
  return apiFetch<NewConvertResponse>("/api/v1/new-converts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteNewConvertsBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/new-converts", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export async function markNewConvertsAsAttended(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/new-converts/mark-as-attended",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
}

// ─── Notes / Activity Log ────────────────────────────────────────────────────────

export interface NoteResponse {
  id: string;
  userId?: string;
  content?: string;
  /** Swagger: "CALL" | "VISIT" | "OTHERS" */
  noteCategory?: string;
  /** Legacy alias kept for backward-compat with older backend versions */
  type?: string;
  createdOn?: string;
  /** createdBy is an object per Swagger (UserBasicResponse) */
  createdBy?: { id?: string; firstName?: string; lastName?: string } | string;
  /** Legacy field kept for backward compat */
  officerName?: string;
}

export async function getNotes(
  userId: string,
  pageNo = 0,
  pageSize = 50,
): Promise<NoteResponse[]> {
  // GET /api/v1/notes?userId={id}&pageNo={n}&pageSize={s}
  const res = await apiFetch<NoteResponse[] | { content?: NoteResponse[] }>(
    `/api/v1/notes?userId=${encodeURIComponent(userId)}&pageNo=${pageNo}&pageSize=${pageSize}`,
  );
  if (Array.isArray(res)) return res;
  return res.content ?? [];
}

// ─── Follow-up Actions ──────────────────────────────────────────────────────────

export async function addNote(
  userId: string,
  note: string,
  category: "CALL" | "VISIT" = "CALL",
): Promise<OperationalResponse> {
  // POST /api/v1/notes (base) returns 500 on the backend — not usable.
  // POST /api/v1/notes/others does not exist.
  // Only CALL and VISIT endpoints are working.
  const endpoint = category === "VISIT" ? "/api/v1/notes/visit" : "/api/v1/notes/call";
  return apiFetch<OperationalResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify({ userId, content: note }),
  });
}

export async function addCallReport(
  userId: string,
  report: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/notes/call`, {
    method: "POST",
    body: JSON.stringify({ userId, content: report }),
  });
}

export async function addVisitReport(
  userId: string,
  report: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/notes/visit`, {
    method: "POST",
    body: JSON.stringify({ userId, content: report }),
  });
}

export async function deleteNote(noteId: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/notes/${noteId}`, {
    method: "DELETE",
  });
}

export async function assignFollowUp(
  userId: string,
  officerId: string,
  note?: string, // kept for call-site compat; Swagger endpoint has no body
): Promise<OperationalResponse> {
  void note; // intentionally unused — PUT /api/v1/users/{id}/assign-followup/{followUpMemberId}
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/assign-followup/${officerId}`,
    { method: "PUT" },
  );
}

export async function convertToSecondTimer(
  userId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/convert-to-second-timer`,
    { method: "PUT" },
  );
}

export async function convertToFullMember(
  userId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/convert-to-full-member`,
    { method: "PUT" },
  );
}

// Alias kept for backward compatibility with pages that imported the old name
export const convertToMember = convertToFullMember;

export async function linkSpouse(
  userId: string,
  spouseId: string,
  couplePictureUrl?: string,
): Promise<UserResponse> {
  const qs = couplePictureUrl ? `?couplePictureUrl=${encodeURIComponent(couplePictureUrl)}` : "";
  return apiFetch<UserResponse>(
    `/api/v1/users/${userId}/link-spouse/${spouseId}${qs}`,
    { method: "PUT" },
  );
}

export async function resetPassword(
  userId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/reset-password`,
  );
}

export async function removeAdmin(
  userId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/remove-admin`, {
    method: "DELETE",
  });
}

export async function markEventAttendance(
  eventId: string,
  userId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/events/${eventId}/attendance/${userId}`,
    { method: "PATCH" },
  );
}

export async function markUserAsInactive(
  userId: string,
  reason: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/mark-as-inactive`,
    {
      method: "PATCH",
      // Send multiple field names to match whatever the backend expects
      body: JSON.stringify({ text: reason, reason, note: reason }),
    },
  );
}

export interface GuestInformationResponse {
  id: string;
  userId: string;
  isVisiting?: boolean;
  mediumOfInvitation?: string;
  serviceRating?: number;
  favouritePartOfService?: string;
  fromOnline?: boolean;
}

export async function getGuestInformation(
  userId: string,
): Promise<GuestInformationResponse> {
  return apiFetch<GuestInformationResponse>(
    `/api/v1/users/${userId}/guest-information`,
  );
}

// Backend endpoint: POST /api/v1/new-converts/mark-as-attended?believerClassStage=CLASS_1
// { ids: string[] } — works for one or many converts at once.
export async function updateBelieversClass(
  userId: string,
  believersClass: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/new-converts/mark-as-attended?believerClassStage=${encodeURIComponent(believersClass)}`,
    {
      method: "POST",
      body: JSON.stringify({ ids: [userId] }),
    },
  );
}

export async function updateBelieversClassBulk(
  userIds: string[],
  believersClass: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/new-converts/mark-as-attended?believerClassStage=${encodeURIComponent(believersClass)}`,
    {
      method: "POST",
      body: JSON.stringify({ ids: userIds }),
    },
  );
}

/** Map human-readable class labels ("Class 1") to backend values ("CLASS_1"). */
export function toBelieverClassStage(label: string): string {
  const map: Record<string, string> = {
    "Class 1": "CLASS_1",
    "Class 2": "CLASS_2",
    "Class 3": "CLASS_3",
    "Class 4": "CLASS_4",
    "Class 5": "COMPLETED",
    Completed: "COMPLETED",
    "Not started": "",
    None: "",
  };
  return map[label] ?? label; // if already in backend format, pass through
}

// ─── Settings ───────────────────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(
  body: ChangePasswordRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/change-password", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export interface AssignSuperAdminRequest {
  userId: string;
  password: string;
  confirmPassword: string;
}

export async function assignSuperAdmin(
  body: AssignSuperAdminRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/assign-super-admin", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function reassignAdminRole(
  userId: string,
  roleId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/reassign-admin/${roleId}`,
    { method: "PUT" },
  );
}

// ─── Events ─────────────────────────────────────────────────────────────────────

export interface CreateEventRequest {
  title: string;
  preacher?: string;
  topic?: string;
  category?: string;
  date: string;
  startTime?: number;
  endTime?: number;
  locationType?: string;
  virtualMeetingLink?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  additionalInformation?: string; // backend DTO field name (EventResponse uses additionalInstructions)
  eFlyer?: string;
  requiresRegistration?: boolean;
}

export interface UploadCalendarRequest {
  eventId?: string;
  title?: string;
  preacherTitle?: string;
  preacherEmail: string;
  topic?: string;
  category?: string;
  date: string;
  startTime: number;
  endTime: number;
  locationType?: string;
  virtualMeetingLink?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  additionalInformation?: string;
}

export async function getEvents(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<EventResponse>> {
  return apiFetch<CustomPageResponse<EventResponse>>(
    `/api/v1/events?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

// GET /api/v1/events/calendar?startDay=...&endDay=... (YYYY-MM-DD)
export async function getCalendarEvents(
  startDay: string,
  endDay: string,
): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(
    `/api/v1/events/calendar?startDay=${encodeURIComponent(startDay)}&endDay=${encodeURIComponent(endDay)}`,
  );
}

// GET /api/v1/events/calendar/upcoming?startDay=...&endDay=... (date format YYYY-MM-DD)
export async function getUpcomingEvents(
  startDay: string,
  endDay: string,
): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(
    `/api/v1/events/calendar/upcoming?startDay=${encodeURIComponent(startDay)}&endDay=${encodeURIComponent(endDay)}`,
  );
}

export async function uploadCalendar(
  entries: UploadCalendarRequest[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/events/calendar", {
    method: "POST",
    body: JSON.stringify(entries),
  });
}

export async function getCalendar(
  startDay: string,
  endDay: string,
): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>(
    `/api/v1/events/calendar?startDay=${encodeURIComponent(startDay)}&endDay=${encodeURIComponent(endDay)}`,
  );
}

export async function createEvent(
  body: CreateEventRequest,
): Promise<EventResponse> {
  return apiFetch<EventResponse>("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getEvent(id: string): Promise<EventResponse> {
  return apiFetch<EventResponse>(`/api/v1/events/${id}`);
}

export async function getEventForms(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/api/v1/events/${id}/forms`);
}

// ─── Event Attendees ─────────────────────────────────────────────────────────

const EMPTY_PAGE = <T>(): CustomPageResponse<T> => ({
  content: [],
  totalPages: 0,
  size: 0,
  totalElements: 0,
  hasNext: false,
  hasPrevious: false,
});

// Returns empty page on 404 — these backend sub-resource endpoints may not be
// implemented yet; treat missing routes as "no data" rather than an error.
function is404(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : "";
  return msg.includes("not found") || msg.includes("record not found");
}

export async function getEventFirstTimers(
  eventId: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<UserResponse>> {
  try {
    return await apiFetch<CustomPageResponse<UserResponse>>(
      `/api/v1/events/${eventId}/first-timers?pageNo=${pageNo}&pageSize=${pageSize}`,
    );
  } catch (err) {
    if (is404(err)) return EMPTY_PAGE<UserResponse>();
    throw err;
  }
}

export async function getEventEMembers(
  eventId: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<UserResponse>> {
  try {
    return await apiFetch<CustomPageResponse<UserResponse>>(
      `/api/v1/events/${eventId}/e-members?pageNo=${pageNo}&pageSize=${pageSize}`,
    );
  } catch (err) {
    if (is404(err)) return EMPTY_PAGE<UserResponse>();
    throw err;
  }
}

export async function getEventNewConverts(
  eventId: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<NewConvertResponse>> {
  try {
    return await apiFetch<CustomPageResponse<NewConvertResponse>>(
      `/api/v1/events/${eventId}/new-converts?pageNo=${pageNo}&pageSize=${pageSize}`,
    );
  } catch (err) {
    if (is404(err)) return EMPTY_PAGE<NewConvertResponse>();
    throw err;
  }
}

// Mark E-Member attendance for an event
// NOTE: POST /e-members/{id}/attend returns 404 — use the same PATCH attendance
// endpoint that works for first-timers and new-converts.
export async function markEMemberEventAttendance(
  eventId: string,
  eMemberId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/events/${eventId}/attendance/${eMemberId}`,
    { method: "PATCH" },
  );
}

export async function updateEvent(
  id: string,
  body: Partial<CreateEventRequest>,
): Promise<EventResponse> {
  return apiFetch<EventResponse>(`/api/v1/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function searchEvents(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<EventResponse>> {
  return apiFetch<CustomPageResponse<EventResponse>>(
    `/api/v1/events/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function cancelEvent(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/events/${id}/cancel`, {
    method: "DELETE",
  });
}

// ─── Search helpers ──────────────────────────────────────────────────────────

export async function searchMembers(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/member/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function searchAllMembers(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/users/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function searchEMembers(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/e-member/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  groupHead?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  totalMembers?: number;
  whatsAppLink?: string;
  whatsAppQRCode?: string;
  createdOn?: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  groupHeadId?: string;
  whatsAppLink?: string;
  whatsAppQRCode?: string;
}

export async function getGroups(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<GroupResponse>> {
  return apiFetch<CustomPageResponse<GroupResponse>>(
    `/api/v1/groups?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getAllGroups(): Promise<GroupResponse[]> {
  return apiFetch<GroupResponse[]>("/api/v1/groups/all");
}

export async function getGroup(id: string): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${id}`);
}

export interface GroupMemberResponse {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  profilePictureUrl?: string;
  sex?: "FEMALE" | "MALE" | string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  phoneNumber?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  dayOfWedding?: number;
  monthOfWedding?: number;
  yearOfWedding?: number;
  maritalStatus?: string;
  spouse?: string;
  couplePictureUrl?: string;
  occupation?: string;
  assignedFollowUp?: string;
  noOfCalls?: number;
  noOfVisits?: number;
}

export async function getGroupMembers(
  groupId: string,
  pageNo = 0,
  pageSize = 500,
): Promise<CustomPageResponse<UserBasicResponse>> {
  return apiFetch<CustomPageResponse<UserBasicResponse>>(
    `/api/v1/groups/${groupId}?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createGroup(
  body: CreateGroupRequest,
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>("/api/v1/groups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** UpdateGroupRequest — no groupHeadId (use updateGroupHead separately for that) */
export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  whatsAppLink?: string;
  whatsAppQRCode?: string;
}

export async function updateGroup(
  id: string,
  body: UpdateGroupRequest,
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateGroupHead(
  groupId: string,
  groupHeadId: string,
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${groupId}/${groupHeadId}`, {
    method: "PUT",
  });
}

export async function deleteGroupsBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/groups", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export async function searchGroups(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<GroupResponse>> {
  return apiFetch<CustomPageResponse<GroupResponse>>(
    `/api/v1/groups/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Roles ───────────────────────────────────────────────────────────────────

export interface RoleResponse {
  id: string;
  name: string;
  description?: string;
  createdOn?: string;
}

export async function getRoles(
  pageNo = 0,
  pageSize = 50,
): Promise<CustomPageResponse<RoleResponse>> {
  return apiFetch<CustomPageResponse<RoleResponse>>(
    `/api/v1/roles?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createRole(body: {
  name: string;
  description?: string;
}): Promise<RoleResponse> {
  return apiFetch<RoleResponse>("/api/v1/roles", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * GET /api/v1/roles/{id} does NOT exist in Swagger (only PUT and DELETE).
 * Workaround: fetch all roles and find by ID.
 */
export async function getRole(id: string): Promise<RoleResponse> {
  const page = await apiFetch<CustomPageResponse<RoleResponse>>(
    `/api/v1/roles?pageNo=0&pageSize=200`,
  );
  const found = (page.content ?? []).find((r) => r.id === id);
  if (!found) throw new Error("Role not found.");
  return found;
}

export async function updateRole(
  id: string,
  body: { name: string; description?: string },
): Promise<RoleResponse> {
  return apiFetch<RoleResponse>(`/api/v1/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteRole(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/roles/${id}`, {
    method: "DELETE",
  });
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export interface PermissionResponse {
  id: string;
  name: string;
  description?: string;
}

export async function getPermissions(): Promise<PermissionResponse[]> {
  return apiFetch<PermissionResponse[]>("/api/v1/permissions");
}

/** Get all permissions tied to a specific role. */
export async function getRolePermissions(
  roleId: string,
): Promise<PermissionResponse[]> {
  return apiFetch<PermissionResponse[]>(`/api/v1/roles/${roleId}/permissions`);
}

/**
 * Assign a list of permissions to a role.
 * @param roleId - The role UUID
 * @param permissionIds - Array of permission UUIDs to assign
 */
export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[],
): Promise<RoleResponse> {
  return apiFetch<RoleResponse>(`/api/v1/roles/${roleId}/assign-permission`, {
    method: "PUT",
    body: JSON.stringify({ ids: permissionIds }),
  });
}

/**
 * Remove a list of permissions from a role.
 * @param roleId - The role UUID
 * @param permissionIds - Array of permission UUIDs to remove
 */
export async function removePermissionsFromRole(
  roleId: string,
  permissionIds: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/roles/${roleId}/remove-permission`,
    {
      method: "DELETE",
      body: JSON.stringify({ ids: permissionIds }),
    },
  );
}

// ─── Search — First Timers & Second Timers ────────────────────────────────────

/**
 * Backend search for first timers.
 * POST /api/v1/users/first-timer/search  (Swagger-verified)
 */
export async function searchFirstTimers(
  query: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/first-timer/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text: query }) },
  );
}

/**
 * Backend search for second timers.
 * POST /api/v1/users/second-timers/search  (Swagger-verified — plural "timers")
 */
export async function searchSecondTimers(
  query: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/second-timers/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text: query }) },
  );
}

// ─── Testimonies ─────────────────────────────────────────────────────────────

export interface TestimonyResponse {
  id: string;
  subject: string;
  content: string;
  owner?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  isFeatured?: boolean;
  featureDate?: string;
  state?: string;
  country?: string;
  testimonyStatus?: string;
  createdOn?: string;
  wantsToBeShot?: boolean;
  isRosTv?: boolean;
}

export async function getTestimonies(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<TestimonyResponse>> {
  return apiFetch<CustomPageResponse<TestimonyResponse>>(
    `/api/v1/testimonies?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getFeaturedTestimonies(): Promise<TestimonyResponse[]> {
  return apiFetch<TestimonyResponse[]>("/api/v1/testimonies/featured");
}

export async function createTestimony(body: {
  subject: string;
  content: string;
  userId: string;
  state?: string;
  country?: string;
}): Promise<TestimonyResponse> {
  return apiFetch<TestimonyResponse>("/api/v1/testimonies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markTestimonyAsFeatured(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/testimonies/mark-as-featured", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function markTestimonyAsNotFeatured(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/testimonies/mark-as-not-featured",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
}

export async function markTestimonyAsRead(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/testimonies/mark-as-read", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ─── Requests (Counseling / Prayer / Suggestion) ─────────────────────────────

export interface RequestResponse {
  id: string;
  subject: string;
  content: string;
  assignedTo?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  owner?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  requestType?: string;
  requestStatus?: string;
  createdBy?: { id: string; firstName?: string; lastName?: string };
  createdOn?: string;
}

export interface CreateRequestBody {
  userId: string;
  assignedTo?: string;
  subject: string;
  content: string;
}

export async function getAllRequests(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getCounselingRequests(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/counseling?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getPrayerRequests(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/prayer?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getSuggestions(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/suggestion?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createCounselingRequest(
  body: CreateRequestBody,
): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/counseling", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createPrayerRequest(
  body: CreateRequestBody,
): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/prayer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createSuggestion(
  body: CreateRequestBody,
): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/suggestion", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function changeRequestStatus(
  id: string,
  status: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/requests/${id}/change-status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" },
  );
}

// ─── Workflow Board ────────────────────────────────────────────────────────────

export interface BoardColumn {
  status: string;
  totalCount: number;
  requests: RequestResponse[];
}

export interface BoardResponse {
  columns: BoardColumn[];
}

export async function getPrayerWorkflow(): Promise<BoardResponse> {
  return apiFetch<BoardResponse>("/api/v1/requests/prayer/workflow");
}

export async function getCounselingWorkflow(): Promise<BoardResponse> {
  return apiFetch<BoardResponse>("/api/v1/requests/counseling/workflow");
}

// Guest workflow uses /api/v1/users/guest/workflow and returns users (not requests)
export interface UserBasicResponse {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
  countryCode?: string;
  sex?: string;
  occupation?: string;
  assignedFollowUp?: string;
  noOfCalls?: number;
  noOfVisits?: number;
}

export interface GuestBoardColumn {
  status: string;
  totalCount: number;
  users: UserBasicResponse[];
}

export interface GuestBoardResponse {
  columns: GuestBoardColumn[];
}

export async function getGuestWorkflow(): Promise<GuestBoardResponse> {
  return apiFetch<GuestBoardResponse>("/api/v1/users/guest/workflow");
}

export async function getRequest(id: string): Promise<RequestResponse> {
  // Backend has no GET /api/v1/requests/{id} endpoint.
  // Fetch the full list and find by ID across all request types.
  const [allReqs, prayerReqs, counselingReqs, suggestionReqs] =
    await Promise.allSettled([
      getAllRequests(0, 200),
      getPrayerRequests(0, 200),
      getCounselingRequests(0, 200),
      getSuggestions(0, 200),
    ]);

  const lists = [allReqs, prayerReqs, counselingReqs, suggestionReqs]
    .filter(
      (r): r is PromiseFulfilledResult<CustomPageResponse<RequestResponse>> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value.content ?? []);

  const found = lists.find((r) => r.id === id);
  if (!found) throw new Error("Request not found.");
  return found;
}

export async function getUserRequests(
  userId: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/${userId}/user?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

// ─── Celebrations ─────────────────────────────────────────────────────────────

export interface CelebrationResponse {
  id: string;
  requester?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  celebrationType?: string;
  celebrationStatus?: string;
  date?: string;
  notes?: string;
  createdOn?: string;
}

export async function getCelebrations(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<CelebrationResponse>> {
  return apiFetch<CustomPageResponse<CelebrationResponse>>(
    `/api/v1/celebrations?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function createCelebration(body: {
  userId: string;
  type: string;
  date: string;
  notes?: string;
}): Promise<CelebrationResponse> {
  return apiFetch<CelebrationResponse>("/api/v1/celebrations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markCelebrationsAsTreated(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/celebrations/mark-as-treated", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

/**
 * GET /api/v1/celebrations/{id} does NOT exist in Swagger.
 * Workaround: fetch paginated list and find by ID.
 */
export async function getCelebration(id: string): Promise<CelebrationResponse> {
  const page = await apiFetch<CustomPageResponse<CelebrationResponse>>(
    `/api/v1/celebrations?pageNo=0&pageSize=500`,
  );
  const found = (page.content ?? []).find((c) => c.id === id);
  if (!found) throw new Error("Celebration not found.");
  return found;
}

/**
 * PUT /api/v1/celebrations/{id}
 * UpdateCelebrationRequest only accepts { date, notes } — no "type" field.
 */
export async function updateCelebration(
  id: string,
  body: { date?: string; notes?: string },
): Promise<CelebrationResponse> {
  return apiFetch<CelebrationResponse>(`/api/v1/celebrations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── Birthdays & Weddings ─────────────────────────────────────────────────────

export async function getBirthdays(
  startDay: number,
  startMonth: number,
  endDay: number,
  endMonth: number,
  pageNo = 0,
  pageSize = 50,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/birthdays?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "POST",
      body: JSON.stringify({ startDay, startMonth, endDay, endMonth }),
    },
  );
}

export async function getWeddingAnniversaries(
  startDay: number,
  startMonth: number,
  endDay: number,
  endMonth: number,
  pageNo = 0,
  pageSize = 50,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/weddings?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "POST",
      body: JSON.stringify({ startDay, startMonth, endDay, endMonth }),
    },
  );
}

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaResponse {
  id: string;
  name?: string;
  displayName?: string;
  type?: string; // media type enum: SERMON, PODCAST, VIDEOS, IMAGES, THUMBNAIL
  size?: number;
  displayUrl?: string; // URL to access the uploaded media
  url?: string; // alias — some callers use .url
  title?: string;
  duration?: number;
  speaker?: string;
  date?: string;
  description?: string;
  thumbnailUrl?: string;
  youtubeLink?: string;
  mediaCategory?: string;
  tags?: string[];
  createdOn?: string;
  // legacy aliases (kept for compatibility)
  category?: string;
  fileType?: string;
  fileSize?: number;
}

export async function getMedia(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<MediaResponse>> {
  return apiFetch<CustomPageResponse<MediaResponse>>(
    `/api/v1/media?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

/**
 * Fetch media items filtered by a specific category.
 * Uses the dedicated /api/v1/media/category endpoint which only returns items
 * of the requested category — cleanly excludes PROFILE_PICTURE and other
 * unrelated types without relying on client-side filtering.
 */
export async function getMediaByCategory(
  category: string,
  pageNo = 0,
  pageSize = 12,
): Promise<CustomPageResponse<MediaResponse>> {
  return apiFetch<CustomPageResponse<MediaResponse>>(
    `/api/v1/media/category?category=${encodeURIComponent(category)}&pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getMediaItem(id: string): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/v1/media/${id}`);
}

export async function deleteMediaBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/media", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

/**
 * Upload a media item.
 *
 * Per OpenAPI spec, UploadMediaRequest metadata (title, description, type,
 * category, size, etc.) is passed as URL query parameters.  Only the binary
 * file part ("multipartFile") goes in the multipart form body.  This avoids
 * 400 errors caused by field-binding mismatches in the Spring Boot controller.
 */
export async function uploadMedia(fields: {
  title: string;
  description?: string;
  category: string;
  file: File;
  speaker?: string;
  date?: string;       // ISO date string e.g. "2024-11-03"
  tags?: string[];
  youtubeLink?: string; // optional external link stored in description
}): Promise<MediaResponse> {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  // Build description: prepend YouTube link when provided
  let description = fields.description ?? "";
  if (fields.youtubeLink) {
    const linkPrefix = `[External Link]: ${fields.youtubeLink}`;
    description = description
      ? `${linkPrefix}\n\n${description}`
      : linkPrefix;
  }

  // Metadata goes in query-string parameters (matches OpenAPI spec)
  const params = new URLSearchParams({
    title: fields.title,
    type: fields.category,
    category: fields.category,
    size: String(fields.file.size),
    isFromMedia: "true",
  });
  if (description) params.set("description", description);
  if (fields.speaker) params.set("speaker", fields.speaker);
  if (fields.date)    params.set("date", fields.date);
  if (fields.tags && fields.tags.length > 0) params.set("tags", fields.tags.join(","));

  // Only the binary file goes in the FormData body
  const form = new FormData();
  form.append("multipartFile", fields.file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`/api/v1/media?${params.toString()}`, {
      method: "POST",
      headers,
      body: form,
    });
  } catch {
    throw new Error(
      "Media upload failed — please check your connection and try again.",
    );
  }

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = `Upload failed (${response.status})`;
    try {
      const raw = await response.text();
      if (raw && raw.trim().length > 0) {
        try {
          const errBody = JSON.parse(raw);
          const msg: string = errBody?.message ?? errBody?.error ?? "";
          const msgLow = msg.toLowerCase();
          const isExpired =
            (msgLow.includes("session") &&
              (msgLow.includes("expired") || msgLow.includes("login again"))) ||
            msgLow.includes("please login") ||
            msgLow.includes("please log in");
          if (isExpired) {
            removeToken();
            if (typeof window !== "undefined") window.location.href = "/login";
            throw new Error("Session expired. Please log in again.");
          }
          if (msg) errorMessage = msg;
          else errorMessage = raw;
        } catch (e) {
          if ((e as Error).message === "Session expired. Please log in again.")
            throw e;
          errorMessage = raw;
        }
      } else if (response.status === 400 || response.status === 413) {
        // Empty body on 400/413 is the fingerprint of Spring Boot's multipart
        // size limit being exceeded — the server rejects the body before parsing.
        errorMessage =
          "FILE_TOO_LARGE_FOR_SERVER";
      }
    } catch (e) {
      if ((e as Error).message === "Session expired. Please log in again.")
        throw e;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as MediaResponse) : ({} as MediaResponse);
}

// ─── Message Templates ────────────────────────────────────────────────────────

export type MessageTemplateCategory =
  | "NEW_FIRST_TIMER"
  | "NEW_SECOND_TIMER"
  | "NEW_CONVERT"
  | "WEDDING_ANNIVERSARY"
  | "BIRTHDAY"
  | "PRAYER_REQUEST"
  | "NEW_MEMBER"
  | "NEW_E_MEMBER"
  | "COUNSELING_REQUEST";

export type MessageTemplateChannel = "EMAIL" | "SMS";

export interface MessageTemplateResponse {
  id: string;
  messageTemplateCategory: MessageTemplateCategory;
  channel: MessageTemplateChannel;
  name: string;
  content: string;
  subject?: string;
  createdOn?: string;
}

export interface CreateMessageTemplateRequest {
  category: string;
  channel: string;
  name: string;
  subject?: string;
  content: string;
}

export interface UpdateMessageTemplateRequest {
  category?: string;
  channel?: string;
  name?: string;
  subject?: string;
  content?: string;
}

export async function getMessageTemplates(
  page = 0,
  size = 10,
): Promise<CustomPageResponse<MessageTemplateResponse>> {
  return apiFetch<CustomPageResponse<MessageTemplateResponse>>(
    `/api/v1/message-templates?pageNo=${page}&pageSize=${size}`,
  );
}

export async function getMessageTemplate(
  id: string,
): Promise<MessageTemplateResponse> {
  return apiFetch<MessageTemplateResponse>(`/api/v1/message-templates/${id}`);
}

export async function createMessageTemplate(
  body: CreateMessageTemplateRequest,
): Promise<MessageTemplateResponse> {
  return apiFetch<MessageTemplateResponse>("/api/v1/message-templates", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateMessageTemplate(
  id: string,
  body: UpdateMessageTemplateRequest,
): Promise<MessageTemplateResponse> {
  return apiFetch<MessageTemplateResponse>(`/api/v1/message-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteMessageTemplate(
  id: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/message-templates/${id}`, {
    method: "DELETE",
  });
}

export async function searchMessageTemplates(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<MessageTemplateResponse>> {
  return apiFetch<CustomPageResponse<MessageTemplateResponse>>(
    `/api/v1/message-templates/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export interface AdminResponse {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  sex?: string;
  countryCode?: string;
  phoneNumber?: string;
  userType?: string;
  roleId?: string;
  roleName?: string;
  lastLogin?: string;
}

export interface AssignAdminRequest {
  userId: string;
  password: string;
  confirmPassword: string;
}

export async function assignAdmin(
  roleId: string,
  body: AssignAdminRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/assign-admin/${roleId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getAdminUsers(
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<AdminResponse>> {
  return apiFetch<CustomPageResponse<AdminResponse>>(
    `/api/v1/users/admin?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

// ─── Workers-in-Training ─────────────────────────────────────────────────────

// ─── Sub-document types (shared by WiT and SoD full responses) ────────────────

export interface PastPlaceOfWorship {
  id?: string;
  date?: string;
  name?: string;
  address?: string;
}

export interface PastPositionHeld {
  id?: string;
  worshipPlace?: string;
  positionHeld?: string;
}

export interface Qualification {
  id?: string;
  date?: string;
  institution?: string;
  qualificationReceived?: string;
}

// ─── Workers-in-Training ──────────────────────────────────────────────────────

export interface WorkersInTrainingResponse {
  id: string;
  userId?: string;
  set?: string;
  admissionNo?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  email?: string;
  profilePictureUrl?: string;
  sex?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  phoneNumber?: string;
  otherPhoneNumber?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  spouseName?: string;
  noOfChildren?: number;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhoneNumber?: string;
  nextOfKinFullAddress?: string;
  occupation?: string;
  employer?: string;
  officeFullAddress?: string;
  officePhoneNumber?: string;
  officeEmail?: string;
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismLocation?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismLocation?: string;
  reasonForLeavingPastChurch?: string;
  lifeCenterAttended?: string;
  nonRCCGChristianGroups?: string[];
  yourMinistry?: string;
  giftsManifesting?: string[];
  reasonForApplying?: string;
  consent?: boolean;
  officialRemarks?: string;
  graduationDate?: string;
  createdOn?: string;
}

/** Full single-record response — includes sub-document arrays */
export interface WorkersInTrainingFullResponse extends WorkersInTrainingResponse {
  baptismCertificateUrl?: string;
  pastPlaceOfWorships?: PastPlaceOfWorship[];
  pastPositionHeldList?: PastPositionHeld[];
  qualifications?: Qualification[];
}

export interface CreateWorkersInTrainingRequest {
  userId?: string;
  set?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  maidenName?: string;
  countryCode: string;
  phoneNumber: string;
  email?: string;
  profilePictureUrl?: string;
  sex?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  otherPhoneNumber?: string;
  dateOfBirth?: string;
  noOfChildren?: number;
  spouseName?: string;
  maritalStatus?: string;
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhoneNumber?: string;
  nextOfKinFullAddress?: string;
  employer?: string;
  officeFullAddress?: string;
  officePhoneNumber?: string;
  officeEmail?: string;
  occupation?: string;
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismLocation?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismLocation?: string;
  reasonForLeavingPastChurch?: string;
  lifeCenterAttended?: string;
  nonRCCGChristianGroups?: string[];
  yourMinistry?: string;
  giftsManifesting?: string[];
  reasonForApplying?: string;
  consent?: boolean;
  baptismCertificateUrl?: string;
  createPastPlaceOfWorshipRequests?: {
    date?: string;
    name?: string;
    address?: string;
  }[];
  createPositionHeldRequests?: {
    worshipPlace?: string;
    positionHeld?: string;
  }[];
  qualificationRequests?: {
    date?: string;
    institution?: string;
    qualificationReceived?: string;
  }[];
}

export async function getWorkersInTraining(
  pageNo = 0,
  pageSize = 20,
  set?: string,
): Promise<CustomPageResponse<WorkersInTrainingResponse>> {
  // Backend requires set as the first query param: ?set={set}&pageNo=0&pageSize=10
  const base = set
    ? `/api/v1/workers-in-training?set=${encodeURIComponent(set)}&pageNo=${pageNo}&pageSize=${pageSize}`
    : `/api/v1/workers-in-training?pageNo=${pageNo}&pageSize=${pageSize}`;
  return apiFetch<CustomPageResponse<WorkersInTrainingResponse>>(base);
}

export async function getWorkerInTraining(
  id: string,
): Promise<WorkersInTrainingFullResponse> {
  return apiFetch<WorkersInTrainingFullResponse>(
    `/api/v1/workers-in-training/${id}`,
  );
}

export async function searchWorkersInTraining(
  text: string,
  pageNo = 0,
  pageSize = 20,
  set?: string,
): Promise<CustomPageResponse<WorkersInTrainingResponse>> {
  const base = set
    ? `/api/v1/workers-in-training/search?set=${encodeURIComponent(set)}&pageNo=${pageNo}&pageSize=${pageSize}`
    : `/api/v1/workers-in-training/search?pageNo=${pageNo}&pageSize=${pageSize}`;
  return apiFetch<CustomPageResponse<WorkersInTrainingResponse>>(
    base,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function createWorkerInTraining(
  body: CreateWorkersInTrainingRequest,
): Promise<WorkersInTrainingResponse> {
  return apiFetch<WorkersInTrainingResponse>("/api/v1/workers-in-training", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markWorkersAsGraduated(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/workers-in-training/mark-as-graduated",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
}

export async function giveOfficialRemark(
  id: string,
  text: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/workers-in-training/${id}/give-official-remark`,
    { method: "PATCH", body: JSON.stringify({ text }) },
  );
}

export async function deleteWorkersInTrainingBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/workers-in-training", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// ─── Audit Logs ────────────────────────────────────────────────────────────────

export interface AuditLogResponse {
  id: string;
  user: {
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    profilePictureUrl?: string;
    sex?: "FEMALE" | "MALE";
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    countryCode?: string;
    phoneNumber?: string;
    dayOfBirth?: number;
    monthOfBirth?: number;
    yearOfBirth?: number;
    dayOfWedding?: number;
    monthOfWedding?: number;
    yearOfWedding?: number;
    maritalStatus?: "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED";
    spouse?: string;
    couplePictureUrl?: string;
    occupation?: string;
    assignedFollowUp?: string;
    noOfCalls?: number;
    noOfVisits?: number;
  };
  userAgent: string;
  actionPerformed: string;
  actionPerformedSummary: string;
  module: string;
  location: string;
  isSuccessful: boolean;
  errorMessage?: string;
  createdOn: string;
}

export async function getAuditLogs(
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<AuditLogResponse>> {
  return apiFetch<CustomPageResponse<AuditLogResponse>>(
    `/api/v1/audit-logs?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function searchAuditLogs(
  text: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<AuditLogResponse>> {
  return apiFetch<CustomPageResponse<AuditLogResponse>>(
    `/api/v1/audit-logs/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
}

export async function getAuditLogsInTimeframe(
  startTime: string,
  endTime: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<AuditLogResponse>> {
  return apiFetch<CustomPageResponse<AuditLogResponse>>(
    `/api/v1/audit-logs/timeframe?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function searchAuditLogsInTimeframe(
  text: string,
  startTime: string,
  endTime: string,
  pageNo = 0,
  pageSize = 10,
): Promise<CustomPageResponse<AuditLogResponse>> {
  return apiFetch<CustomPageResponse<AuditLogResponse>>(
    `/api/v1/audit-logs/timeframe/search?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}&pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "POST",
      body: JSON.stringify({ text }),
    },
  );
}

/**
 * Upload a profile picture and return the hosted URL.
 * Uses /api/v1/media with category IMAGES — the backend-supported enum value
 * for image uploads (SERMON, PODCAST, VIDEOS, IMAGES, THUMBNAIL).
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  const result = await uploadMedia({
    title: `profile-${Date.now()}`,
    category: "IMAGES",
    file,
  });
  const photoUrl = result.displayUrl ?? result.url;
  if (!photoUrl)
    throw new Error(
      "Photo uploaded but no URL was returned. Please try again.",
    );
  return photoUrl;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export interface CreateAnnouncementRequest {
  subject: string;
  content: string;
  submittedBy?: string;
  startDate?: string;
  endDate?: string;
}

export interface AnnouncementResponse {
  id: string;
  subject: string;
  content: string;
  submittedBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  announcementStatus: "RECEIVED" | "APPROVED" | "DECLINED";
  reasonForDecline?: string;
  startDate?: string;
  endDate?: string;
  createdOn?: string;
}

export interface SystemSettings {
  noOfDaysBeforeTriggeringFollowup: number;
  announcementDeadline: string;
  memberPerFollowupPersonnel: number;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  return apiFetch<SystemSettings>("/api/v1/settings");
}

export async function updateSystemSettings(
  data: SystemSettings,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/settings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAnnouncements(
  pageNo = 0,
  pageSize = 20,
  status?: string,
): Promise<CustomPageResponse<AnnouncementResponse>> {
  const qs = status ? `&status=${encodeURIComponent(status)}` : "";
  return apiFetch<CustomPageResponse<AnnouncementResponse>>(
    `/api/v1/announcements?pageNo=${pageNo}&pageSize=${pageSize}${qs}`,
  );
}

export async function createAnnouncement(
  data: CreateAnnouncementRequest,
): Promise<AnnouncementResponse> {
  return apiFetch<AnnouncementResponse>("/api/v1/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function approveAnnouncements(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/announcements/approve", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function declineAnnouncement(
  id: string,
  text: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/announcements/${id}/decline`, {
    method: "PUT",
    body: JSON.stringify({ text }),
  });
}

// searchEMembers and searchMembers are declared earlier in this file.

// ─── School of Disciples (SOD) ───────────────────────────────────────────────

export interface SodAttendanceRecord {
  classNumber: number;
  date?: string;
  markedBy?: string;
  markedOn?: string;
}

export interface SchoolOfDisciplesResponse {
  id: string;
  // SoD church identifiers
  admissionNo?: string;
  set?: string;
  region?: string;
  province?: string;
  centre?: string;
  // Personal
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string;
  sex?: string;
  dateOfBirth?: string;
  nationality?: string;
  homeTown?: string;
  stateOfOrigin?: string;
  countryCode?: string;
  phoneNumber?: string;
  // Address
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  // Work
  occupation?: string;
  officeFullAddress?: string;
  // Marital
  maritalStatus?: string;
  spouseName?: string;
  spousePhoneNumber?: string;
  spouseOccupation?: string;
  noOfChildren?: number;
  // Faith
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismLocation?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismLocation?: string;
  // Parish info
  currentParishPastorName?: string;
  currentParishPastorPhoneNumber?: string;
  activityInCurrentParish?: string;
  // Programme
  hasAnotherSimultaneousProgram?: boolean;
  otherInformation?: string;
  // Admin
  consent?: boolean;
  officialRemarks?: string;
  graduationDate?: string;
  paidForForm?: boolean;
  feesPaid?: number;
  createdOn?: string;
  // Attendance tracking
  classAttendance?: SodAttendanceRecord[];
  examAttendance?: SodAttendanceRecord[];
}

/** Full single-record response — includes sub-document arrays */
export interface SchoolOfDiscipleFullResponse extends SchoolOfDisciplesResponse {
  pastPlaceOfWorships?: PastPlaceOfWorship[];
  pastPositionHeldList?: PastPositionHeld[];
  qualifications?: Qualification[];
}

export interface CreateSchoolOfDisciplesRequest {
  // Church location identifiers (all required by backend)
  set?: string;
  region?: string;
  province?: string;
  centre?: string;
  // Personal
  firstName: string;
  middleName?: string;
  lastName: string;
  countryCode: string;
  phoneNumber: string;
  email?: string;
  sex?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  spouseName?: string;
  spousePhoneNumber?: string;
  spouseOccupation?: string;
  noOfChildren?: number;
  nationality?: string;
  homeTown?: string;
  stateOfOrigin?: string;
  // Address
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  // Work
  occupation?: string;
  officeFullAddress?: string;
  // Faith history
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismLocation?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismLocation?: string;
  // Current parish
  currentParishPastorName?: string;
  currentParishPastorPhoneNumber?: string;
  activityInCurrentParish?: string;
  createPastPlaceOfWorshipRequests?: {
    date?: string;
    name?: string;
    address?: string;
  }[];
  createPositionHeldRequests?: {
    worshipPlace?: string;
    positionHeld?: string;
  }[];
  qualificationRequests?: {
    date?: string;
    institution?: string;
    qualificationReceived?: string;
  }[];
  // Misc
  hasAnotherSimultaneousProgram?: boolean;
  otherInformation?: string;
  consent?: boolean;
}

export async function getSchoolOfDisciples(
  pageNo = 0,
  pageSize = 20,
  set?: string,
): Promise<CustomPageResponse<SchoolOfDisciplesResponse>> {
  // Backend confirmed: the `set` param is required for data to be returned.
  // Without it the endpoint returns an empty list.
  const qs = set ? `&set=${encodeURIComponent(set)}` : "";
  return apiFetch<CustomPageResponse<SchoolOfDisciplesResponse>>(
    `/api/v1/school-of-disciples?pageNo=${pageNo}&pageSize=${pageSize}${qs}`,
  );
}

export async function getSchoolOfDisciple(
  id: string,
): Promise<SchoolOfDiscipleFullResponse> {
  return apiFetch<SchoolOfDiscipleFullResponse>(
    `/api/v1/school-of-disciples/${id}`,
  );
}

export async function searchSchoolOfDisciples(
  text: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<SchoolOfDisciplesResponse>> {
  return apiFetch<CustomPageResponse<SchoolOfDisciplesResponse>>(
    `/api/v1/school-of-disciples/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function createSchoolOfDisciple(
  body: CreateSchoolOfDisciplesRequest,
): Promise<SchoolOfDisciplesResponse> {
  return apiFetch<SchoolOfDisciplesResponse>("/api/v1/school-of-disciples", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markSodAsGraduated(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/school-of-disciples/mark-as-graduated",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
}

export async function giveSodOfficialRemark(
  id: string,
  text: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-disciples/${id}/give-official-remark`,
    { method: "PATCH", body: JSON.stringify({ text }) },
  );
}

export async function deleteSodBulk(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/school-of-disciples", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

// markSodClassAttendance / markSodExamAttendance removed — those endpoints do not
// exist in the backend.  Use createAttendanceRecord() (attendance-sheets API) instead.

// ─── Report / Statistics Endpoints ──────────────────────────────────────────

export interface FeatureColumn {
  feature: string;
  totalCount: number;
}
export interface FeatureStatResponse {
  columns: FeatureColumn[];
}
export interface CountStatisticsResponse {
  totalCount: number;
}
export interface PercentStatisticsResponse {
  percentage: number;
  count?: number;
}

export async function getTotalMembers(): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>("/api/v1/users/total-members");
}

export async function getTotalMembersInPeriod(
  startTime: string,
  endTime: string,
): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>(
    `/api/v1/users/total-created-members?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getTotalFirstTimersInPeriod(
  startTime: string,
  endTime: string,
): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>(
    `/api/v1/users/total-first-timers?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getTotalSecondTimersInPeriod(
  startTime: string,
  endTime: string,
): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>(
    `/api/v1/users/total-second-timers?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getTotalNewConvertsInPeriod(
  startTime: string,
  endTime: string,
): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>(
    `/api/v1/new-converts/total-new-converts?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getUrgentFollowup(
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<UserBasicResponse>> {
  return apiFetch<CustomPageResponse<UserBasicResponse>>(
    `/api/v1/users/urgent-followup?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

export async function getVisitingVsNotVisiting(
  startTime: string,
  endTime: string,
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/visiting-vs-not-visiting?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getServiceSectionsStats(
  startTime: string,
  endTime: string,
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/service-sections-statistics-count?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getMediumOfInvitationStats(
  startTime: string,
  endTime: string,
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/medium-of-invitation-statistics-count?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

export async function getMaleVsFemale(
  startTime: string,
  endTime: string
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/male-vs-female?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

export async function getGuestConversionStatistics(
  startTime: string,
  endTime: string
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/guest-conversion-statistics?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

export async function getFirstTimerToSecondTimerRate(
  startTime: string,
  endTime: string
): Promise<PercentStatisticsResponse> {
  return apiFetch<PercentStatisticsResponse>(
    `/api/v1/users/first-timer-to-second-timer-rate?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

export async function getFirstTimerToMemberRate(
  startTime: string,
  endTime: string
): Promise<PercentStatisticsResponse> {
  return apiFetch<PercentStatisticsResponse>(
    `/api/v1/users/first-timer-to-member-rate?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

export async function getInactiveMemberStatistics(
  anyTime: string
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/users/inactive-member-statistics?anyTime=${encodeURIComponent(anyTime)}`
  );
}

export async function getBirthdayStatistics(): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>("/api/v1/users/birthday-statistics");
}

export async function getWeddingStatistics(): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>("/api/v1/users/wedding-statistics");
}

export async function getTotalFiveGroups(): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>("/api/v1/groups/total-five-groups");
}

export async function getBelieverClassStageStatistics(
  startTime: string,
  endTime: string
): Promise<FeatureStatResponse> {
  return apiFetch<FeatureStatResponse>(
    `/api/v1/new-converts/believer-class-stage-statistics?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

export async function getCelebrationVsTestimony(
  anyTime: string
): Promise<unknown[]> {
  return apiFetch<unknown[]>(
    `/api/v1/testimonies/celebration-vs-testimony?anyTime=${encodeURIComponent(anyTime)}`
  );
}

export async function getTotalSpecialEvents(
  startTime: string,
  endTime: string
): Promise<CountStatisticsResponse> {
  return apiFetch<CountStatisticsResponse>(
    `/api/v1/events/total-special-events?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
  );
}

// ─── Training Events ──────────────────────────────────────────────────────────

export interface TrainingEventResponse {
  id: string;
  trainingCategory?:
    | "BAPTISM"
    | "WORKERS_IN_TRAINING"
    | "SCHOOL_OF_DISCIPLES"
    | "SCHOOL_OF_MINISTRY";
  name?: string;
  date?: string;
  teacher?: string;
  location?: string;
  isExam?: boolean;
  set?: string;
  createdOn?: string;
}

export interface CreateTrainingEventRequest {
  trainingCategory: string;
  name: string;
  teacher?: string;
  date: string;
  location?: string;
  isExam?: boolean;
  set?: string;
}

export async function getTrainingEvents(
  category?: string,
  set?: string,
): Promise<TrainingEventResponse[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (set) params.set("set", set);
  return apiFetch<TrainingEventResponse[]>(`/api/v1/training-events?${params}`);
}

export async function getTrainingEvent(
  id: string,
): Promise<TrainingEventResponse> {
  return apiFetch<TrainingEventResponse>(`/api/v1/training-events/${id}`);
}

export async function createTrainingEvent(
  body: CreateTrainingEventRequest,
): Promise<TrainingEventResponse> {
  return apiFetch<TrainingEventResponse>("/api/v1/training-events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateTrainingEvent(
  id: string,
  body: CreateTrainingEventRequest,
): Promise<TrainingEventResponse> {
  return apiFetch<TrainingEventResponse>(`/api/v1/training-events/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteTrainingEvent(
  id: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/training-events/${id}`, {
    method: "DELETE",
  });
}

// ─── Attendance Sheets ────────────────────────────────────────────────────────

export interface StudentAttendance {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  admissionNo?: string;
  profilePictureUrl?: string;
  /** Swagger: { attendanceId, trainingEventName } per AttendanceSheetResponse schema */
  attendances?: { attendanceId?: string; trainingEventName?: string }[];
}

export interface AttendanceSheetResponse {
  set?: string;
  studentAttendances?: StudentAttendance[];
}

export async function getAttendanceSheet(
  category: string,
  set: string,
): Promise<AttendanceSheetResponse> {
  return apiFetch<AttendanceSheetResponse>(
    `/api/v1/attendance-sheets/attendance-sheet?category=${encodeURIComponent(category)}&set=${encodeURIComponent(set)}`,
  );
}

export async function createAttendanceRecord(body: {
  trainingEventId: string;
  admissionNumber: string;
  category: string;
}): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/attendance-sheets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteAttendanceSheet(
  id: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/attendance-sheets/${id}`, {
    method: "DELETE",
  });
}

// ─── Score Sheets ─────────────────────────────────────────────────────────────

export interface CreateScoreRequest {
  trainingEventName: string;
  set: string;
  admissionNumber: string;
  score: number;
}

export interface ScoreSheetResponse {
  id?: string;
  category?: string;
  set?: string;
  admissionNumber?: string;
  score?: number;
  trainingEventName?: string;
}

export async function getScoreBroadsheet(
  category: string,
  set: string,
): Promise<unknown> {
  return apiFetch<unknown>(
    `/api/v1/score-sheets/broadsheet?category=${encodeURIComponent(category)}&set=${encodeURIComponent(set)}`,
  );
}

export async function uploadScoreSheet(body: {
  category: string;
  createScoreRequests: CreateScoreRequest[];
}): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/score-sheets/upload", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Swagger: PUT /api/v1/score-sheets/{id}?score=X  — score is a query param, not body */
export async function updateScoreSheet(
  id: string,
  score: number,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/score-sheets/${id}?score=${score}`, {
    method: "PUT",
  });
}

export async function deleteScoreSheet(
  id: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/score-sheets/${id}`, {
    method: "DELETE",
  });
}

// ─── School of Disciples — extra endpoints ────────────────────────────────────

export async function updateSodAdmissionNumber(
  id: string,
  admissionNumber: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-disciples/${id}/admission-number?admissionNumber=${encodeURIComponent(admissionNumber)}`,
    { method: "PUT" },
  );
}

export async function updateSodFeesPaid(
  id: string,
  feesPaid: number,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-disciples/${id}/fees-paid?feesPaid=${feesPaid}`,
    { method: "PUT" },
  );
}

export async function markSodFormAsPaid(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/school-of-disciples/mark-form-as-paid",
    {
      method: "POST",
      body: JSON.stringify({ ids }),
    },
  );
}

export async function getSodNewConvert(
  id: string,
): Promise<NewConvertResponse> {
  return apiFetch<NewConvertResponse>(
    `/api/v1/school-of-disciples/${id}/new-convert`,
  );
}

export interface SetupNewConvertRequest {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  countryCode?: string;
  phoneNumber?: string;
  email?: string;
  sex?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  eventId?: string;
  profilePictureUrl?: string;
}

export async function updateSodNewConvert(
  id: string,
  body: SetupNewConvertRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-disciples/${id}/new-convert`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
  );
}

export async function deleteSodNewConvert(
  id: string,
  newConvertId: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-disciples/${id}/new-convert/${newConvertId}`,
    { method: "DELETE" },
  );
}

// ─── New Converts — extra endpoints ──────────────────────────────────────────

export async function updateNewConvert(
  id: string,
  body: SetupNewConvertRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/new-converts/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function bulkCreateNewConverts(
  body: SetupNewConvertRequest[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/new-converts/bulk-create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function searchNewConverts(
  text: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<NewConvertResponse>> {
  return apiFetch<CustomPageResponse<NewConvertResponse>>(
    `/api/v1/new-converts/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Users — extra endpoints ──────────────────────────────────────────────────

export async function getUsersByIds(ids: string[]): Promise<UserResponse[]> {
  return apiFetch<UserResponse[]>("/api/v1/users/bulk-ids", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function searchAllUsers(
  text: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/users/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Celebrations — extra endpoints ──────────────────────────────────────────

export async function searchCelebrations(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<CelebrationResponse>> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<CelebrationResponse>>(
    `/api/v1/celebrations/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Requests — search ────────────────────────────────────────────────────────

export async function searchRequests(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<RequestResponse>> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Groups — bulk create ─────────────────────────────────────────────────────

export async function bulkCreateGroups(
  body: CreateGroupRequest[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/groups/bulk-create", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Announcements — read ─────────────────────────────────────────────────────

export async function getReadAnnouncements(): Promise<AnnouncementResponse[]> {
  return apiFetch<AnnouncementResponse[]>("/api/v1/announcements/read");
}

export async function searchAnnouncements(
  text: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<AnnouncementResponse>> {
  return apiFetch<CustomPageResponse<AnnouncementResponse>>(
    `/api/v1/announcements/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── School of Ministry ──────────────────────────────────────────────────────

export interface SchoolOfMinistryResponse {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  sex?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  noOfChildren?: number;
  spouseName?: string;
  countryCode?: string;
  phoneNumber?: string;
  homeAddress?: string;
  occupation?: string;
  placeOfWork?: string;
  workPhoneNumber?: string;
  officeAddress?: string;
  profilePictureUrl?: string;
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismChurch?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismChurch?: string;
  hasGoneThroughNewConvertsClass?: boolean;
  hasGoneThroughWaterBaptismalClass?: boolean;
  otherInformation?: string;
  officialRemarks?: string;
  createdOn?: string;
}

export interface SchoolOfMinistryFullResponse extends SchoolOfMinistryResponse {
  qualifications?: { schoolAttended?: string; dates?: string; qualificationReceived?: string }[];
  recentWorshipPlaces?: { name?: string }[];
  churchDepartments?: { name?: string; date?: string }[];
  reasonsForAttending?: string[];
}

export interface CreateSchoolOfMinistryRequest {
  set?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  sex?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  noOfChildren?: number;
  spouseName?: string;
  countryCode: string;
  phoneNumber: string;
  homeAddress?: string;
  occupation?: string;
  placeOfWork?: string;
  workPhoneNumber?: string;
  officeAddress?: string;
  profilePictureUrl?: string;
  salvationDate?: string;
  salvationLocation?: string;
  waterBaptismDate?: string;
  waterBaptismChurch?: string;
  holySpiritBaptismDate?: string;
  holySpiritBaptismChurch?: string;
  hasGoneThroughNewConvertsClass?: boolean;
  hasGoneThroughWaterBaptismalClass?: boolean;
  otherInformation?: string;
  qualificationRequests?: { schoolAttended?: string; dates?: string; qualificationReceived?: string }[];
  recentWorshipPlaces?: { name?: string }[];
  churchDepartments?: { name?: string; date?: string }[];
  reasonsForAttending?: string[];
}

export async function getSchoolOfMinistries(
  pageNo = 0,
  pageSize = 20,
  set?: number,
): Promise<CustomPageResponse<SchoolOfMinistryResponse>> {
  const setParam = set != null ? `&set=${set}` : "";
  return apiFetch<CustomPageResponse<SchoolOfMinistryResponse>>(
    `/api/v1/school-of-ministries?pageNo=${pageNo}&pageSize=${pageSize}${setParam}`,
  );
}

export async function getSchoolOfMinistry(
  id: string,
): Promise<SchoolOfMinistryFullResponse> {
  return apiFetch<SchoolOfMinistryFullResponse>(
    `/api/v1/school-of-ministries/${id}`,
  );
}

export async function searchSchoolOfMinistries(
  text: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<SchoolOfMinistryResponse>> {
  return apiFetch<CustomPageResponse<SchoolOfMinistryResponse>>(
    `/api/v1/school-of-ministries/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function createSchoolOfMinistry(
  body: CreateSchoolOfMinistryRequest,
): Promise<SchoolOfMinistryResponse> {
  return apiFetch<SchoolOfMinistryResponse>("/api/v1/school-of-ministries", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function giveSomOfficialRemark(
  id: string,
  text: string,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-ministries/${id}/give-official-remark`,
    { method: "PATCH", body: JSON.stringify({ text }) },
  );
}

// ─── Marketplace (Products) ───────────────────────────────────────────────────

export type ProductCategory = "BOOK" | "ELECTRONICS" | "COOKING_UTENSILS" | "AUTOMOBILE" | "WEARS";

export interface ProductResponse {
  id: string;
  name: string;
  price?: number;
  quantityLeft?: number;
  owner?: {
    id: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
  };
  isApproved?: boolean;
  images?: string[];
  description?: string;
  otherInformation?: string;
  tags?: string[];
  productCategory?: ProductCategory;
  averageRating?: number;
  createdOn?: string;
  updatedOn?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  owner?: string;
  price?: number;
  images?: string[];
  quantityLeft?: number;
  otherInformation?: string;
  tags?: string[];
  category?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  owner?: string;
  price?: number;
  otherInformation?: string;
  tags?: string[];
  category?: string;
}

export async function getProducts(
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<ProductResponse>> {
  return apiFetch<CustomPageResponse<ProductResponse>>(
    `/api/v1/products?pageNo=${pageNo}&pageSize=${pageSize}`,
  );
}

/**
 * There is no GET /api/v1/products/{id} endpoint in Swagger
 * (the backend only accepts PUT and PATCH on that path).
 * Strategy:
 *  1. Check sessionStorage for a previously-cached copy (set by the listing page).
 *  2. Fallback: search by fetching all products (up to 200) and find by ID.
 */
export async function getProduct(id: string): Promise<ProductResponse> {
  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(`product_${id}`);
    if (cached) {
      try { return JSON.parse(cached) as ProductResponse; } catch {}
    }
  }
  const page = await apiFetch<CustomPageResponse<ProductResponse>>(
    `/api/v1/products?pageNo=0&pageSize=200`,
  );
  const found = (page.content ?? []).find((p) => p.id === id);
  if (!found) throw new Error("Product not found.");
  return found;
}

export async function createProduct(
  body: CreateProductRequest,
): Promise<ProductResponse> {
  return apiFetch<ProductResponse>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProduct(
  id: string,
  body: UpdateProductRequest,
): Promise<ProductResponse> {
  return apiFetch<ProductResponse>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/products", {
    method: "DELETE",
    body: JSON.stringify({ ids: [id] }),
  });
}

export async function searchProducts(
  query: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<ProductResponse>> {
  return apiFetch<CustomPageResponse<ProductResponse>>(
    `/api/v1/products/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text: query }) },
  );
}

export async function approveProducts(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/products/approve", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export interface FilterRequest {
  text?: string;
  fromQuantity?: number;
  toQuantity?: number;
  fromAmount?: number;
  toAmount?: number;
  ownerId?: string;
  category?: string;
}

export async function filterApprovedProducts(
  filter: FilterRequest,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<ProductResponse>> {
  return apiFetch<CustomPageResponse<ProductResponse>>(
    `/api/v1/products/filter-approved?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify(filter) },
  );
}

/** PATCH /api/v1/products/{id}?quantity=X — update product quantity */
export async function updateProductQuantity(
  id: string,
  quantity: number,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/products/${id}?quantity=${quantity}`,
    { method: "PATCH" },
  );
}

export interface GiveProductFeedbackRequest {
  comment?: string;
  rating?: number;
}

export async function giveProductFeedback(
  id: string,
  body: GiveProductFeedbackRequest,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/products/${id}/feedback`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── School of Ministry — extra endpoints ────────────────────────────────────

/** PUT /api/v1/school-of-ministries/{id}/fees-paid?feesPaid=X */
export async function updateSomFeesPaid(
  id: string,
  feesPaid: number,
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/school-of-ministries/${id}/fees-paid?feesPaid=${feesPaid}`,
    { method: "PUT" },
  );
}

/** POST /api/v1/school-of-ministries/mark-as-graduated */
export async function markSomAsGraduated(
  ids: string[],
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    "/api/v1/school-of-ministries/mark-as-graduated",
    { method: "POST", body: JSON.stringify({ ids }) },
  );
}

/** DELETE /api/v1/school-of-ministries/{id} */
export async function deleteSom(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/school-of-ministries/${id}`, {
    method: "DELETE",
  });
}

// ─── Requests — search sub-types ─────────────────────────────────────────────

export async function searchPrayerRequests(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<RequestResponse>> {
  const params = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/prayer/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function searchCounselingRequests(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<RequestResponse>> {
  const params = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/counseling/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

export async function searchSuggestions(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<RequestResponse>> {
  const params = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/suggestion/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── Testimonies — search ─────────────────────────────────────────────────────

export async function searchTestimonies(
  text: string,
  status?: string,
  pageNo = 0,
  pageSize = 20,
): Promise<CustomPageResponse<TestimonyResponse>> {
  const params = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (status) params.set("status", status);
  return apiFetch<CustomPageResponse<TestimonyResponse>>(
    `/api/v1/testimonies/search?${params}`,
    { method: "POST", body: JSON.stringify({ text }) },
  );
}

// ─── User statistics — missing endpoints ─────────────────────────────────────

/** GET /api/v1/users/followup-attention-rate */
export async function getFollowupAttentionRate(
  startTime: string,
  endTime: string,
): Promise<PercentStatisticsResponse> {
  return apiFetch<PercentStatisticsResponse>(
    `/api/v1/users/followup-attention-rate?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
  );
}

// ─── Media — large file upload ────────────────────────────────────────────────

/**
 * POST /api/v1/media/large — upload large media (e.g. videos with thumbnails).
 * Same multipart pattern as uploadMedia but targets the /large endpoint.
 */
export async function uploadLargeMedia(fields: {
  title: string;
  description?: string;
  category: string;
  file: File;
  thumbnail?: File;
  duration?: number;
  speaker?: string;
  date?: string;
  tags?: string[];
}): Promise<MediaResponse> {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const params = new URLSearchParams({
    title: fields.title,
    type: fields.category,
    category: fields.category,
    size: String(fields.file.size),
    isFromMedia: "true",
  });
  if (fields.description) params.set("description", fields.description);
  if (fields.duration != null) params.set("duration", String(fields.duration));
  if (fields.speaker) params.set("speaker", fields.speaker);
  if (fields.date)    params.set("date", fields.date);
  if (fields.tags && fields.tags.length > 0) params.set("tags", fields.tags.join(","));

  const form = new FormData();
  form.append("multipartFile", fields.file);
  if (fields.thumbnail) form.append("thumbnailMultipartFile", fields.thumbnail);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`/api/v1/media/large?${params.toString()}`, {
    method: "POST",
    headers,
    body: form,
  });

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!response.ok) {
    let msg = `Upload failed (${response.status})`;
    try {
      const raw = await response.text();
      if (raw) { try { const b = JSON.parse(raw); msg = b?.message ?? raw; } catch { msg = raw; } }
    } catch {}
    throw new Error(msg);
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as MediaResponse) : ({} as MediaResponse);
}
