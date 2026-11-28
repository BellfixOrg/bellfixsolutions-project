import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import WhyChooseUs from '@/components/WhyChooseUs';
import FinalCTA from '@/components/FinalCTA';
import { getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';
import { CheckCircle } from 'lucide-react';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'About Us | Bell Fix & Solutions',
  description: 'Learn about Bell Fix & Solutions — our mission, certified technician team, and commitment to reliable home maintenance.',
  alternates: {
    canonical: absoluteUrl('/about'),
  },
  openGraph: {
    title: 'About Us | Bell Fix & Solutions',
    description: 'Learn about Bell Fix & Solutions — our mission, certified technician team, and commitment to reliable home maintenance.',
    url: absoluteUrl('/about'),
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'About Bell Fix & Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Bell Fix & Solutions',
    description: 'Learn about Bell Fix & Solutions — our mission, certified technician team, and commitment to reliable home maintenance.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 0;

export default async function AboutPage() {
  const [settings, categories, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
  ]);

  const stats = [
    { value: '10,000+', label: 'Homes Serviced' },
    { value: '45 Mins', label: 'Average Arrival' },
    { value: '98.5%', label: 'Customer Satisfaction' },
    { value: '100%', label: 'Certified Technicians' },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'About Us', url: absoluteUrl('/about') },
        ])}
      />
      <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Narrative & Visual Section */}
        {settings && (
          <section className="py-6 sm:py-10 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm">
                  <Image
                    src={settings.about_image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop'}
                    alt="Our professional team"
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2 block">
                    OUR MISSION & VALUES
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#101820] mb-4">
                    {settings.about_heading}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6">
                    {settings.about_description}
                  </p>
                  <div className="space-y-3">
                    {[
                      'Full transparency in diagnostics and quote pricing before starting work',
                      'Zero shortcut repairs — strictly genuine replacement components',
                      'Comprehensive 90-day post-service peace of mind warranty',
                      'Trained, polite, background-checked professional workforce',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-[#1c71cd] shrink-0 mt-0.5" />
                        <span className="text-xs sm:text-sm text-[#101820] font-medium leading-relaxed">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Key Metrics on #F5F8FA cards */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-[#F5F8FA] p-6 rounded-xl text-center shadow-2xs no-border">
                  <div className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-[#667085] font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Final CTA */}
        <FinalCTA settings={settings} />
      </main>

      <Footer settings={settings} services={services} />
      {settings?.whatsapp_number && (
        <FloatingWhatsApp settings={settings} />
      )}
    </div>
    </>
  );
}
