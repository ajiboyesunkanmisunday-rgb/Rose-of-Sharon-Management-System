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
  gender?: string;
  dateOfBirth?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressCountry?: string;
  maritalStatus?: string;
  profilePictureUrl?: string;
  userType?: string;
  status?: string;
  groups?: GroupResponse[];
  country?: string;
  serviceAttended?: string;
  token?: string; // returned on login
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
  name: string;
  topic?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  type?: string;
  description?: string;
  capacity?: number;
  attendees?: number;
  status?: string;
  requiresRegistration?: boolean;
  newConvertsCount?: number;
  firstTimersCount?: number;
  secondTimersCount?: number;
  eMembersCount?: number;
  createdBy?: string;
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
  dateOfBirth?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  maritalStatus?: string;
  profilePictureUrl?: string;
  groupIds?: string[];
  spouseId?: string;
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
  return apiFetch<UserResponse>(`/api/v1/users/${id}`, {
    method: "POST",
  });
}

// ─── User Management — E-Members ───────────────────────────────────────────────

export interface CreateEMemberRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  countryCode: string;
  country: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  profilePictureUrl?: string;
  serviceAttended?: string;
  spouseId?: string;
  couplePictureUrl?: string;
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
  name: string;
  topic?: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  category: string;
  type?: string;
  description?: string;
  capacity?: number;
  requiresRegistration?: boolean;
  status?: string;
  newConvertsCount?: number;
  firstTimersCount?: number;
  secondTimersCount?: number;
  eMembersCount?: number;
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
  return apiFetch<EventResponse>(`/api/v1/events/${id}`, {
    method: "POST",
  });
}

export async function getEventForms(id: string): Promise<unknown> {
  return apiFetch<unknown>(`/api/v1/events/${id}/forms`);
}
