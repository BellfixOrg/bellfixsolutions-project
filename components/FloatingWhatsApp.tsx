'use client';

import { MessageCircle } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
  settings?: SiteSettings | null;
}

export default function FloatingWhatsApp({ whatsappNumber, settings }: FloatingWhatsAppProps) {
  const number = whatsappNumber || settings?.whatsapp_number;
  if (!number) return null;

  const cleanNumber = number.replace(/[^0-9]/g, '');
  if (!cleanNumber) return null;

  const defaultText = encodeURIComponent(
    'Hello Bell Fix & Solutions, I would like to enquire about your home services.'
  );

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 right-6 z-50">
      <a
        href={`https://wa.me/${cleanNumber}?text=${defaultText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group"
        aria-label="Chat with Bell Fix & Solutions on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-white stroke-none" />
        <span className="sr-only">Chat on WhatsApp</span>
      </a>
    </aside>
  );
}
