"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import SearchBar from "@/components/ui/SearchBar";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import ActionDropdown from "@/components/ui/ActionDropdown";
import Modal from "@/components/ui/Modal";

interface Group {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  leader: string;
}

const mockGroups: Group[] = [
  {
    id: "1",
    name: "Choir",
    description: "Music and worship ministry",
    membersCount: 25,
    leader: "Sister Grace Adeyemi",
  },
  {
    id: "2",
    name: "Ushering",
    description: "Welcoming and seating coordination",
    membersCount: 18,
    leader: "Brother James Okafor",
  },
  {
    id: "3",
    name: "Technical/Media",
    description: "Sound, lighting, and media operations",
    membersCount: 12,
    leader: "Brother David Nwosu",
  },
  {
    id: "4",
    name: "Protocol",
    description: "Church protocol and event management",
    membersCount: 15,
    leader: "Sister Funke Balogun",
  },
  {
    id: "5",
    name: "Children's Church",
    description: "Children ministry and Sunday school",
    membersCount: 20,
    leader: "Sister Mary Eze",
  },
  {
    id: "6",
    name: "Youth Fellowship",
    description: "Youth engagement and discipleship",
    membersCount: 35,
    leader: "Brother Samuel Adebayo",
  },
  {
    id: "7",
    name: "Prayer Warriors",
    description: "Intercessory prayer and prayer meetings",
    membersCount: 22,
    leader: "Deaconess Ruth Obi",
  },
  {
    id: "8",
    name: "Evangelism",
    description: "Outreach and soul-winning activities",
    membersCount: 16,
    leader: "Brother Emmanuel Chukwu",
  },
];

const mockLeaders = [
  "Sister Grace Adeyemi",
  "Brother James Okafor",
  "Brother David Nwosu",
  "Sister Funke Balogun",
  "Sister Mary Eze",
  "Brother Samuel Adebayo",
  "Deaconess Ruth Obi",
  "Brother Emmanuel Chukwu",
];

const ITEMS_PER_PAGE = 10;

export default function GroupsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    leader: "",
  });

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return mockGroups;
    const query = search.toLowerCase();
    return mockGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.leader.toLowerCase().includes(query)
    );
  }, [search]);

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleAddGroup = () => {
    console.log("Adding group:", newGroup);
    setShowAddModal(false);
    setNewGroup({ name: "", description: "", leader: "" });
  };

  const inputClass =
    "w-full rounded-lg border border-[#E5E7EB] px-4 py-3 text-sm text-[#374151] outline-none transition-colors focus:border-[#000080] focus:ring-1 focus:ring-[#000080]";

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-[#000000]">Settings</h1>
        <h2 className="text-[22px] font-bold text-[#000080]">Groups</h2>
      </div>

      {/* Top bar: search + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            onSearch={handleSearch}
            placeholder="Search groups..."
          />
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
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
          Add Group
        </Button>
      </div>

      {/* Groups Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Group Name
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Description
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Members
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Leader
              </th>
              <th className="px-4 py-4 text-sm font-bold text-[#000080]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.map((group) => (
              <tr
                key={group.id}
                className="border-b border-[#F3F4F6] transition-colors hover:bg-gray-50"
                style={{ height: "56px" }}
              >
                <td className="px-4 py-3 text-sm font-medium text-[#374151]">
                  {group.name}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {group.description}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {group.membersCount}
                </td>
                <td className="px-4 py-3 text-sm text-[#374151]">
                  {group.leader}
                </td>
                <td className="px-4 py-3">
                  <ActionDropdown
                    actions={[
                      {
                        label: "View Members",
                        onClick: () => router.push(`/settings/groups/${group.id}`),
                      },
                      {
                        label: "Edit",
                        onClick: () => router.push(`/settings/groups/${group.id}/edit`),
                      },
                      {
                        label: "Delete",
                        onClick: () => console.log("Delete group:", group.id),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {paginatedGroups.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No groups found.
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
          totalItems={filteredGroups.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Group Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewGroup({ name: "", description: "", leader: "" });
        }}
        title="Add Group"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Group Name
            </label>
            <input
              type="text"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
              placeholder="Enter group name"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Description
            </label>
            <textarea
              value={newGroup.description}
              onChange={(e) =>
                setNewGroup({ ...newGroup, description: e.target.value })
              }
              placeholder="Enter group description"
              rows={3}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">
              Leader
            </label>
            <select
              value={newGroup.leader}
              onChange={(e) =>
                setNewGroup({ ...newGroup, leader: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Select a leader</option>
              {mockLeaders.map((leader) => (
                <option key={leader} value={leader}>
                  {leader}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddModal(false);
                setNewGroup({ name: "", description: "", leader: "" });
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddGroup}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
