"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { communicationTemplates } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 10;

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTemplates = useMemo(() => {
    if (!search.trim()) return communicationTemplates;
    const query = search.toLowerCase();
    return communicationTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        (t.subject && t.subject.toLowerCase().includes(query)) ||
        t.type.toLowerCase().includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const getTypeBadge = (type: string) => {
    if (type === "SMS") {
      return (
        <span className="inline-flex items-center rounded-full bg-[#000080] px-2.5 py-0.5 text-xs font-medium text-white">
          SMS
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-[#B5B5F3] px-2.5 py-0.5 text-xs font-medium text-[#000080]">
        Email
      </span>
    );
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Communication</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Templates</h2>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search..."
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => router.push("/communication/templates/add")}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Add Template
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Name</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Created By</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Last Modified</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedTemplates.map((template) => (
              <tr
                key={template.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {template.name}
                </td>
                <td className="px-4 py-3">{getTypeBadge(template.type)}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {template.subject || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {template.createdBy}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {template.lastModified}
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "Edit",
                        onClick: () => {
                          console.log("Edit template:", template.id);
                        },
                      },
                      {
                        label: "Duplicate",
                        onClick: () => {
                          console.log("Duplicate template:", template.id);
                        },
                      },
                      {
                        label: "Delete",
                        onClick: () => {
                          console.log("Delete template:", template.id);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedTemplates.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
}
