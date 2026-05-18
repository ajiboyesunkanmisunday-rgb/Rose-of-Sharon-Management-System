"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { 
  searchEvents, 
  searchAllMembers, 
  uploadCalendar, 
  UploadCalendarRequest,
  EventResponse,
  UserResponse
} from "@/lib/api";
import { Search, Check, X, Calendar, User, Clock, Video } from "lucide-react";

export default function AddMinisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [selectedPreacher, setSelectedPreacher] = useState<UserResponse | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    preacherTitle: "Pastor",
    category: "SPECIAL_SERVICE",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "11:00",
    virtualMeetingLink: ""
  });

  // Search states
  const [eventQuery, setEventQuery] = useState("");
  const [eventResults, setEventResults] = useState<EventResponse[]>([]);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  
  const [preacherQuery, setPreacherQuery] = useState("");
  const [preacherResults, setPreacherResults] = useState<UserResponse[]>([]);
  const [showPreacherDropdown, setShowPreacherDropdown] = useState(false);

  // Refs
  const eventRef = useRef<HTMLDivElement>(null);
  const preacherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (eventRef.current && !eventRef.current.contains(e.target as Node)) setShowEventDropdown(false);
      if (preacherRef.current && !preacherRef.current.contains(e.target as Node)) setShowPreacherDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Async searches
  useEffect(() => {
    if (!eventQuery.trim() || selectedEvent) return;
    const timer = setTimeout(async () => {
      try {
        const res = await searchEvents(eventQuery, 0, 5);
        setEventResults(res.content);
        setShowEventDropdown(true);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [eventQuery, selectedEvent]);

  useEffect(() => {
    if (!preacherQuery.trim() || selectedPreacher) return;
    const timer = setTimeout(async () => {
      try {
        const res = await searchAllMembers(preacherQuery, 0, 5);
        setPreacherResults(res.content);
        setShowPreacherDropdown(true);
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [preacherQuery, selectedPreacher]);

  const timeToTimestamp = (time: string, dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = time.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm).getTime();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isNewEvent && !selectedEvent) {
      setError("Please select an existing event or toggle 'New Event'.");
      setLoading(false);
      return;
    }
    if (!selectedPreacher) {
      setError("Please search and select a preacher.");
      setLoading(false);
      return;
    }

    const targetDate = formData.date;

    const payload: UploadCalendarRequest = {
      eventId: isNewEvent ? undefined : selectedEvent?.id,
      title: isNewEvent ? formData.title : selectedEvent?.title,
      preacherTitle: formData.preacherTitle,
      preacherEmail: selectedPreacher.email,
      category: formData.category, // Use selected category
      date: targetDate,
      startTime: timeToTimestamp(formData.startTime, targetDate),
      endTime: timeToTimestamp(formData.endTime, targetDate),
      virtualMeetingLink: "",
      // Default empty values as requested
      country: "Nigeria",
      additionalInformation: "",
      locationType: "VIRTUAL",
      topic: "",
      street: "",
      city: "",
      state: ""
    };

    try {
      await uploadCalendar([payload]);
      router.push("/calendar/ministers");
    } catch (err: any) {
      setError(err.message || "Failed to add minister.");
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader title="Add Minister" subtitle="Assign a minister to an event" backHref="/calendar/ministers" />

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Event Selection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#000080] flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Event Details
              </h3>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={isNewEvent}
                  onChange={(e) => setIsNewEvent(e.target.checked)}
                  className="rounded border-[#E5E7EB] text-[#000080] focus:ring-[#000080]"
                />
                <span className="text-xs font-medium text-[#374151] group-hover:text-[#000080]">New Event?</span>
              </label>
            </div>

            {isNewEvent ? (
              <FormField 
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                required
                placeholder="e.g. Thanksgiving Service"
              />
            ) : (
              <div className="relative" ref={eventRef}>
                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Search Existing Event</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input 
                    type="text"
                    value={selectedEvent ? selectedEvent.title : eventQuery}
                    onChange={(e) => {
                      if (selectedEvent) { setSelectedEvent(null); setEventQuery(""); }
                      else setEventQuery(e.target.value);
                    }}
                    placeholder="Search by title..."
                    className={`w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border rounded-xl text-sm text-[#374151] focus:outline-none ${selectedEvent ? 'border-green-500 bg-green-50' : 'border-[#E5E7EB]'}`}
                  />
                  {selectedEvent && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <Check className="w-4 h-4 text-green-500" />
                      <X className="w-4 h-4 text-[#9CA3AF] cursor-pointer" onClick={() => setSelectedEvent(null)} />
                    </div>
                  )}
                </div>
                {showEventDropdown && eventResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {eventResults.map(ev => (
                      <div key={ev.id} onClick={() => { 
                        setSelectedEvent(ev); 
                        setShowEventDropdown(false); 
                        setFormData(p => ({ 
                          ...p, 
                          date: ev.date,
                          category: ev.eventCategory || "SPECIAL_SERVICE"
                        }));
                      }} className="px-4 py-2 hover:bg-[#F3F4F6] cursor-pointer text-sm">
                        <div className="font-medium text-[#111827]">{ev.title}</div>
                        <div className="text-[10px] text-[#6B7280]">{ev.date} · {ev.eventCategory}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-[#6B7280] mb-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                className="w-full px-4 py-2.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm text-[#374151] focus:outline-none focus:border-[#000080]"
              >
                <option value="SERVICE">Service</option>
                <option value="SPECIAL_SERVICE">Special Service</option>
                <option value="WEDDING">Wedding</option>
                <option value="FUNERAL">Funeral</option>
                <option value="CONFERENCE">Conference</option>
              </select>
            </div>
          </div>

          {/* Section 2: Preacher Selection */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4">
            <h3 className="text-sm font-bold text-[#000080] flex items-center gap-2">
              <User className="w-4 h-4" /> Preacher Details
            </h3>
            
            <div className="relative" ref={preacherRef}>
              <label className="block text-xs font-semibold text-[#6B7280] mb-1">Search Preacher (Members)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input 
                  type="text"
                  value={selectedPreacher ? `${selectedPreacher.firstName} ${selectedPreacher.lastName}` : preacherQuery}
                  onChange={(e) => {
                    if (selectedPreacher) { setSelectedPreacher(null); setPreacherQuery(""); }
                    else setPreacherQuery(e.target.value);
                  }}
                  placeholder="Search name or email..."
                  className={`w-full pl-10 pr-10 py-2.5 bg-[#F9FAFB] border rounded-xl text-sm text-[#374151] focus:outline-none ${selectedPreacher ? 'border-green-500 bg-green-50' : 'border-[#E5E7EB]'}`}
                />
                {selectedPreacher && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Check className="w-4 h-4 text-green-500" />
                    <X className="w-4 h-4 text-[#9CA3AF] cursor-pointer" onClick={() => setSelectedPreacher(null)} />
                  </div>
                )}
              </div>
              {showPreacherDropdown && preacherResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#E5E7EB] rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {preacherResults.map(p => (
                    <div key={p.id} onClick={() => { setSelectedPreacher(p); setShowPreacherDropdown(false); }} className="px-4 py-2 hover:bg-[#F3F4F6] cursor-pointer text-sm">
                      <div className="font-medium text-[#111827]">{p.firstName} {p.lastName}</div>
                      <div className="text-[10px] text-[#6B7280]">{p.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField 
              label="Preacher Title"
              value={formData.preacherTitle}
              onChange={(e) => setFormData(p => ({ ...p, preacherTitle: e.target.value }))}
              placeholder="e.g. Pastor"
            />
          </div>

          {/* Section 3: Schedule & Connectivity */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] space-y-4 md:col-span-2">
            <h3 className="text-sm font-bold text-[#000080] flex items-center gap-2">
              <Clock className="w-4 h-4" /> Assignment Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Date"
                type="date"
                icon={<Calendar className="w-4 h-4" />}
                value={formData.date}
                onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
                required
              />
              <FormField 
                label="Start Time"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
                required
              />
              <FormField 
                label="End Time"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <div className="mt-8 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading}>Assign Minister</Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
