"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Heart,
  Calendar,
  Shield,
  Camera,
  KeyRound,
  Save,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import PhoneInput from "@/components/ui/PhoneInput";
import PhotoUpload from "@/components/ui/PhotoUpload";
import {
  getStoredUser,
  getUser,
  updateMember,
  updateEMember,
  updateFirstTimer,
  updateSecondTimer,
  uploadProfilePicture,
  changePassword,
  type UserResponse,
} from "@/lib/api";

const ROLE_LABELS: Record<string, string> = {
  MEMBER:       "Member",
  E_MEMBER:     "E-Member",
  "E-MEMBER":   "E-Member",
  FIRST_TIMER:  "First Timer",
  SECOND_TIMER: "Second Timer",
  NEW_CONVERT:  "New Convert",
  ADMIN:        "Admin",
};

const inputStyles =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none placeholder:text-[#9CA3AF] focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";
const selectStyles =
  "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10";
const labelStyles = "mb-1 block text-sm font-medium text-[#374151]";

export default function ProfilePage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [userId,  setUserId]  = useState("");
  const [userType, setUserType] = useState("");
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Edit form fields
  const [firstName,     setFirstName]     = useState("");
  const [middleName,    setMiddleName]    = useState("");
  const [lastName,      setLastName]      = useState("");
  const [email,         setEmail]         = useState("");
  const [countryCode,   setCountryCode]   = useState("+234");
  const [phone,         setPhone]         = useState("");
  const [occupation,    setOccupation]    = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [photo,         setPhoto]         = useState<File | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [saveMsg,       setSaveMsg]       = useState("");

  // Password change
  const [showPwChange,   setShowPwChange]   = useState(false);
  const [oldPassword,    setOldPassword]    = useState("");
  const [newPassword,    setNewPassword]    = useState("");
  const [confirmPw,      setConfirmPw]      = useState("");
  const [pwSaving,       setPwSaving]       = useState(false);
  const [pwMsg,          setPwMsg]          = useState("");

  // ── Load ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    const stored = getStoredUser();
    if (!stored?.id) {
      router.replace("/login");
      return;
    }
    setUserId(stored.id);
    setUserType((stored.userType ?? "").toUpperCase());

    // If ID looks like a mock seed, skip API call
    if (stored.id.startsWith("mock-") || stored.id.startsWith("session_")) {
      setFirstName(stored.firstName ?? "");
      setLastName(stored.lastName ?? "");
      setEmail(stored.email ?? "");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getUser(stored.id);
      setProfile(data);
      setFirstName(data.firstName ?? "");
      setMiddleName(data.middleName ?? "");
      setLastName(data.lastName ?? "");
      setEmail(data.email ?? "");
      setCountryCode(data.countryCode ? `+${data.countryCode}` : "+234");
      setPhone(data.phoneNumber ?? "");
      setOccupation(data.occupation ?? "");
      setMaritalStatus(data.maritalStatus ?? "");
    } catch {
      // Fall back to stored data if API fails
      setFirstName(stored.firstName ?? "");
      setLastName(stored.lastName ?? "");
      setEmail(stored.email ?? "");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      let profilePictureUrl: string | undefined;
      if (photo) profilePictureUrl = await uploadProfilePicture(photo);

      const rawCode = countryCode.replace("+", "");
      const payload = {
        firstName:    firstName  || undefined,
        middleName:   middleName || undefined,
        lastName:     lastName   || undefined,
        email:        email      || undefined,
        countryCode:  rawCode    || undefined,
        phoneNumber:  phone      || undefined,
        occupation:   occupation || undefined,
        maritalStatus: maritalStatus || undefined,
        profilePictureUrl,
      };

      if (userType === "E_MEMBER" || userType === "E-MEMBER") {
        await updateEMember(userId, payload);
      } else if (userType === "FIRST_TIMER") {
        await updateFirstTimer(userId, payload);
      } else if (userType === "SECOND_TIMER") {
        await updateSecondTimer(userId, payload);
      } else {
        await updateMember(userId, payload);
      }

      setSaveMsg("Profile updated successfully.");
      setPhoto(null);
      setTimeout(() => setSaveMsg(""), 4000);
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg("");
    if (newPassword !== confirmPw) {
      setPwMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg("Password must be at least 8 characters.");
      return;
    }
    setPwSaving(true);
    try {
      await changePassword({ oldPassword, newPassword, confirmPassword: confirmPw });
      setPwMsg("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPw("");
      setTimeout(() => { setPwMsg(""); setShowPwChange(false); }, 3000);
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "—";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
  const roleLabel = ROLE_LABELS[userType] ?? userType ?? "User";
  const groups = profile?.groups ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-gray-400">
          Loading profile…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF]">
          <User className="h-6 w-6 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-[#000000]">My Profile</h1>
          <p className="text-sm text-[#6B7280]">View and update your personal information</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} — <button className="font-medium underline" onClick={load}>Retry</button>
        </div>
      )}

      {/* Profile Hero Card */}
      <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Avatar */}
          <div className="relative shrink-0">
            {profile?.profilePictureUrl ? (
              <img
                src={profile.profilePictureUrl}
                alt={displayName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-[#E5E7EB]"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#B5B5F3] ring-4 ring-[#E5E7EB]">
                <span className="text-2xl font-bold text-[#000080]">{initials}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#000080] text-white shadow">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Name / role / meta */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[#111827]">{displayName}</h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">{email}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                <Shield className="h-3 w-3" />
                {roleLabel}
              </span>
              {groups.map((g) => (
                <span
                  key={g.id}
                  className="rounded-full bg-[#F0FDF4] px-3 py-1 text-xs font-medium text-[#16A34A]"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden shrink-0 flex-col items-end gap-1 text-right sm:flex">
            {profile?.createdOn && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Calendar className="h-3.5 w-3.5" />
                Joined {new Date(profile.createdOn).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            )}
            {phone && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Phone className="h-3.5 w-3.5" />
                {countryCode} {phone}
              </span>
            )}
            {occupation && (
              <span className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Briefcase className="h-3.5 w-3.5" />
                {occupation}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave}>
        <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-5 text-base font-bold text-[#111827]">Personal Information</h3>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
            <div>
              <label className={labelStyles}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name (optional)"
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>Email Address</label>
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#9CA3AF]">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{email || "—"}</span>
              </div>
              <p className="mt-1 text-xs text-[#9CA3AF]">Email cannot be changed here</p>
            </div>
            <PhoneInput
              label="Phone Number"
              code={countryCode}
              number={phone}
              onCodeChange={setCountryCode}
              onNumberChange={setPhone}
              placeholder="Enter phone number"
            />
            <div>
              <label className={labelStyles}>Occupation</label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Your occupation"
                  className={`${inputStyles} pl-10`}
                />
              </div>
            </div>
            <div>
              <label className={labelStyles}>Marital Status</label>
              <div className="relative">
                <Heart className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className={`${selectStyles} pl-10`}
                >
                  <option value="">Select marital status</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
            </div>

            {/* Address read-only summary */}
            {(profile?.street || profile?.city || profile?.state) && (
              <div className="md:col-span-2">
                <label className={labelStyles}>Address</label>
                <div className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151]">
                  <MapPin className="h-4 w-4 shrink-0 text-[#9CA3AF]" />
                  <span>
                    {[profile.street, profile.city, profile.state, profile.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Photo */}
          <div className="mt-6">
            <PhotoUpload
              label="Profile Photo"
              value={photo}
              onChange={setPhoto}
              previewSize="md"
            />
          </div>
        </div>

        {saveMsg && (
          <div
            className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
              saveMsg.includes("success")
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {saveMsg}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            icon={<Save className="h-4 w-4" />}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Change Password Section */}
      <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FEF3C7]">
              <KeyRound className="h-5 w-5 text-[#D97706]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Password</h3>
              <p className="text-xs text-[#6B7280]">Update your account password</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => { setShowPwChange((s) => !s); setPwMsg(""); }}
          >
            {showPwChange ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPwChange && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">
            <div>
              <label className={labelStyles}>Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className={inputStyles}
              />
            </div>
            <div>
              <label className={labelStyles}>New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className={inputStyles}
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Must contain a lowercase letter, uppercase letter, number, special character and at least 8 characters.
              </p>
            </div>
            <div>
              <label className={labelStyles}>Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Re-enter new password"
                className={inputStyles}
              />
            </div>

            {pwMsg && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  pwMsg.includes("success")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {pwMsg}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={pwSaving}>
                {pwSaving ? "Changing…" : "Update Password"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
