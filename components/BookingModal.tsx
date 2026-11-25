'use client';

import { X } from 'lucide-react';
import BookingForm from './BookingForm';
import { Service, SiteSettings } from '@/types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  settings?: SiteSettings | null;
  selectedServiceName?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  services,
  settings,
  selectedServiceName,
}: BookingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden no-border p-6 sm:p-7">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1c71cd]">
              FAST DOORSTEP SERVICE
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#101820]">
              Book Your Service
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <BookingForm
          services={services}
          settings={settings}
          selectedServiceName={selectedServiceName}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}
