"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import Modal from "@/components/ui/Modal";
import { messages as messagesData } from "@/lib/mock-data";
import { Message } from "@/lib/types";

const ITEMS_PER_PAGE = 10;
type MessageTab = "Sent" | "Scheduled";

export default function MessagesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<MessageTab>("Sent");
  const [list, setList] = useState<Message[]>(messagesData);
  const [viewing, setViewing] = useState<Message | null>(null);

  const filteredMessages = useMemo(() => {
    let result = list;
    if (activeTab === "Sent") {
      result = result.filter((m) => m.status === "Sent" || m.status === "Failed");
    } else {
      result = result.filter((m) => m.status === "Scheduled");
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.recipient.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          (m.subject && m.subject.toLowerCase().includes(q)) ||
          m.type.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, activeTab, list]);

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedRows);
    paginatedMessages.forEach((m) => (checked ? newSelected.add(m.id) : newSelected.delete(m.id)));
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedRows(newSelected);
  };

  const allPageSelected =
    paginatedMessages.length > 0 && paginatedMessages.every((m) => selectedRows.has(m.id));

  const handleTerminate = (id: string) => {
    console.log("Terminate scheduled message:", id);
    setList((prev) => prev.filter((m) => m.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Sent: "bg-green-100 text-green-800",
      Scheduled: "bg-blue-100 text-blue-800",
      Failed: "bg-red-100 text-red-800",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) =>
    type === "SMS" ? (
      <span className="inline-flex items-center rounded-full bg-[#000080] px-2.5 py-0.5 text-xs font-medium text-white">SMS</span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-[#B5B5F3] px-2.5 py-0.5 text-xs font-medium text-[#000080]">Email</span>
    );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Communication</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Messages</h2>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-6 border-b border-[#E5E7EB]">
        {(["Sent", "Scheduled"] as MessageTab[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setActiveTab(t);
              setCurrentPage(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === t ? "border-b-2 border-[#000080] text-[#000080]" : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} onSearch={() => setCurrentPage(1)} placeholder="Search..." />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => router.push("/communication/messages/compose")}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            }
          >
            Filter &amp; Export
          </Button>
        </div>
      </div>

      {selectedRows.size > 0 && (
        <div className="mb-2 text-sm text-gray-500">
          {selectedRows.size} message{selectedRows.size > 1 ? "s" : ""} selected
        </div>
      )}

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
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">Time</th>
              <th className="px-4 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {paginatedMessages.map((message) => (
              <tr key={message.id} className="border-b border-[#F3F4F6] hover:bg-gray-50" style={{ height: "56px" }}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(message.id)}
                    onChange={() => handleSelectRow(message.id)}
                    className="h-[18px] w-[18px] rounded-sm border-2 border-[#D1D5DB] text-[#000080] focus:ring-[#000080]"
                  />
                </td>
                <td className="px-4 py-3">{getTypeBadge(message.type)}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{message.recipient}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{message.subject || "—"}</td>
                <td className="px-4 py-3">{getStatusBadge(message.status)}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{message.sentBy}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{message.date}</td>
                <td className="px-4 py-3 text-sm text-[#374151]">{message.time || "—"}</td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={
                      activeTab === "Scheduled"
                        ? [
                            { label: "View", onClick: () => setViewing(message) },
                            { label: "Terminate", onClick: () => handleTerminate(message.id) },
                          ]
                        : [
                            { label: "View", onClick: () => setViewing(message) },
                            { label: "Resend", onClick: () => console.log("Resend message:", message.id) },
                          ]
                    }
                  />
                </td>
              </tr>
            ))}
            {paginatedMessages.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No messages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={viewing !== null} onClose={() => setViewing(null)} title="Message Details" size="md">
        {viewing && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              {getTypeBadge(viewing.type)}
              {getStatusBadge(viewing.status)}
            </div>
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Recipient</p>
              <p className="text-[#374151]">{viewing.recipient}</p>
            </div>
            {viewing.subject && (
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Subject</p>
                <p className="text-[#374151]">{viewing.subject}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-[#6B7280]">Content</p>
              <p className="whitespace-pre-wrap text-[#374151]">{viewing.content}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Sent By</p>
                <p className="text-[#374151]">{viewing.sentBy}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7280]">Date / Time</p>
                <p className="text-[#374151]">
                  {viewing.date}
                  {viewing.time ? ` • ${viewing.time}` : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
