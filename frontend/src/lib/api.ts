/**
 * ROSMS API Service
 * Base URL: http://137.184.72.16:6001
 * Sprint 1 endpoints: User Management, Settings, Groups, Events
 */

// Empty string = relative URL, so requests go to /api/...
// Netlify proxies /api/* → http://137.184.72.16:6001/api/* server-side,
// avoiding the browser's mixed-content (HTTPS→HTTP) block.
const BASE_URL = "";

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
 * Returns false ONLY when we are certain the token is expired (we decoded
 * it successfully and the exp claim is in the past). If we cannot decode the
 * payload we let the token through — the backend will reject it with 401 if
 * it is truly invalid.
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return false; // can't decode → assume not expired, let backend decide
  if (typeof payload.exp === "number") {
    return payload.exp * 1000 < Date.now();
  }
  return false; // no exp claim → not expired
}

async function apiFetchRaw<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiFetchResult<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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

  // PATCH and PUT requests are blocked by the backend CORS policy when the
  // browser's Origin header is forwarded by Netlify's reverse-proxy redirect.
  // Route them through a serverless function that strips Origin so the call
  // arrives at the backend as a plain server-to-server request (no CORS check).
  const method = (options.method ?? "GET").toUpperCase();
  let fetchUrl = `${BASE_URL}${path}`;
  let fetchMethod = method;
  if (
    typeof window !== "undefined" &&
    (method === "PATCH" || method === "PUT")
  ) {
    // Separate the path from any query string the caller already attached
    const [basePath, existingQs] = path.split("?");
    let proxyUrl = `/.netlify/functions/api-proxy?_path=${encodeURIComponent(basePath)}&_method=${method}`;
    if (existingQs) proxyUrl += `&_qs=${encodeURIComponent(existingQs)}`;
    fetchUrl   = proxyUrl;
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
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMessage = errBody.message;
      else if (errBody?.error) errorMessage = errBody.error;
    } catch {
      // ignore parse errors
    }
    // 405 on a user profile update means the backend hasn't implemented
    // the update endpoint yet — surface a clear message instead of raw HTTP status.
    if (response.status === 405 && (method === "PATCH" || method === "PUT" || method === "POST")) {
      errorMessage = "Profile updates are not yet available on the server. Please contact the backend team to enable this feature.";
    }
    throw new Error(errorMessage);
  }

  // Some endpoints return empty body on success
  const text = await response.text();
  const data = text ? (JSON.parse(text) as T) : ({} as T);
  return { data, headers: response.headers };
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
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
  // Spouse / couple info
  spouse?: UserResponse;
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
}

