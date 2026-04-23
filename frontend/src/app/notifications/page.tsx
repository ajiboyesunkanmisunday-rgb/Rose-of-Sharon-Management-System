"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";

type Tab = "all" | "unread" | "read";

interface Notification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: "info" | "success" | "warning" | "alert";
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "New Member Registered",
    description: "Grace Adeyemi has completed the membership registration form and is awaiting approval.",
    timeAgo: "2 minutes ago",
    read: false,
    type: "info",
  },
  {
    id: "n2",
    title: "Follow-up Overdue",
    description: "Follow-up for David Okonkwo is overdue by 3 days. Please take action.",
    timeAgo: "15 minutes ago",
    read: false,
    type: "warning",
  },
  {
    id: "n3",
    title: "Prayer Request Submitted",
    description: "A new prayer request has been submitted by Sarah Bamidele regarding family healing.",
    timeAgo: "1 hour ago",
    read: false,
    type: "info",
  },
  {
    id: "n4",
    title: "Birthday Reminder",
    description: "John Michael's birthday is tomorrow. Send a greeting message.",
    timeAgo: "2 hours ago",
    read: false,
    type: "alert",
  },
  {
    id: "n5",
    title: "Report Generated Successfully",
    description: "Monthly attendance report for March 2026 has been generated and is ready for download.",
    timeAgo: "3 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "n6",
    title: "Anniversary Reminder",
    description: "Peter & Mary Adewale's 3rd wedding anniversary is in 2 days.",
    timeAgo: "5 hours ago",
    read: true,
    type: "alert",
  },
  {
    id: "n7",
    title: "Counseling Session Scheduled",
    description: "A counseling session with Emmanuel Nwosu has been scheduled for April 18, 2026.",
    timeAgo: "8 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "n8",
    title: "System Update Available",
    description: "A new system update is available. Please review the changelog and apply the update.",
    timeAgo: "1 day ago",
    read: true,
    type: "warning",
  },
  {
    id: "n9",
    title: "New Testimony Shared",
    description: "Blessing Okoro has shared a new testimony about divine provision.",
    timeAgo: "1 day ago",
    read: false,
    type: "info",
  },
  {
    id: "n10",
    title: "Attendance Alert",
    description: "Sunday Service attendance dropped below 80% threshold this week.",
    timeAgo: "2 days ago",
    read: true,
    type: "alert",
  },
];

const typeColors: Record<Notification["type"], string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  alert: "bg-red-500",
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    if (activeTab === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [activeTab, notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (activeTab === "all") {
      setNotifications([]);
    } else if (activeTab === "read") {
      setNotifications((prev) => prev.filter((n) => !n.read));
    } else {
      setNotifications((prev) => prev.filter((n) => n.read));
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[28px] font-bold text-[#000000]">Notifications</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleMarkAllRead}>
            <span className="hidden sm:inline">Mark All Read</span>
            <span className="sm:hidden">Mark Read</span>
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-6 border-b border-[#E5E7EB]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="flex flex-col gap-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors ${
              !notification.read ? "bg-[#F8F9FF]" : ""
            }`}
          >
            {/* Icon */}
            <div className="flex shrink-0 items-center gap-3">
              <div
                className={`h-10 w-10 rounded-full ${typeColors[notification.type]} flex items-center justify-center`}
              >
                {notification.type === "info" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                )}
                {notification.type === "success" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {notification.type === "warning" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
                {notification.type === "alert" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#111827]">{notification.title}</p>
                  {!notification.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#000080]" />
                  )}
                </div>
                <button
                  onClick={() => handleDelete(notification.id)}
                  className="text-red-500 transition-colors hover:text-red-700"
                  aria-label="Delete notification"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
              <p className="mt-1 text-sm text-[#6B7280]">{notification.description}</p>
              <p className="mt-2 text-xs text-[#9CA3AF]">{notification.timeAgo}</p>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No notifications found.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
