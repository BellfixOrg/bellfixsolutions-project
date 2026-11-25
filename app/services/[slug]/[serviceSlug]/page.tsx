import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BookingForm from '@/components/BookingForm';
import { getDistricts, getNavigationHierarchy, getServiceBySlug, getServiceCategories, getServices, getSiteSettings } from '@/lib/db';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string; serviceSlug: string }>;
  searchParams: Promise<{ location?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; serviceSlug: string }> }) {
  const { slug: categorySlug, serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug, categorySlug).catch(() => null);
  if (!service) return { title: 'Service Not Found | Bell Fix & Solutions' };

  return {
    title: `${service.name} – ${service.category_name || 'Home Services'} | Bell Fix & Solutions`,
    description: service.short_description,
  };
}

export default async function DynamicCategoryServicePage({ params, searchParams }: PageProps) {
  const { slug: categorySlug, serviceSlug } = await params;
  const { location: locationQuery } = await searchParams;

  const [service, categories, navCategories, districts, allServices, settings] = await Promise.all([
    getServiceBySlug(serviceSlug, categorySlug).catch(() => null),
    getServiceCategories(true).catch(() => []),
    getNavigationHierarchy().catch(() => []),
    getDistricts(true).catch(() => []),
    getServices(true).catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  if (!service) {
    notFound();
  }

  const selectedDistrict = districts.find(
    (d) => d.slug.toLowerCase() === locationQuery?.toLowerCase()
  );

  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '';

  const whatsappMessage = encodeURIComponent(
    `Hello Bell Fix & Solutions,\n\nI would like to book the ${service.name} service under ${service.category_name || 'Home Services'}${
      selectedDistrict ? ` in ${selectedDistrict.name}` : ''
    }. Kindly review my booking request and let me know the availability and confirmation.\n\nThank you!`
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={navCategories} />

      <main className="flex-1">
        {/* Breadcrumb Navigation & Hero Header */}
        <div className="bg-[#101820] text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Trail */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6 flex-wrap font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <Link href="/services" className="hover:text-white transition-colors">
                Services
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-[#1c71cd]">
                {service.category_name || 'Category'}
              </span>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <span className="text-white font-bold">{service.name}</span>
            </nav>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2 bg-[#102A43] px-3 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5" />
              <span>{service.category_name || 'Home Service'}</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              {service.name}
            </h1>

            {selectedDistrict && (
              <div className="inline-flex items-center gap-2 bg-[#1c71cd]/10 text-[#1c71cd] px-3.5 py-1.5 rounded-xl text-xs font-semibold mb-4">
                <MapPin className="w-3.5 h-3.5" />
                <span>Available in {selectedDistrict.name}</span>
              </div>
            )}

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              {service.short_description}
            </p>
          </div>
        </div>

        {/* Content Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Main Service Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Main Service Image */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#F5F8FA] shadow-sm">
                <Image
                  src={service.main_image}
                  alt={service.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              </div>

              {/* Service Description */}
              <section className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#101820]">
                  About This Service
                </h2>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {service.full_description || service.short_description}
                </div>
              </section>

              {/* Benefits & Features */}
              {service.benefits && service.benefits.length > 0 && (
                <section className="bg-[#F5F8FA] p-6 sm:p-8 rounded-2xl space-y-4">
                  <h3 className="text-lg font-bold text-[#101820]">
                    What We Provide
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {service.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#1c71cd] shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-gray-700 font-medium">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Available Coverage Locations */}
              {service.districts && service.districts.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-[#101820] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#1c71cd]" />
                    <span>Coverage Areas & Districts</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {service.districts.map((d) => {
                      const isSelected =
                        selectedDistrict?.id === d.id ||
                        d.slug.toLowerCase() === locationQuery?.toLowerCase();

                      return (
                        <Link
                          key={d.id}
                          href={`/services/${categorySlug}/${serviceSlug}?location=${d.slug}`}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#1c71cd] text-white shadow-sm'
                              : 'bg-[#F5F8FA] text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {d.name}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Quality Assurances */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-4 bg-[#F5F8FA] rounded-xl">
                  <ShieldCheck className="w-6 h-6 text-[#1c71cd] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#101820]">Verified Experts</div>
                    <div className="text-[11px] text-gray-500">Certified technicians</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F5F8FA] rounded-xl">
                  <Clock className="w-6 h-6 text-[#1c71cd] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#101820]">Quick Response</div>
                    <div className="text-[11px] text-gray-500">Same-day doorstep visits</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F5F8FA] rounded-xl">
                  <Award className="w-6 h-6 text-[#1c71cd] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#101820]">Quality Guaranteed</div>
                    <div className="text-[11px] text-gray-500">Genuine parts & care</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Booking Sidebar */}
            <aside className="space-y-6">
              {/* Booking Card */}
              <div className="bg-[#F5F8FA] p-6 sm:p-7 rounded-2xl shadow-sm space-y-5 sticky top-28">
                <div>
                  <h3 className="text-xl font-bold text-[#101820]">
                    Book This Service
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Fill the form or tap WhatsApp for an immediate response.
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="grid grid-cols-2 gap-2.5">
                  {cleanPhone && (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-[#101820] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs"
                    >
                      <Phone className="w-4 h-4 text-[#1c71cd]" />
                      <span>Call Now</span>
                    </a>
                  )}

                  {cleanWhatsApp && (
                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:bg-[#20ba59] transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="border-t border-gray-200/60 pt-4">
                  <BookingForm
                    services={allServices}
                    settings={settings}
                    categories={categories}
                    districts={districts}
                    selectedServiceName={service.name}
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer settings={settings} services={allServices} />
      <FloatingWhatsApp settings={settings} />
    </div>
  );
}

