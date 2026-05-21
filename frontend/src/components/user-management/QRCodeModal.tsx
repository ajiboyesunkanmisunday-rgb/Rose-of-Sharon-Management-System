"use client";

import { useRef, useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { QRCodeCanvas } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: string;
  title?: string;
}

export default function QRCodeModal({ isOpen, onClose, value, title }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const url = value
    ? (value.startsWith("http") ? value : `${origin}${value}`)
    : `${origin}/register`;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "registration-qr-code.png";
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "Registration QR Code"}>
      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-sm text-[#6B7280] dark:text-slate-400 text-center">
          Scan this code to open the registration form
        </p>
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          size={220}
          level="H"
          marginSize={2}
        />
        <p className="text-xs text-[#9CA3AF] dark:text-slate-400 break-all text-center max-w-xs">{url}</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleDownload}
            className="rounded-lg bg-[#000080] px-4 py-2 text-xs font-medium text-white hover:bg-[#000066] transition-colors"
          >
            Download PNG
          </button>
          <button
            onClick={handleCopyLink}
            className="rounded-lg border border-[#E5E7EB] dark:border-slate-700 px-4 py-2 text-xs font-medium text-[#374151] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:bg-slate-700/50 transition-colors"
          >
            Copy Link
          </button>
        </div>
      </div>
    </Modal>
  );
}
