"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

const COUNTRIES = [
  "Ghana",
  "Nigeria",
  "Kenya",
  "Uganda",
  "South Africa",
  "Egypt",
  "Tanzania",
  "Ethiopia",
  "Rwanda",
  "Cameroon",
  "Morocco",
  "Algeria",
  "Sudan",
  "Angola",
  "Mali",
  "Burkina Faso",
  "Côte d'Ivoire",
  "Senegal",
  "Liberia",
  "Sierra Leone",
  "Guinea",
  "Benin",
  "Togo",
  "Niger",
  "Chad",
  "Zambia",
  "Zimbabwe",
  "Malawi",
  "Mozambique",
  "Botswana",
  "Lesotho",
  "Eswatini",
  "Mauritius",
  "Madagascar",
  "Seychelles",
  "Comoros",
];

export default function AddEMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    country: "Ghana",
    phone: "",
    email: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Add E-Member:", formData);
    router.push("/user-management/e-members");
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">
          User Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/user-management/e-members")}
            className="flex items-center text-[#000080] transition-colors hover:text-[#000066]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-[22px] font-bold text-[#000080]">
            Add E-Member
          </h2>
        </div>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
        <form onSubmit={handleSubmit}>
          {/* Form Grid */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {/* First Name */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
              >
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#6B7280]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="mt-2 w-full rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm focus:border-[#000080] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                required
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push("/user-management/e-members")}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add E-Member
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
