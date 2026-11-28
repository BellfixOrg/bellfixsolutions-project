import Link from 'next/link';
import { Home, Wrench, Phone, ArrowRight, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';

export const metadata = {
  title: 'Page Not Found (404) | Bell Fix & Solutions',
  description: 'The page you requested could not be found. Explore our professional appliance repairs and home services.',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function NotFound() {
  const [settings, categories, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
  ]);

  const popularServices = services.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1 flex flex-col items-center justify-center py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c71cd]/10 text-[#1c71cd] text-xs font-bold uppercase tracking-widest mb-6">
            <AlertTriangle className="w-4 h-4" />
            <span>404 Error</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#101820] tracking-tight mb-4">
            Page Not Found
          </h1>

          <p className="text-sm sm:text-base text-[#667085] max-w-lg mx-auto leading-relaxed mb-8">
            The link you followed may be broken, or the page may have been moved or removed. Our certified technicians are still ready to assist with any home maintenance requirement.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <Link
              href="/"
              className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Homepage</span>
            </Link>

            <Link
              href="/services"
              className="bg-[#F5F8FA] text-[#101820] hover:bg-gray-200 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2"
            >
              <Wrench className="w-4 h-4 text-[#1c71cd]" />
              <span>Browse All Services</span>
            </Link>

            <Link
              href="/contact"
              className="bg-transparent hover:bg-gray-50 text-[#101820] border border-gray-200 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#1c71cd]" />
              <span>Contact Support</span>
            </Link>
          </div>

          {/* Quick Service Links */}
          {popularServices.length > 0 && (
            <div className="pt-10 border-t border-gray-100 text-left">
              <span className="text-xs font-bold text-[#667085] uppercase tracking-wider block mb-4 text-center">
                Popular Services You Might Need
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularServices.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="p-3.5 rounded-xl bg-[#F5F8FA] hover:bg-white hover:shadow-xs transition-all flex items-center justify-between group border border-transparent hover:border-gray-100"
                  >
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#101820] group-hover:text-[#1c71cd] transition-colors">
                        {service.name}
                      </h4>
                      <p className="text-[11px] text-[#667085] line-clamp-1">
                        {service.short_description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1c71cd] group-hover:translate-x-0.5 transition-transform shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer settings={settings} services={services} />
      {settings?.whatsapp_number && <FloatingWhatsApp settings={settings} />}
    </div>
  );
}
