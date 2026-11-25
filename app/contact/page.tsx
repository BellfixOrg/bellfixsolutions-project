import { Metadata } from 'next';
import { Phone, MessageSquare, Mail, MapPin, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BookingForm from '@/components/BookingForm';
import { getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Contact Us & Book Service | Bell Fix & Solutions',
  description: 'Book home services or contact our team via phone or WhatsApp. Available 24/7 across the city.',
};

export const revalidate = 0;

export default async function ContactPage() {
  const [settings, categories, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
  ]);

  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Hero Header */}
        <div className="bg-[#101820] text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2 block">
              WE ARE READY TO HELP
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Contact & Book Service
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Have an urgent appliance breakdown or wish to schedule routine maintenance? Reach out directly or fill the form below.
            </p>
          </div>
        </div>

        {/* Contact Form and Information Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            {/* Contact Details (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                  DIRECT ASSISTANCE
                </span>
                <h2 className="text-2xl font-bold text-[#101820] tracking-tight mb-3">
                  Reach Our Support Desk
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  Call our customer hotline or chat with our operations dispatch team on WhatsApp for immediate response.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-3.5">
                {cleanPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="bg-[#F5F8FA] hover:bg-white p-4 rounded-xl flex items-center gap-4 transition-all group shadow-2xs no-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1c71cd]/10 text-[#1c71cd] group-hover:bg-[#1c71cd] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                        Direct Hotline
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#101820]">
                        {settings?.phone}
                      </span>
                    </div>
                  </a>
                )}

                {cleanWhatsApp && (
                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                      'Hello Bell Fix & Solutions, I need service assistance.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#F5F8FA] hover:bg-white p-4 rounded-xl flex items-center gap-4 transition-all group shadow-2xs no-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                        WhatsApp Dispatch
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#101820]">
                        +{cleanWhatsApp} (Fast Chat)
                      </span>
                    </div>
                  </a>
                )}

                {settings?.email && (
                  <a
                    href={`mailto:${settings.email}`}
                    className="bg-[#F5F8FA] hover:bg-white p-4 rounded-xl flex items-center gap-4 transition-all group shadow-2xs no-border"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#102A43]/10 text-[#102A43] group-hover:bg-[#102A43] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                        Email Inquiries
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#101820]">
                        {settings.email}
                      </span>
                    </div>
                  </a>
                )}

                {settings?.address && (
                  <div className="bg-[#F5F8FA] p-4 rounded-xl flex items-center gap-4 shadow-2xs no-border">
                    <div className="w-10 h-10 rounded-full bg-[#1c71cd]/10 text-[#1c71cd] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                        Service Coverage
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-[#101820]">
                        {settings.address}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-[#F5F8FA] p-4 rounded-xl flex items-center gap-4 shadow-2xs no-border">
                  <div className="w-10 h-10 rounded-full bg-[#102A43]/10 text-[#102A43] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block">
                      Service Hours
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#101820]">
                      Open 7 Days a Week (8:00 AM – 10:00 PM)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form Card (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl shadow-md no-border">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                ONLINE APPOINTMENT REQUEST
              </span>
              <h3 className="text-xl font-bold text-[#101820] mb-2">
                Book a Service Visit
              </h3>
              <p className="text-xs sm:text-sm text-[#667085] mb-6">
                Submit your request and our dispatcher will schedule your technician visit and notify you immediately via WhatsApp.
              </p>

              <BookingForm services={services} settings={settings} />
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} services={services} />
      {settings?.whatsapp_number && (
        <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
      )}
    </div>
  );
}
