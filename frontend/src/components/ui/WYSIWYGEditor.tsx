"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import react-quill-new with ssr: false to avoid Next.js hydration issues
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] w-full animate-pulse rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
      Loading editor...
    </div>
  ),
});

import "react-quill-new/dist/quill.snow.css";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export default function WYSIWYGEditor({
  value,
  onChange,
  placeholder = "Compose your email...",
  error,
}: WYSIWYGEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "code-block"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "align",
    "blockquote",
    "code-block",
  ];

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[#E5E7EB] dark:border-slate-700 focus-within:ring-2 focus-within:ring-[#000080]/20 focus-within:border-[#000080] bg-white dark:bg-slate-800">
      <style>{`
        /* Custom Quill Overrides for Dark Mode & Premium Feel */
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #E5E7EB !important;
          background-color: #F9FAFB !important;
          padding: 8px 12px !important;
        }
        .dark .ql-toolbar.ql-snow {
          border-bottom: 1px solid #334155 !important;
          background-color: rgba(15, 23, 42, 0.5) !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
          min-height: 220px !important;
        }
        .ql-editor {
          min-height: 220px !important;
          color: #374151 !important;
          padding: 16px !important;
        }
        .dark .ql-editor {
          color: #cbd5e1 !important;
          background-color: #1e293b !important;
        }
        .ql-editor.ql-blank::before {
          color: #9CA3AF !important;
          font-style: normal !important;
          left: 16px !important;
        }
        .dark .ql-editor.ql-blank::before {
          color: #64748b !important;
        }
        /* Style toolbar buttons in dark mode */
        .dark .ql-snow .ql-stroke {
          stroke: #cbd5e1 !important;
        }
        .dark .ql-snow .ql-fill {
          fill: #cbd5e1 !important;
        }
        .dark .ql-snow .ql-picker {
          color: #cbd5e1 !important;
        }
        .dark .ql-snow .ql-picker-options {
          background-color: #1e293b !important;
          border-color: #334155 !important;
        }
        .dark .ql-snow .ql-picker-item {
          color: #cbd5e1 !important;
        }
        .dark .ql-snow .ql-picker-item:hover,
        .dark .ql-snow .ql-picker-label:hover {
          color: #6366f1 !important;
        }
        .dark .ql-snow .ql-picker-item.ql-selected {
          color: #6366f1 !important;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
      {error && (
        <div className="px-4 py-2 border-t border-red-200 bg-red-50 dark:bg-red-900/20 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
