import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, MessageSquare, CheckCircle2, ArrowLeft, ShieldCheck, Clock, Award } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BookingForm from '@/components/BookingForm';
import { getNavigationHierarchy, getServiceBySlug, getServices, getSiteSettings } from '@/lib/db';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug).catch(() => null);
  if (!service) return { title: 'Service Not Found | Bell Fix & Solutions' };

  return {
    title: `${service.name} Service & Repair | Bell Fix & Solutions`,
    description: service.short_description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, categories, allServices, settings] = await Promise.all([
    getServiceBySlug(slug).catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
    getSiteSettings().catch(() => null),
  ]);

  if (!service) {
    notFound();
  }

  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '';

  const whatsappMessage = encodeURIComponent(
    `Hello Bell Fix & Solutions, I would like to book or enquire about ${service.name} service.`
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Breadcrumb & Hero */}
        <div className="bg-[#101820] text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-xs text-[#1c71cd] hover:underline mb-4 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all services</span>
            </Link>

            <span className="block text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2">
              PROFESSIONAL HOME CARE
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              {service.name}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
              {service.short_description}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now: {settings?.phone}</span>
                </a>
              )}

              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#1c71cd]" />
                  <span>WhatsApp Booking</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Main Service Details (2 Cols) */}
            <div className="lg:col-span-2 space-y-10">
              {/* Main Image */}
              <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden shadow-sm">
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
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#101820] mb-4">
                  Overview & Service Scope
                </h2>
                <div className="text-xs sm:text-sm text-[#667085] leading-relaxed space-y-4">
                  <p>{service.full_description || service.short_description}</p>
                  <p>
                    Our technicians are certified, equipped with original spare parts, and follow industry standard safety checklists to diagnose and resolve issues efficiently on the first visit.
                  </p>
                </div>
              </div>

              {/* Service Benefits */}
              {service.benefits && service.benefits.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#101820] mb-4">
                    Key Service Benefits
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {service.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="bg-[#F5F8FA] p-4 rounded-lg flex items-start gap-3 no-border"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#1c71cd] shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-[#101820] font-medium leading-relaxed">
                          {benefit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Gallery Images */}
              {service.additional_images && service.additional_images.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#101820] mb-4">
                    Service in Action
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {service.additional_images.map((imgUrl, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-xs"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${service.name} detail ${i + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 bg-[#F5F8FA] p-5 rounded-xl no-border text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-5 h-5 text-[#1c71cd] mb-1.5" />
                  <span className="text-xs font-bold text-[#101820]">
                    Warranty Covered
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="w-5 h-5 text-[#1c71cd] mb-1.5" />
                  <span className="text-xs font-bold text-[#101820]">
                    Punctual Arrival
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-5 h-5 text-[#1c71cd] mb-1.5" />
                  <span className="text-xs font-bold text-[#101820]">
                    Certified Crew
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Sidebar: Booking Form (1 Col) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white p-6 sm:p-7 rounded-xl shadow-md no-border">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                  INSTANT APPOINTMENT
                </span>
                <h3 className="text-lg font-bold text-[#101820] mb-2">
                  Book {service.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#667085] mb-5">
                  Fill in your details below and we will confirm your schedule instantly via WhatsApp.
                </p>

                <BookingForm
                  services={allServices}
                  settings={settings}
                  selectedServiceName={service.name}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} services={allServices} />
      {settings?.whatsapp_number && (
        <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />
      )}
    </div>
  );
}
