"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";
import { directoryContacts } from "@/lib/mock-data";

const GROUP_OPTIONS = [
  { label: "Pastoral", value: "Pastoral" },
  { label: "Deacons", value: "Deacons" },
  { label: "Music", value: "Music" },
  { label: "Youth", value: "Youth" },
  { label: "Children", value: "Children" },
  { label: "Ushering", value: "Ushering" },
  { label: "Women", value: "Women" },
  { label: "Men", value: "Men" },
  { label: "Media", value: "Media" },
  { label: "Welfare", value: "Welfare" },
];

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

  const existing = directoryContacts.find((c) => c.id === id) || directoryContacts[0];

  const [formData, setFormData] = useState({
    name: existing.name,
    role: existing.role,
    group: existing.group,
    phone: existing.phone,
    email: existing.email,
    address: existing.address || "",
    department: existing.department || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Update contact:", id, formData);
    router.push(`/directory/${id}`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Church Directory"
        subtitle="Edit Contact"
        backHref={`/directory/${id}`}
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <FormField label="Role / Title" name="role" value={formData.role} onChange={handleChange} required />
            <SelectField label="Group" name="group" value={formData.group} onChange={handleChange} options={GROUP_OPTIONS} required />
            <FormField label="Department" name="department" value={formData.department} onChange={handleChange} />
            <FormField label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            <FormField label="Email" type="email" name="email" value={formData.email} onChange={handleChange} required />
            <FormField label="Address" name="address" value={formData.address} onChange={handleChange} className="md:col-span-2" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => router.push(`/directory/${id}`)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
