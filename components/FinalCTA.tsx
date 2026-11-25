import { Phone, MessageSquare } from 'lucide-react';
import { SiteSettings } from '@/types';

interface FinalCTAProps {
  settings?: SiteSettings | null;
  onOpenBooking?: () => void;
}

export default function FinalCTA({ settings }: FinalCTAProps) {
  const phone = settings?.phone || '919778215489';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWhatsApp = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919778215489';

  return (
    <section className="py-12 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#1c71cd] text-white p-8 sm:p-12 lg:p-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 shadow-sm">
          {/* Left Side: Text Content */}
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-100 mb-2 inline-block font-nav">
              WE ARE AVAILABLE 24/7
            </span>
            <h2 className="text-[24px] sm:text-[32px] font-semibold text-white tracking-tight mb-2.5 font-heading">
              Need a Home Service? We&apos;re Just a Call Away!
            </h2>
            <p className="text-xs sm:text-sm text-blue-50 leading-relaxed font-body">
              From appliance repairs to complete home maintenance, our certified technicians are ready to assist you right at your doorstep.
            </p>
          </div>

          {/* Right Side: Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3.5 lg:shrink-0">
            <a
              href={`tel:${cleanPhone || '919778215489'}`}
              className="bg-white text-[#1c71cd] hover:bg-blue-50 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 font-nav"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Call Now</span>
            </a>

            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                'Hello Bell Fix & Solutions, I would like to book a service.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 font-nav"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
