"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import { messages } from "@/lib/mock-data";

const ITEMS_PER_PAGE = 10;

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const query = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.recipient.toLowerCase().includes(query) ||
        m.content.toLowerCase().includes(query) ||
        (m.subject && m.subject.toLowerCase().includes(query)) ||
        m.type.toLowerCase().includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedRows);
      paginatedMessages.forEach((m) => newSelected.add(m.id));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      paginatedMessages.forEach((m) => newSelected.delete(m.id));
      setSelectedRows(newSelected);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const allPageSelected =
    paginatedMessages.length > 0 &&
    paginatedMessages.every((m) => selectedRows.has(m.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Delivered
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            Pending
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Failed
          </span>
        );
      default:
        return null;
    }
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
        <h2 className="text-[22px] font-bold text-[#000080]">Messages</h2>
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
            onClick={() => {}}
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
            New Message
          </Button>

          <Button
            onClick={() => {}}
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          >
            Filter &amp; Export
          </Button>
        </div>
      </div>

      {/* Selected count indicator */}
      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} message{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                />
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Type</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Recipient</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Subject</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Status</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Sent By</th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Date</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedMessages.map((message) => (
              <tr
                key={message.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(message.id)}
                    onChange={() => handleSelectRow(message.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3">{getTypeBadge(message.type)}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {message.recipient}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {message.subject || "—"}
                </td>
                <td className="px-4 py-3">{getStatusBadge(message.status)}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {message.sentBy}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {message.date}
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View",
                        onClick: () => {
                          console.log("View message:", message.id);
                        },
                      },
                      {
                        label: "Resend",
                        onClick: () => {
                          console.log("Resend message:", message.id);
                        },
                      },
                      {
                        label: "Delete",
                        onClick: () => {
                          console.log("Delete message:", message.id);
                        },
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedMessages.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No messages found.
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
