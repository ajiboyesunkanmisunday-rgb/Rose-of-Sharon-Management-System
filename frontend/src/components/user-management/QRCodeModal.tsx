"use client";

import Modal from "@/components/ui/Modal";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value?: string;
  title?: string;
}

export default function QRCodeModal({ isOpen, onClose, value, title }: QRCodeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || "QR Code"}>
      <div className="flex flex-col items-center py-4">
        <p className="mb-4 text-sm text-gray-500">Scan Code Here</p>
        <QRCodeSVG
          value={value || "https://rosms.app/register"}
          size={200}
          level="H"
          includeMargin
        />
      </div>
    </Modal>
  );
}
