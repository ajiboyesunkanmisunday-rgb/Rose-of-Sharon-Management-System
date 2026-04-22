"use client";

import { useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { toCSV, downloadCSV } from "@/lib/csv";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (rows: Record<string, string>[]) => void;
  module: "Members" | "E-Members" | "First Timers" | "Second Timers" | "New Converts";
  templateHeaders: string[];
  templateSampleRow: string[];
}

/**
 * Lightweight CSV parser that handles quoted fields (with embedded commas,
 * escaped quotes via "" and newlines). Returns an array of rows, each of
 * which is an array of string cells.
 */
function parseCSV(input: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuotes) {
      if (ch === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      current.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      // End of line; collapse \r\n
      if (ch === "\r" && input[i + 1] === "\n") i++;
      current.push(field);
      rows.push(current);
      current = [];
      field = "";
    } else {
      field += ch;
    }
  }

  // Flush last field/row if any content remains
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }

  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onImport,
  module,
  templateHeaders,
  templateSampleRow,
}: BulkImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string>("");

  const reset = () => {
    setFileName("");
    setParsedRows([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const templateFilename = `${module.toLowerCase().replace(/\s+/g, "-")}-template.csv`;

  const handleDownloadTemplate = () => {
    const headerObjs = templateHeaders.map((h) => ({ key: h, label: h }));
    const sampleObj: Record<string, string> = {};
    templateHeaders.forEach((h, idx) => {
      sampleObj[h] = templateSampleRow[idx] ?? "";
    });
    const csv = toCSV([sampleObj], headerObjs);
    downloadCSV(csv, templateFilename);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setParsedRows([]);
    const file = e.target.files?.[0];
    if (!file) {
      setFileName("");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      try {
        const grid = parseCSV(text);
        if (grid.length < 1) {
          setError("The file appears to be empty.");
          return;
        }
        const headers = grid[0].map((h) => h.trim());
        const dataRows = grid.slice(1);
        const objects: Record<string, string>[] = dataRows.map((row) => {
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h] = (row[idx] ?? "").trim();
          });
          return obj;
        });
        setParsedRows(objects);
      } catch {
        setError("Failed to parse CSV file.");
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  };

  const handleImport = () => {
    onImport(parsedRows);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Bulk Import ${module}`} size="md">
      <div className="space-y-4">
        <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-sm text-[#374151]">
          <p className="mb-2 font-medium text-[#000080]">How to use</p>
          <ol className="list-inside list-decimal space-y-1 text-[#6B7280]">
            <li>Download the CSV template below.</li>
            <li>Fill in one row per record, keeping the header row intact.</li>
            <li>Upload the completed CSV file to import.</li>
          </ol>
        </div>

        <div>
          <Button variant="primary" onClick={handleDownloadTemplate}>
            Download Template
          </Button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[#374151]">
            Upload CSV
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full cursor-pointer rounded-lg border border-[#E5E7EB] bg-white p-2 text-sm text-[#374151] file:mr-3 file:rounded-md file:border-0 file:bg-[#B5B5F3] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#000080] hover:file:bg-[#A3A3E8]"
          />
          {fileName && !error && parsedRows.length > 0 && (
            <p className="mt-2 text-sm text-[#16A34A]">
              Ready to import <strong>{parsedRows.length}</strong> row
              {parsedRows.length === 1 ? "" : "s"} from <em>{fileName}</em>.
            </p>
          )}
          {fileName && !error && parsedRows.length === 0 && (
            <p className="mt-2 text-sm text-[#6B7280]">
              No data rows found in <em>{fileName}</em>.
            </p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            disabled={parsedRows.length === 0}
          >
            Import
          </Button>
        </div>
      </div>
    </Modal>
  );
}
