import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Phone,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Award,
  Layers,
  MapPin,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BookingForm from '@/components/BookingForm';
import ServiceCard from '@/components/ServiceCard';
import BrandsSlider from '@/components/BrandsSlider';
import FinalCTA from '@/components/FinalCTA';
import {
  getBrands,
  getDistricts,
  getNavigationHierarchy,
  getServiceBySlug,
  getServiceCategoryBySlug,
  getSubcategoryBySlug,
  getServices,
  getSiteSettings,
} from '@/lib/db';

export const revalidate = 0;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ location?: string }>;
}) {
  const { slug } = await params;
  const { location: locationQuery } = (await searchParams) || {};
  const service = await getServiceBySlug(slug).catch(() => null);
  if (service) {
    const locTitle = locationQuery ? ` in ${locationQuery.charAt(0).toUpperCase() + locationQuery.slice(1)}` : '';
    return {
      title: `${service.name} Service & Repair${locTitle} | Bell Fix & Solutions`,
      description: service.short_description,
    };
  }

  const category = await getServiceCategoryBySlug(slug).catch(() => null);
  if (category) {
    return {
      title: `${category.name} | Bell Fix & Solutions`,
      description: category.description || `Explore our professional ${category.name.toLowerCase()} for your home.`,
    };
  }

  const subcategory = await getSubcategoryBySlug(slug).catch(() => null);
  if (subcategory) {
    return {
      title: `${subcategory.name} | Bell Fix & Solutions`,
      description: subcategory.description || `Explore our professional ${subcategory.name.toLowerCase()} for your home.`,
    };
  }

  return { title: 'Service Not Found | Bell Fix & Solutions' };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ location?: string }>;
}) {
  const { slug } = await params;
  const { location: locationQuery } = (await searchParams) || {};
  const [service, category, subcategory, categories, allServices, allDistricts, settings, brands] = await Promise.all([
    getServiceBySlug(slug).catch(() => null),
    getServiceCategoryBySlug(slug).catch(() => null),
    getSubcategoryBySlug(slug).catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
    getDistricts(true).catch(() => []),
    getSiteSettings().catch(() => null),
    getBrands(true).catch(() => []),
  ]);

  if (!service && !category && !subcategory) {
    notFound();
  }

  // If slug is a Category or Subcategory, render the category services catalog with home page service cards
  if (!service) {
    const activeCategory = category;
    const activeSubcategory = subcategory;
    const title = activeCategory?.name || activeSubcategory?.name || 'Services';
    const description =
      activeCategory?.description ||
      activeSubcategory?.description ||
      `Explore our verified ${title.toLowerCase()} delivered with precision by certified professionals.`;

    const categoryServices = allServices.filter((s) => {
      if (activeCategory) {
        return s.category_id === activeCategory.id || s.category_slug === activeCategory.slug;
      }
      if (activeSubcategory) {
        return s.subcategory_id === activeSubcategory.id || s.subcategory_slug === activeSubcategory.slug;
      }
      return false;
    });

    const isRepairCategory =
      activeCategory?.slug === 'repair-services' ||
      activeCategory?.name.toLowerCase().includes('repair') ||
      activeSubcategory?.slug?.includes('repair') ||
      activeSubcategory?.name.toLowerCase().includes('repair');

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header settings={settings} categories={categories} />

        <main className="flex-1">
          {/* Category Header */}
          <div className="bg-white pt-10 sm:pt-14 pb-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2 block">
                SERVICE CATEGORY
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#101820] tracking-tight mb-3">
                {title}
              </h1>
              {description && (
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Services Grid using Home Page Service Cards */}
          <section className="pt-6 pb-12 sm:pb-16 bg-white min-h-[400px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {categoryServices.length === 0 ? (
                <div className="bg-[#F5F8FA] rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
                  <div className="w-12 h-12 rounded-full bg-white text-[#1c71cd] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[#101820] mb-1">
                    No Services Available
                  </h3>
                  <p className="text-xs text-[#667085]">
                    No services are currently configured under {title}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {categoryServices.map((item) => (
                    <ServiceCard key={item.id} service={item} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* WE REPAIR ALL BRANDS Slider (Repair Service Category Page Only) */}
          {isRepairCategory && brands.length > 0 && (
            <BrandsSlider brands={brands} />
          )}

          {/* Final CTA */}
          <FinalCTA settings={settings} />
        </main>

        <Footer settings={settings} services={allServices} />
        <FloatingWhatsApp settings={settings} />
      </div>
    );
  }

  // Otherwise, render individual service details
  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '';

  const whatsappMessage = encodeURIComponent(
    `Hello Bell Fix & Solutions, I would like to book or enquire about ${service.name} service.`
  );

  const availableDistricts =
    service.districts && service.districts.length > 0
      ? service.districts
      : allDistricts.filter(
          (d) => !service.district_ids || service.district_ids.length === 0 || service.district_ids.includes(d.id)
        );

  const selectedDistrict = availableDistricts.find(
    (d) => d.slug.toLowerCase() === locationQuery?.toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Breadcrumb & Hero */}
        <div className="relative text-white py-12 sm:py-16 overflow-hidden bg-[#101820]">
          {service.cover_image && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-right md:bg-center z-0"
                style={{ backgroundImage: `url(${service.cover_image})` }}
              />
              {/* Black gradient on content side only */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/95 via-black/85 md:via-black/70 to-transparent z-0" />
            </>
          )}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="block text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2">
              PROFESSIONAL HOME CARE
            </span>

            {selectedDistrict && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-3 backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-[#1c71cd]" />
                <span>Serving {selectedDistrict.name}</span>
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight mb-3">
              {service.name}
            </h1>

            <p className="hidden sm:block text-sm text-gray-300 max-w-2xl leading-relaxed">
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
                  <span>Call Now</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Main Service Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-10">
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

              {/* Available Locations / Coverage Areas */}
              {availableDistricts && availableDistricts.length > 0 && (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#101820] mb-3 flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#1c71cd]" />
                    <span>Available Locations</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {availableDistricts.map((district) => {
                      const isSelected =
                        district.slug.toLowerCase() === locationQuery?.toLowerCase();

                      return (
                        <Link
                          key={district.id}
                          href={`/services/${service.slug}?location=${district.slug}`}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                            isSelected
                              ? 'bg-[#1c71cd] text-white shadow-xs'
                              : 'bg-[#F5F8FA] text-[#101820] hover:bg-[#1c71cd] hover:text-white'
                          }`}
                        >
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#1c71cd]'}`} />
                          <span>{district.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar: Booking Form (5 Cols) */}
            <div className="lg:col-span-5">
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
                  districts={availableDistricts}
                  initialLocation={selectedDistrict?.name}
                  selectedServiceName={service.name}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer settings={settings} services={allServices} />
      {settings?.whatsapp_number && (
        <FloatingWhatsApp settings={settings} />
      )}
    </div>
  );
}
