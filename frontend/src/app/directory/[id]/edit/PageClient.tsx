"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  getUser,
  updateMember,
  updateEMember,
  updateFirstTimer,
  updateSecondTimer,
  type UserResponse,
} from "@/lib/api";

export default function EditContactClient() {
  const router = useRouter();
  const params = useParams();
  const paramId = params.id as string;
  const [id, setId] = useState(paramId);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const parts = window.location.pathname.replace(/\/$/, "").split("/");
      const urlId = parts[parts.length - 2] ?? "";
      if (urlId && urlId !== id) setId(urlId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [user,    setUser]    = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const [formData, setFormData] = useState({
    firstName:   "",
    middleName:  "",
    lastName:    "",
    phoneNumber: "",
    countryCode: "",
    email:       "",
    occupation:  "",
    street:      "",
    city:        "",
    state:       "",
    country:     "",
  });

  useEffect(() => {
    if (!id || id.startsWith("dir-")) { setLoading(false); return; }
    async function load() {
      try {
        const u = await getUser(id);
        setUser(u);
        setFormData({
          firstName:   u.firstName   ?? "",
          middleName:  u.middleName  ?? "",
          lastName:    u.lastName    ?? "",
          phoneNumber: u.phoneNumber ?? "",
          countryCode: u.countryCode ?? "",
          email:       u.email       ?? "",
          occupation:  u.occupation  ?? "",
          street:      u.street      ?? "",
          city:        u.city        ?? "",
          state:       u.state       ?? "",
          country:     u.country     ?? "",
        });
      } catch {
        setError("Failed to load contact.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    const payload = {
      firstName:   formData.firstName,
      middleName:  formData.middleName || undefined,
      lastName:    formData.lastName,
      phoneNumber: formData.phoneNumber,
      countryCode: formData.countryCode,
      email:       formData.email,
      occupation:  formData.occupation || undefined,
      street:      formData.street     || undefined,
      city:        formData.city       || undefined,
      state:       formData.state      || undefined,
      country:     formData.country    || undefined,
    };
    try {
      const userType = (user.userType ?? "").toUpperCase();
      if (userType === "E_MEMBER" || userType === "E-MEMBER") {
        await updateEMember(id, payload);
      } else if (userType === "FIRST_TIMER" || userType === "FIRST-TIMER") {
        await updateFirstTimer(id, payload);
      } else if (userType === "SECOND_TIMER" || userType === "SECOND-TIMER") {
        await updateSecondTimer(id, payload);
      } else {
        await updateMember(id, payload);
      }
      router.push(`/directory/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Church Directory"
        subtitle="Edit Contact"
        backHref={`/directory/${id}`}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-sm text-gray-400">
          Loading contact…
        </div>
      ) : (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
              <FormField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Middle Name"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
              <FormField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
              <FormField
                label="Occupation"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              />
              <FormField
                label="Country Code"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                placeholder="+234"
              />
              <FormField
                label="Phone Number"
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
              <FormField
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <FormField
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
              <FormField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
              <FormField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
              <FormField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="secondary" type="button" onClick={() => router.push(`/directory/${id}`)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}
