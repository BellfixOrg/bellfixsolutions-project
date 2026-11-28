import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import BlogListClient from '@/components/BlogListClient';
import { getBlogPosts, getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import { buildBreadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Blog & Home Appliance Maintenance Tips | Bell Fix & Solutions',
  description: 'Expert advice, maintenance guides, and appliance repair tips from Bell Fix & Solutions.',
  alternates: {
    canonical: absoluteUrl('/blog'),
  },
  openGraph: {
    title: 'Blog & Home Appliance Maintenance Tips | Bell Fix & Solutions',
    description: 'Expert advice, maintenance guides, and appliance repair tips from Bell Fix & Solutions.',
    url: absoluteUrl('/blog'),
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Blog & Home Appliance Maintenance Tips | Bell Fix & Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Home Appliance Maintenance Tips | Bell Fix & Solutions',
    description: 'Expert advice, maintenance guides, and appliance repair tips from Bell Fix & Solutions.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 0;

export default async function BlogPage() {
  const [settings, categories, services, blogs] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
    getBlogPosts(true).catch(() => []),
  ]);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Blog', url: absoluteUrl('/blog') },
        ])}
      />
      <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#101820] text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-3 px-3.5 py-1.5 rounded-full">
              Latest Insights & Advice
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
              Blog & Appliance Care Guides
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Helpful tips, maintenance checklists, and professional guidance to keep your home appliances running smoothly.
            </p>
          </div>
        </div>

        {/* Dynamic Blog Posts Grid with Read More Popup Modal */}
        <BlogListClient blogs={blogs} settings={settings} />
      </main>

      <Footer settings={settings} services={services} />
      <FloatingWhatsApp settings={settings} />
    </div>
    </>
  );
}
