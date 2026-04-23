"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/shell/AppShell";
import { Send } from "lucide-react";

type Channel = "SMS" | "Email" | "Both";
type Audience = "All Members" | "Workers" | "First Timers" | "New Converts" | "Custom";

const audiences: Audience[] = ["All Members", "Workers", "First Timers", "New Converts", "Custom"];

export default function ComposeMessagePage() {
  const router = useRouter();
  const [channel, setChannel] = useState<Channel>("SMS");
  const [audience, setAudience] = useState<Audience>("All Members");
  const [custom, setCustom] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const needsSubject = channel === "Email" || channel === "Both";

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/messages");
  };

  return (
    <AppShell title="New Message" showBack hideTabBar>
      <form onSubmit={send} className="space-y-4 pb-24">
        <div>
          <span className="mb-2 block text-xs font-medium text-[#374151]">Channel</span>
          <div className="grid grid-cols-3 gap-2">
            {(["SMS", "Email", "Both"] as Channel[]).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setChannel(c)}
                className={`press rounded-xl py-2.5 text-xs font-semibold ring-1 ${
                  channel === c
                    ? "bg-[#000080] text-white ring-[#000080]"
                    : "bg-white text-[#374151] ring-[#E5E7EB]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-medium text-[#374151]">Recipient</span>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {audiences.map((a) => (
              <button
                type="button"
                key={a}
                onClick={() => setAudience(a)}
                className={`press whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium ring-1 ${
                  audience === a
                    ? "bg-[#000080] text-white ring-[#000080]"
                    : "bg-white text-[#374151] ring-[#E5E7EB]"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          {audience === "Custom" && (
            <textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
              placeholder="Enter phone numbers or emails separated by commas"
            />
          )}
        </div>

        {needsSubject && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-[#374151]">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
              placeholder="Enter subject"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-[#374151]">Message</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={7}
            className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-3 text-sm text-[#0F172A] outline-none focus:border-[#000080]"
            placeholder="Type your message..."
          />
          {channel !== "Email" && (
            <p className="mt-1 text-[11px] text-[#6B7280]">
              {content.length} chars · {Math.max(1, Math.ceil(content.length / 160))} SMS
            </p>
          )}
        </label>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}>
          <button type="submit" className="press flex w-full items-center justify-center gap-2 rounded-xl bg-[#000080] py-3.5 text-sm font-semibold text-white">
            <Send size={16} /> Send Message
          </button>
        </div>
      </form>
    </AppShell>
  );
}
