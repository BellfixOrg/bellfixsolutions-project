import { notFound, permanentRedirect } from 'next/navigation';
import { getServiceBySlug } from '@/lib/db';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string; serviceSlug: string }>;
  searchParams: Promise<{ location?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; serviceSlug: string }> }) {
  const { slug: categorySlug, serviceSlug } = await params;
  const service = await getServiceBySlug(serviceSlug, categorySlug).catch(() => null);
  if (!service) return { title: 'Service Not Found | Bell Fix & Solutions' };

  const title = `${service.name} – ${service.category_name || 'Home Services'} | Bell Fix & Solutions`;
  const description = service.short_description || `Professional ${service.name} service and repair.`;
  const canonical = absoluteUrl(`/services/${service.slug}`);
  const ogImage = service.cover_image || DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: ogImage,
          alt: service.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DynamicCategoryServicePage({ params, searchParams }: PageProps) {
  const { slug: categorySlug, serviceSlug } = await params;
  const { location: locationQuery } = await searchParams;

  const service = await getServiceBySlug(serviceSlug, categorySlug).catch(() => null);
  if (!service) {
    notFound();
  }

  const queryPart = locationQuery ? `?location=${encodeURIComponent(locationQuery)}` : '';
  permanentRedirect(`/services/${service.slug}${queryPart}`);
}

