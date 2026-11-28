import type { Metadata } from 'next';
import {
  getBanners,
  getDistricts,
  getNavigationHierarchy,
  getServices,
  getSiteSettings,
  getTestimonials,
  getWhyChooseUsData,
} from '@/lib/db';
import HomeView from '@/components/HomeView';
import JsonLd from '@/components/JsonLd';
import {
  buildOrganizationSchema,
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from '@/lib/schema';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'BELL FIX & SOLUTIONS – Professional Home Services',
  description:
    'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'BELL FIX & SOLUTIONS – Professional Home Services',
    description:
      'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'BELL FIX & SOLUTIONS – Professional Home Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BELL FIX & SOLUTIONS – Professional Home Services',
    description:
      'Reliable home maintenance, AC repair, washing machine, refrigerator, water tank cleaning, CCTV, and deep cleaning services delivered right to your doorstep.',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 0; // Dynamic data from Supabase

export default async function HomePage() {
  const [settings, banners, categories, districts, services, testimonials, whyChooseUs] = await Promise.all([
    getSiteSettings().catch((err) => {
      console.error('Failed to load site settings:', err);
      return null;
    }),
    getBanners(true).catch((err) => {
      console.error('Failed to load banners:', err);
      return [];
    }),
    getNavigationHierarchy().catch((err) => {
      console.error('Failed to load navigation categories:', err);
      return [];
    }),
    getDistricts(true).catch((err) => {
      console.error('Failed to load districts:', err);
      return [];
    }),
    getServices(true).catch((err) => {
      console.error('Failed to load services:', err);
      return [];
    }),
    getTestimonials(true).catch((err) => {
      console.error('Failed to load testimonials:', err);
      return [];
    }),
    getWhyChooseUsData().catch((err) => {
      console.error('Failed to load why choose us data:', err);
      return null;
    }),
  ]);

  const faqItems = [
    {
      question: 'Expert & Certified Technicians',
      answer:
        'Our skilled, verified professionals have years of hands-on experience across appliance repair, electrical systems, and home maintenance. We ensure precision diagnosis and safe, lasting repairs on every visit.',
    },
    {
      question: 'Quick & Punctual Doorstep Service',
      answer:
        'We value your schedule. Our rapid-dispatch technicians arrive promptly with fully equipped tools and authentic parts to resolve your problems without unnecessary delays.',
    },
    {
      question: 'Transparent Pricing & Authentic Parts',
      answer:
        'No surprise fees or hidden charges. We provide upfront, fair pricing before beginning any repair work, using only genuine, manufacturer-backed replacement components.',
    },
    {
      question: 'Safe, Reliable & Satisfaction Guaranteed',
      answer:
        'Your complete peace of mind and home safety are our highest priorities. All our work is backed by a satisfaction warranty and friendly post-service support.',
    },
  ];

  return (
    <>
      <JsonLd data={buildOrganizationSchema(settings)} />
      <JsonLd data={buildLocalBusinessSchema(settings)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
        ])}
      />
      <JsonLd data={buildFaqSchema(faqItems)} />
      <HomeView
        settings={settings}
        banners={banners}
        categories={categories}
        districts={districts}
        services={services}
        testimonials={testimonials}
        whyChooseUs={whyChooseUs}
      />
    </>
  );
}
