"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField, SelectField } from "@/components/ui/FormField";

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

export default function AddContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    group: "",
    phone: "",
    email: "",
    address: "",
    department: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add contact:", formData);
    router.push("/directory");
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Church Directory"
        subtitle="New Contact"
        backHref="/directory"
      />

      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
            <FormField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
            <FormField
              label="Role / Title"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g. Deacon, Usher"
              required
            />
            <SelectField
              label="Group"
              name="group"
              value={formData.group}
              onChange={handleChange}
              options={GROUP_OPTIONS}
              required
            />
            <FormField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
            />
            <FormField
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              required
            />
            <FormField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
            <FormField
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, city, state"
              className="md:col-span-2"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => router.push("/directory")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Contact
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