// ─── Auth Endpoints ─────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export async function loginUser(body: LoginRequest): Promise<UserResponse> {
  const response = await apiFetch<UserResponse>("/.netlify/functions/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (response.token) {
    // Real JWT from backend — store directly
    setToken(response.token);
  } else if (response.id) {
    // Backend login succeeded but has not returned a JWT yet.
    // Store a session marker so the UI remains accessible.
    setToken(`session_${response.id}`);
  }

  setStoredUser({
    id: response.id,
    firstName: response.firstName,
    lastName: response.lastName,
    email: response.email,
    userType: response.userType,
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
  pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/member?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createMember(
  body: CreateMemberRequest
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/member", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateMember(
  id: string,
  body: Partial<CreateMemberRequest>
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteMembersBulk(ids: string[]): Promise<OperationalResponse> {
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
  pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/e-member?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createEMember(
  body: CreateEMemberRequest
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/e-member", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateEMember(
  id: string,
  body: Partial<CreateEMemberRequest>
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteEMembersBulk(ids: string[]): Promise<OperationalResponse> {
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
  mediumOfInvitation?: string;   // how they heard about the church
  serviceRating?: number;        // 1–5 numeric rating of the service
  favouritePartOfService?: string;
  fromOnline?: boolean;          // worshipped online before
}

export async function getFirstTimers(
  pageNo = 0,
  pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/first-timer?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createFirstTimer(
  body: CreateFirstTimerRequest
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/first-timer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateFirstTimer(
  id: string,
  body: Partial<CreateFirstTimerRequest>
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteFirstTimersBulk(ids: string[]): Promise<OperationalResponse> {
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
  pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/second-timer?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createSecondTimer(
  body: CreateSecondTimerRequest
): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/v1/users/second-timer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateSecondTimer(
  id: string,
  body: Partial<CreateSecondTimerRequest>
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/v1/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteSecondTimersBulk(ids: string[]): Promise<OperationalResponse> {
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
  service?: EventResponse;
  createdOn?: string;
}

export async function getNewConverts(
  pageNo = 0,
  pageSize = 10
): Promise<CustomPageResponse<NewConvertResponse>> {
  return apiFetch<CustomPageResponse<NewConvertResponse>>(
    `/api/v1/new-converts?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getNewConvert(id: string): Promise<NewConvertResponse> {
  return apiFetch<NewConvertResponse>(`/api/v1/new-converts/${id}`);
}

export async function createNewConvert(
  body: CreateNewConvertRequest
): Promise<NewConvertResponse> {
  return apiFetch<NewConvertResponse>("/api/v1/new-converts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteNewConvertsBulk(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/new-converts", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export async function markNewConvertsAsAttended(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/new-converts/mark-as-attended", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ─── Follow-up Actions ──────────────────────────────────────────────────────────

export async function addNote(
  userId: string,
  note: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export async function addCallReport(
  userId: string,
  report: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/call-report`, {
    method: "POST",
    body: JSON.stringify({ report }),
  });
}

export async function addVisitReport(
  userId: string,
  report: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/visit-report`, {
    method: "POST",
    body: JSON.stringify({ report }),
  });
}

export async function assignFollowUp(
  userId: string,
  officerId: string,
  note?: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/assign-follow-up`, {
    method: "POST",
    body: JSON.stringify({ officerId, note }),
  });
}

export async function convertToSecondTimer(
  userId: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/convert-to-second-timer`
  );
}

export async function convertToFullMember(
  userId: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/users/${userId}/convert-to-full-member`
  );
}

// Alias kept for backward compatibility with pages that imported the old name
export const convertToMember = convertToFullMember;

export async function linkSpouse(
  userId: string,
  spouseId: string
): Promise<UserResponse> {
  return apiFetch<UserResponse>(
    `/api/v1/users/${userId}/link-spouse/${spouseId}`,
    { method: "POST" }
  );
}

export async function markUserAsInactive(
  userId: string,
  reason: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/users/${userId}/mark-as-inactive`, {
    method: "PATCH",
    body: JSON.stringify({ text: reason }),
  });
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
  userId: string
): Promise<GuestInformationResponse> {
  return apiFetch<GuestInformationResponse>(
    `/api/v1/users/${userId}/guest-information`
  );
}

// Note: believers-class update endpoint not yet available on backend.
// Stubbed for when backend team adds it.
export async function updateBelieversClass(
  userId: string,
  believersClass: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/new-converts/${userId}/believers-class`, {
    method: "PUT",
    body: JSON.stringify({ believerClassStage: believersClass }),
  });
}

// ─── Settings ───────────────────────────────────────────────────────────────────

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(
  body: ChangePasswordRequest
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
  body: AssignSuperAdminRequest
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/users/assign-super-admin", {
    method: "POST",
    body: JSON.stringify(body),
  });
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
  additionalInformation?: string;  // backend DTO field name (EventResponse uses additionalInstructions)
  eFlyer?: string;
  requiresRegistration?: boolean;
}

export async function getEvents(
  pageNo = 0,
  pageSize = 10
): Promise<CustomPageResponse<EventResponse>> {
  return apiFetch<CustomPageResponse<EventResponse>>(
    `/api/v1/events?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createEvent(
  body: CreateEventRequest
): Promise<EventResponse> {
  return apiFetch<EventResponse>("/api/v1/events", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getEvent(id: string): Promise<EventResponse> {
  // Backend uses POST /api/v1/events/{id} (per Swagger spec)
  return apiFetch<EventResponse>(`/api/v1/events/${id}`, { method: "POST" });
}

export async function getEventForms(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/api/v1/events/${id}/forms`);
}

// ─── Event Attendees ─────────────────────────────────────────────────────────

export async function getEventFirstTimers(
  eventId: string,
  pageNo = 0,
  pageSize = 20
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/events/${eventId}/first-timers?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getEventEMembers(
  eventId: string,
  pageNo = 0,
  pageSize = 20
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/events/${eventId}/e-members?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getEventNewConverts(
  eventId: string,
  pageNo = 0,
  pageSize = 20
): Promise<CustomPageResponse<NewConvertResponse>> {
  return apiFetch<CustomPageResponse<NewConvertResponse>>(
    `/api/v1/events/${eventId}/new-converts?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

// Mark E-Member attendance for an event
export async function markEMemberEventAttendance(
  eventId: string,
  eMemberId: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/events/${eventId}/e-members/${eMemberId}/attend`,
    { method: "POST" }
  );
}

export async function updateEvent(
  id: string,
  body: Partial<CreateEventRequest>
): Promise<EventResponse> {
  // Backend uses POST /api/v1/events/{id} for updates (no PUT endpoint exists)
  return apiFetch<EventResponse>(`/api/v1/events/${id}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function cancelEvent(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/events/${id}/cancel`, {
    method: "PATCH",
  });
}

// ─── Search helpers ──────────────────────────────────────────────────────────

export async function searchMembers(
  text: string, pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/member/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) }
  );
}

export async function searchEMembers(
  text: string, pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/e-member/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) }
  );
}

// ─── Groups ──────────────────────────────────────────────────────────────────

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  groupHead?: { id: string; firstName?: string; middleName?: string; lastName?: string };
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
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<GroupResponse>> {
  return apiFetch<CustomPageResponse<GroupResponse>>(
    `/api/v1/groups?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getAllGroups(): Promise<GroupResponse[]> {
  return apiFetch<GroupResponse[]>("/api/v1/groups/all");
}

export async function getGroup(id: string): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${id}`, { method: "POST" });
}

export async function createGroup(body: CreateGroupRequest): Promise<GroupResponse> {
  return apiFetch<GroupResponse>("/api/v1/groups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateGroup(
  id: string, body: Partial<CreateGroupRequest>
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateGroupHead(
  groupId: string, groupHeadId: string
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${groupId}/${groupHeadId}`, {
    method: "PUT",
  });
}

export async function deleteGroupsBulk(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/groups", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export async function searchGroups(
  text: string, pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<GroupResponse>> {
  return apiFetch<CustomPageResponse<GroupResponse>>(
    `/api/v1/groups/search?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ text }) }
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
  pageNo = 0, pageSize = 50
): Promise<CustomPageResponse<RoleResponse>> {
  return apiFetch<CustomPageResponse<RoleResponse>>(
    `/api/v1/roles?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createRole(body: { name: string; description?: string }): Promise<RoleResponse> {
  return apiFetch<RoleResponse>("/api/v1/roles", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getRole(id: string): Promise<RoleResponse> {
  return apiFetch<RoleResponse>(`/api/v1/roles/${id}`);
}

export async function updateRole(
  id: string, body: { name: string; description?: string }
): Promise<RoleResponse> {
  return apiFetch<RoleResponse>(`/api/v1/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── Testimonies ─────────────────────────────────────────────────────────────

export interface TestimonyResponse {
  id: string;
  subject: string;
  content: string;
  owner?: { id: string; firstName?: string; middleName?: string; lastName?: string };
  isFeatured?: boolean;
  featureDate?: string;
  state?: string;
  country?: string;
  testimonyStatus?: string;
  createdOn?: string;
}

export async function getTestimonies(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<TestimonyResponse>> {
  return apiFetch<CustomPageResponse<TestimonyResponse>>(
    `/api/v1/testimonies?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getFeaturedTestimonies(): Promise<TestimonyResponse[]> {
  return apiFetch<TestimonyResponse[]>("/api/v1/testimonies/featured");
}

export async function createTestimony(body: {
  subject: string; content: string; userId: string; state?: string; country?: string;
}): Promise<TestimonyResponse> {
  return apiFetch<TestimonyResponse>("/api/v1/testimonies", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markTestimonyAsFeatured(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/testimonies/mark-as-featured", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function markTestimonyAsNotFeatured(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/testimonies/mark-as-not-featured", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function markTestimonyAsRead(ids: string[]): Promise<OperationalResponse> {
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
  assignedTo?: { id: string; firstName?: string; middleName?: string; lastName?: string };
  owner?: { id: string; firstName?: string; middleName?: string; lastName?: string };
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
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getCounselingRequests(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/counseling?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getPrayerRequests(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/prayer?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getSuggestions(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/suggestion?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createCounselingRequest(body: CreateRequestBody): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/counseling", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createPrayerRequest(body: CreateRequestBody): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/prayer", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createSuggestion(body: CreateRequestBody): Promise<RequestResponse> {
  return apiFetch<RequestResponse>("/api/v1/requests/suggestion", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function changeRequestStatus(
  id: string, status: string
): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(
    `/api/v1/requests/${id}/change-status?status=${encodeURIComponent(status)}`,
    { method: "PATCH" }
  );
}

export async function getRequest(id: string): Promise<RequestResponse> {
  // Backend has no GET /api/v1/requests/{id} endpoint.
  // Fetch the full list and find by ID across all request types.
  const [allReqs, prayerReqs, counselingReqs, suggestionReqs] = await Promise.allSettled([
    getAllRequests(0, 200),
    getPrayerRequests(0, 200),
    getCounselingRequests(0, 200),
    getSuggestions(0, 200),
  ]);

  const lists = [allReqs, prayerReqs, counselingReqs, suggestionReqs]
    .filter((r): r is PromiseFulfilledResult<CustomPageResponse<RequestResponse>> => r.status === "fulfilled")
    .flatMap((r) => r.value.content ?? []);

  const found = lists.find((r) => r.id === id);
  if (!found) throw new Error("Request not found.");
  return found;
}

export async function getUserRequests(
  userId: string, pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<RequestResponse>> {
  return apiFetch<CustomPageResponse<RequestResponse>>(
    `/api/v1/requests/${userId}/user?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

// ─── Celebrations ─────────────────────────────────────────────────────────────

export interface CelebrationResponse {
  id: string;
  requester?: { id: string; firstName?: string; middleName?: string; lastName?: string };
  celebrationType?: string;
  celebrationStatus?: string;
  date?: string;
  notes?: string;
  createdOn?: string;
}

export async function getCelebrations(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<CelebrationResponse>> {
  return apiFetch<CustomPageResponse<CelebrationResponse>>(
    `/api/v1/celebrations?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function createCelebration(body: {
  userId: string; type: string; date: string; notes?: string;
}): Promise<CelebrationResponse> {
  return apiFetch<CelebrationResponse>("/api/v1/celebrations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markCelebrationsAsTreated(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/celebrations/mark-as-treated", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

export async function getCelebration(id: string): Promise<CelebrationResponse> {
  return apiFetch<CelebrationResponse>(`/api/v1/celebrations/${id}`);
}

export async function updateCelebration(
  id: string, body: { type?: string; date?: string; notes?: string }
): Promise<CelebrationResponse> {
  return apiFetch<CelebrationResponse>(`/api/v1/celebrations/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// ─── Birthdays & Weddings ─────────────────────────────────────────────────────

export async function getBirthdays(
  startDay: number, startMonth: number,
  endDay: number, endMonth: number,
  pageNo = 0, pageSize = 50
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/birthdays?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ startDay, startMonth, endDay, endMonth }) }
  );
}

export async function getWeddingAnniversaries(
  startDay: number, startMonth: number,
  endDay: number, endMonth: number,
  pageNo = 0, pageSize = 50
): Promise<CustomPageResponse<UserResponse>> {
  return apiFetch<CustomPageResponse<UserResponse>>(
    `/api/v1/users/weddings?pageNo=${pageNo}&pageSize=${pageSize}`,
    { method: "POST", body: JSON.stringify({ startDay, startMonth, endDay, endMonth }) }
  );
}

// ─── Media ────────────────────────────────────────────────────────────────────

export interface MediaResponse {
  id: string;
  name?: string;
  displayName?: string;
  type?: string;           // media type enum: SERMON, PODCAST, VIDEOS, IMAGES, THUMBNAIL
  size?: number;
  displayUrl?: string;     // URL to access the uploaded media
  url?: string;            // alias — some callers use .url
  title?: string;
  duration?: number;
  speaker?: string;
  date?: string;
  description?: string;
  thumbnailUrl?: string;
  mediaCategory?: string;
  tags?: string[];
  createdOn?: string;
  // legacy aliases (kept for compatibility)
  category?: string;
  fileType?: string;
  fileSize?: number;
}

export async function getMedia(
  pageNo = 0, pageSize = 10
): Promise<CustomPageResponse<MediaResponse>> {
  return apiFetch<CustomPageResponse<MediaResponse>>(
    `/api/v1/media?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getMediaCategories(): Promise<string[]> {
  return apiFetch<string[]>("/api/v1/media/category");
}

export async function getMediaItem(id: string): Promise<MediaResponse> {
  return apiFetch<MediaResponse>(`/api/v1/media/${id}`);
}

export async function deleteMediaBulk(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/media", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

/**
 * Upload a media item. Uses multipart/form-data so the browser sets the
 * Content-Type header automatically (with the correct boundary).
 */
export async function uploadMedia(fields: {
  title: string;
  description?: string;
  category: string;
  file: File;
}): Promise<MediaResponse> {
  const token = getToken();
  if (token && isTokenExpired(token)) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  const form = new FormData();
  form.append("title", fields.title);
  if (fields.description) form.append("description", fields.description);
  form.append("type", fields.category);   // backend field is "type", not "category"
  // "size" is required by the backend DTO — send file size in bytes
  form.append("size", String(fields.file ? fields.file.size : 0));
  // Backend multipart field name is "multipartFile" (from UploadMediaRequest DTO)
  if (fields.file) form.append("multipartFile", fields.file);

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Upload directly to the backend to bypass Netlify's 10 MB proxy-redirect limit.
  // The backend allows all origins (Access-Control-Allow-Origin: *) and Bearer-token
  // auth works without Access-Control-Allow-Credentials, so CORS is fine.
  const BACKEND_URL = "https://api.rccgros.org";
  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/v1/media`, {
      method: "POST",
      headers,
      body: form,
    });
  } catch {
    // TypeError — usually a CORS preflight rejection or network failure
    throw new Error(
      "Media upload could not reach the server. This may be a CORS issue — please ask the backend team to allow uploads from the Netlify domain, or try again on a stable connection."
    );
  }

  if (response.status === 401) {
    removeToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMessage = errBody.message;
      else if (errBody?.error) errorMessage = errBody.error;
    } catch { /* ignore */ }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as MediaResponse) : ({} as MediaResponse);
}

/**
 * Upload a profile picture and return the hosted URL.
 * Uses /api/v1/media with category IMAGES.
 */
export async function uploadProfilePicture(file: File): Promise<string> {
  const result = await uploadMedia({
    title: `profile-${Date.now()}`,
    category: "IMAGES",
    file,
  });
  const photoUrl = result.displayUrl ?? result.url;
  if (!photoUrl) throw new Error("Photo uploaded but no URL was returned. Please try again.");
  return photoUrl;
}
