"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import { Bell } from "lucide-react";

type FilterTab = "all" | "unread" | "read";
type NotifType = "info" | "success" | "warning" | "alert" | "birthday" | "anniversary" | "system";

interface Notification {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  read: boolean;
  type: NotifType;
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
    description: "John Michael's birthday is tomorrow. Don't forget to send a greeting.",
    timeAgo: "2 hours ago",
    read: false,
    type: "birthday",
  },
  {
    id: "n5",
    title: "Report Generated",
    description: "Monthly attendance report for March 2026 has been generated and is ready for download.",
    timeAgo: "3 hours ago",
    read: true,
    type: "success",
  },
  {
    id: "n6",
    title: "Wedding Anniversary",
    description: "Peter & Mary Adewale's 3rd wedding anniversary is in 2 days. Prepare a congratulatory message.",
    timeAgo: "5 hours ago",
    read: true,
    type: "anniversary",
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
    title: "System Update",
    description: "A new system update is available. Review the changelog and apply at your earliest convenience.",
    timeAgo: "1 day ago",
    read: true,
    type: "system",
  },
  {
    id: "n9",
    title: "New Testimony Shared",
    description: "Blessing Okoro has shared a new testimony about divine provision. It is awaiting approval.",
    timeAgo: "1 day ago",
    read: false,
    type: "info",
  },
  {
    id: "n10",
    title: "Attendance Alert",
    description: "Sunday Service attendance dropped below the 80% threshold this week. Review the report.",
    timeAgo: "2 days ago",
    read: true,
    type: "alert",
  },
  {
    id: "n11",
    title: "Birthday Reminder",
    description: "Fatima Olatunji turns 30 today! Consider sending a special church greeting.",
    timeAgo: "2 days ago",
    read: true,
    type: "birthday",
  },
  {
    id: "n12",
    title: "New Convert Follow-up",
    description: "3 new converts from last Sunday's service have not yet been assigned a follow-up coordinator.",
    timeAgo: "3 days ago",
    read: true,
    type: "warning",
  },
];

// Config per notification type
const TYPE_CONFIG: Record<NotifType, { label: string; icon: React.ReactNode; bgColor: string; dotColor: string; badgeClass: string }> = {
  info: {
    label: "General",
    bgColor: "bg-[#DBEAFE]",
    dotColor: "bg-blue-500",
    badgeClass: "bg-blue-100 text-blue-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  success: {
    label: "Success",
    bgColor: "bg-[#DCFCE7]",
    dotColor: "bg-green-500",
    badgeClass: "bg-green-100 text-green-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  warning: {
    label: "Warning",
    bgColor: "bg-[#FEF9C3]",
    dotColor: "bg-yellow-500",
    badgeClass: "bg-yellow-100 text-yellow-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  alert: {
    label: "Alert",
    bgColor: "bg-[#FEE2E2]",
    dotColor: "bg-red-500",
    badgeClass: "bg-red-100 text-red-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  birthday: {
    label: "Birthday",
    bgColor: "bg-[#FCE7F3]",
    dotColor: "bg-pink-500",
    badgeClass: "bg-pink-100 text-pink-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  anniversary: {
    label: "Anniversary",
    bgColor: "bg-[#EDE9FE]",
    dotColor: "bg-purple-500",
    badgeClass: "bg-purple-100 text-purple-700",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  system: {
    label: "System",
    bgColor: "bg-[#F3F4F6]",
    dotColor: "bg-gray-500",
    badgeClass: "bg-gray-100 text-gray-600",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
};

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",    label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read",   label: "Read" },
];

const TYPE_FILTERS: { key: "all" | NotifType; label: string }[] = [
  { key: "all",         label: "All Types" },
  { key: "info",        label: "General" },
  { key: "success",     label: "Success" },
  { key: "warning",     label: "Warning" },
  { key: "alert",       label: "Alert" },
  { key: "birthday",    label: "Birthdays" },
  { key: "anniversary", label: "Anniversaries" },
  { key: "system",      label: "System" },
];

export default function NotificationsPage() {
  const [filterTab, setFilterTab]       = useState<FilterTab>("all");
  const [typeFilter, setTypeFilter]     = useState<"all" | NotifType>("all");
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const filteredNotifications = useMemo(() => {
    let list = notifications;
    if (filterTab === "unread") list = list.filter((n) => !n.read);
    if (filterTab === "read")   list = list.filter((n) =>  n.read);
    if (typeFilter !== "all")   list = list.filter((n) => n.type === typeFilter);
    return list;
  }, [filterTab, typeFilter, notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = () => {
    if (filterTab === "all")    setNotifications([]);
    else if (filterTab === "read")   setNotifications((prev) => prev.filter((n) => !n.read));
    else                             setNotifications((prev) => prev.filter((n) =>  n.read));
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF]">
            <Bell className="h-6 w-6 text-[#000080]" />
          </div>
          <div>
          <h1 className="text-[28px] font-bold text-[#000000]">Notifications</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {unreadCount > 0 ? (
              <span>
                You have <span className="font-semibold text-[#000080]">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}
              </span>
            ) : (
              "All notifications have been read"
            )}
          </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleMarkAllRead} disabled={unreadCount === 0}>
            <span className="hidden sm:inline">Mark All as Read</span>
            <span className="sm:hidden">Mark Read</span>
          </Button>
          <Button variant="danger" onClick={handleClearAll}>
            <span className="hidden sm:inline">Clear {filterTab === "all" ? "All" : filterTab === "read" ? "Read" : "Unread"}</span>
            <span className="sm:hidden">Clear</span>
          </Button>
        </div>
      </div>

      {/* Read / Unread tabs */}
      <div className="mb-4 flex gap-6 border-b border-[#E5E7EB]">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              filterTab === tab.key
                ? "border-b-2 border-[#000080] text-[#000080]"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#000080] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTypeFilter(t.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              typeFilter === t.key
                ? "bg-[#000080] text-white"
                : "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-sm font-medium text-[#6B7280]">No notifications here</p>
          <p className="mt-1 text-xs text-[#9CA3AF]">Check back later for updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const cfg = TYPE_CONFIG[notification.type];
            return (
              <div
                key={notification.id}
                className={`group relative flex items-start gap-4 rounded-xl border transition-all ${
                  !notification.read
                    ? "border-[#C7D2FE] bg-[#F5F7FF] shadow-sm"
                    : "border-[#E5E7EB] bg-white hover:border-[#C7D2FE]"
                }`}
              >
                {/* Unread accent bar */}
                {!notification.read && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#000080]" />
                )}

                {/* Icon */}
                <div className="flex-shrink-0 pl-5 pt-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cfg.bgColor}`}>
                    {cfg.icon}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 py-4 pr-4">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-bold ${!notification.read ? "text-[#111827]" : "text-[#374151]"}`}>
                        {notification.title}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                      {!notification.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#000080]" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{notification.timeAgo}</span>
                      {/* Action buttons — visible on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkRead(notification.id)}
                            title="Mark as read"
                            className="rounded p-1 text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#000080]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          title="Delete"
                          className="rounded p-1 text-[#6B7280] hover:bg-red-50 hover:text-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{notification.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
