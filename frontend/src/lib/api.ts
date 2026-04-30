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
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // 401 → only force logout when a real JWT is stored (starts with "eyJ").
  // If the session was created before the backend began issuing tokens,
  // just surface an auth error so the page can show it without looping.
  if (response.status === 401) {
    const currentToken = getToken();
    if (!currentToken || currentToken.startsWith("eyJ")) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error("Authentication required. Please contact your administrator.");
  }

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMessage = errBody.message;
    } catch {
      // ignore parse errors
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

export interface GroupResponse {
  id: string;
  name: string;
  description?: string;
  membersCount?: number;
  groupHead?: string;
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
    `/api/v1/users/${userId}/link-spouse/${spouseId}`
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

// ─── Groups ─────────────────────────────────────────────────────────────────────

export interface CreateGroupRequest {
  name: string;
  description?: string;
  groupHeadId?: string;
  whatsAppLink?: string;
  whatsAppQRCode?: string;
}

export async function getGroups(
  pageNo = 0,
  pageSize = 10
): Promise<CustomPageResponse<GroupResponse>> {
  return apiFetch<CustomPageResponse<GroupResponse>>(
    `/api/v1/groups?pageNo=${pageNo}&pageSize=${pageSize}`
  );
}

export async function getAllGroups(): Promise<GroupResponse[]> {
  return apiFetch<GroupResponse[]>("/api/v1/groups/all");
}

export async function createGroup(
  body: CreateGroupRequest
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>("/api/v1/groups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateGroup(
  id: string,
  body: CreateGroupRequest
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function setGroupHead(
  groupId: string,
  memberId: string
): Promise<GroupResponse> {
  return apiFetch<GroupResponse>(`/api/v1/groups/${groupId}/${memberId}`, {
    method: "PUT",
  });
}

export async function deleteGroupsBulk(ids: string[]): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>("/api/v1/groups", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
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
  additionalInformation?: string;
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
  return apiFetch<EventResponse>(`/api/v1/events/${id}`);
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

export async function cancelEvent(id: string): Promise<OperationalResponse> {
  return apiFetch<OperationalResponse>(`/api/v1/events/${id}/cancel`, {
    method: "PATCH",
  });
}
