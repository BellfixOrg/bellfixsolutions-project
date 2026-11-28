import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import CategoryServiceSections from '@/components/CategoryServiceSections';
import FinalCTA from '@/components/FinalCTA';
import { getDistricts, getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Our Home Services | Bell Fix & Solutions',
  description: 'Explore comprehensive appliance repairs, AC maintenance, water tank sanitization, CCTV, and deep cleaning services across Kerala.',
  alternates: {
    canonical: absoluteUrl('/services'),
  },
  openGraph: {
    title: 'Our Home Services | Bell Fix & Solutions',
    description: 'Explore comprehensive appliance repairs, AC maintenance, water tank sanitization, CCTV, and deep cleaning services across Kerala.',
    url: absoluteUrl('/services'),
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Our Home Services | Bell Fix & Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Home Services | Bell Fix & Solutions',
    description: 'Explore comprehensive appliance repairs, AC maintenance, water tank sanitization, CCTV, and deep cleaning services across Kerala.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 0;

export default async function ServicesPage() {
  const [settings, categories, districts, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getDistricts(true).catch(() => []),
    getServices(true).catch(() => []),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Services', url: absoluteUrl('/services') },
        ])}
      />
      <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Hero Banner */}
        <div className="bg-[#101820] text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2 block">
              OUR COMPLETE CATALOG
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
              Professional Home Services
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Prompt diagnostics, certified technicians, and lasting repairs for your comfort and safety across all covered districts.
            </p>
          </div>
        </div>

        {/* Categorized Services with District Filtering */}
        <CategoryServiceSections
          categories={categories}
          districts={districts}
          services={services}
        />

        {/* CTA */}
        <FinalCTA settings={settings} />
      </main>

      <Footer settings={settings} services={services} />
      <FloatingWhatsApp settings={settings} />
    </div>
    </>
  );
}
