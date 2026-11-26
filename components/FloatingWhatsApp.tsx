'use client';

import { MessageCircle, Phone } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
  phoneNumber?: string;
  settings?: SiteSettings | null;
}

export default function FloatingWhatsApp({ whatsappNumber, phoneNumber, settings }: FloatingWhatsAppProps) {
  const cleanWhatsApp = (whatsappNumber || settings?.whatsapp_number || '').replace(/[^0-9]/g, '');
  const cleanPhone = (phoneNumber || settings?.phone || '').replace(/[^0-9+]/g, '');

  if (!cleanWhatsApp && !cleanPhone) return null;

  const defaultText = encodeURIComponent(
    'Hello Bell Fix & Solutions, I would like to enquire about your home services.'
  );

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {cleanWhatsApp && (
        <a
          href={`https://wa.me/${cleanWhatsApp}?text=${defaultText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Chat with Bell Fix & Solutions on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white stroke-none" />
          <span className="sr-only">Chat on WhatsApp</span>
        </a>
      )}

      {cleanPhone && (
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center w-13 h-13 rounded-full bg-[#1c71cd] text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Call Bell Fix & Solutions"
        >
          <Phone className="w-6 h-6 fill-white stroke-none" />
          <span className="sr-only">Call now</span>
        </a>
      )}
    </aside>
  );
}
