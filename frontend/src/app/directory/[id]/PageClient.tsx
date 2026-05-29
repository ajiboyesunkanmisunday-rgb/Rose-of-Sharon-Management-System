"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { getUser, type UserResponse } from "@/lib/api";

function fullName(u: UserResponse) {
  return [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtDate(s?: any): string {
  if (!s) return "—";
  if (Array.isArray(s)) {
    const [year, month, day] = s as number[];
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const d = new Date(s as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtAddress(u: UserResponse) {
  const parts = [u.street, u.city, u.state, u.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

export default function DirectoryDetailClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 1] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [contact, setContact] = useState<UserResponse | null>(null);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState("");

  useEffect(() => {
    if (!id || id.startsWith("dir-")) { setLoading(false); return; }

    // Immediately show data from the directory listing cache (sessionStorage)
    // so the profile never displays a blank page while the API loads.
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem(`dir_person_${id}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.firstName || parsed?.email) {
            setContact(parsed as UserResponse);
            setLoading(false);
          }
        }
      } catch {}
    }

    setLoading(true);
    async function load() {
      try {
        const u = await getUser(id);
        // Only replace the cached version if the API returned real data
        if (u?.firstName || u?.email || u?.id) {
          setContact(u);
          if (typeof window !== "undefined") {
            try { sessionStorage.setItem(`dir_person_${id}`, JSON.stringify(u)); } catch {}
          }
        }
      } catch {
        // If API fails but we already have cached data, silently keep it
        setContact((prev) => {
          if (!prev?.firstName && !prev?.email) setError("Failed to load contact.");
          return prev;
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const groupNames = contact?.groups?.map((g) => g.name).join(", ") || "—";

  const details = contact ? [
    { label: "Full Name",       value: fullName(contact) },
    { label: "Member Type",     value: contact.userType?.replace(/_/g, " ") || "—" },
    { label: "Groups",          value: groupNames },
    { label: "Phone",           value: [contact.countryCode, contact.phoneNumber].filter(Boolean).join(" ") || "—" },
    { label: "Email",           value: contact.email || "—" },
    { label: "Gender",          value: contact.sex || "—" },
    { label: "Marital Status",  value: contact.maritalStatus?.replace(/_/g, " ") || "—" },
    { label: "Occupation",      value: contact.occupation || "—" },
    { label: "Address",         value: fmtAddress(contact) },
    { label: "Joined Date",     value: fmtDate(contact.createdOn) },
  ] : [];

  return (
    <DashboardLayout>
      <PageHeader
        title="Church Directory"
        subtitle="Contact Profile"
        backHref="/directory"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-gray-400 dark:text-slate-500">
          Loading contact…
        </div>
      ) : !contact ? (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-10 text-center text-sm text-gray-400 dark:text-slate-500">
          Contact not found.
        </div>
      ) : (
        <>
          <div className="mb-6 rounded-xl border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {contact.profilePictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={contact.profilePictureUrl}
                  alt={fullName(contact)}
                  className="h-[120px] w-[120px] rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl bg-[#E5E7EB] dark:bg-slate-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}

              <div className="flex-1">
                <h2 className="text-xl font-bold text-[#111827] dark:text-slate-100">{fullName(contact)}</h2>
                <p className="mt-1 text-sm text-[#6B7280] dark:text-slate-400">{contact.userType?.replace(/_/g, " ") || ""}</p>
                {contact.groups && contact.groups.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {contact.groups.map((g) => (
                      <span key={g.id} className="inline-block rounded-full bg-[#B5B5F3]/30 px-3 py-1 text-xs font-medium text-[#000080] dark:text-indigo-400">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#F3F4F6] pt-6 md:grid-cols-2">
              {details.map((d) => (
                <div key={d.label}>
                  <p className="text-xs font-medium text-[#6B7280] dark:text-slate-400">{d.label}</p>
                  <p className="mt-1 text-sm font-medium text-[#111827] dark:text-slate-100">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => router.push("/directory")}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push(`/directory/${id}/edit`)}
            >
              Edit
            </Button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
