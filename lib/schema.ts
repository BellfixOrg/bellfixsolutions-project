/**
 * schema.ts – Schema.org JSON-LD builder utilities
 *
 * All functions return plain objects that can be passed to <JsonLd />.
 * Only verified, non-invented business data is included.
 * Fields that are null / undefined / empty are omitted.
 */

import { SITE_URL, absoluteUrl, getBlogSlug } from './site';
import { BlogPost } from '@/types';

// ─── Type helpers ────────────────────────────────────────────────────────────

type SiteSettings = {
  business_name?: string | null;
  logo_url?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
};

type ServiceEntity = {
  name: string;
  slug: string;
  short_description?: string | null;
  full_description?: string | null;
};

export type BreadcrumbItem = {
  name: string;
  url: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function omitEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')
  ) as Partial<T>;
}

function collectSameAs(settings: SiteSettings): string[] {
  return [
    settings.facebook_url,
    settings.instagram_url,
    settings.twitter_url,
    settings.linkedin_url,
  ].filter((u): u is string => Boolean(u));
}

// ─── Organization ─────────────────────────────────────────────────────────────

export function buildOrganizationSchema(settings: SiteSettings | null) {
  const name = settings?.business_name || 'Bell Fix & Solutions';
  const logoUrl = settings?.logo_url || absoluteUrl('/logo.png');
  const sameAs = settings ? collectSameAs(settings) : [];

  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  });
}

// ─── LocalBusiness / HomeAndConstructionBusiness ─────────────────────────────

export function buildLocalBusinessSchema(settings: SiteSettings | null) {
  const name = settings?.business_name || 'Bell Fix & Solutions';
  const logoUrl = settings?.logo_url || absoluteUrl('/logo.png');
  const sameAs = settings ? collectSameAs(settings) : [];

  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${SITE_URL}/#localbusiness`,
    name,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
    },
    image: logoUrl,
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.address
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: settings.address,
            addressCountry: 'IN',
          },
        }
      : {}),
    openingHours: ['Mo-Su 08:00-22:00'],
    areaServed: {
      '@type': 'State',
      name: 'Kerala',
    },
    priceRange: '₹₹',
    parentOrganization: {
      '@id': `${SITE_URL}/#organization`,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  });
}

// ─── Service ─────────────────────────────────────────────────────────────────

export function buildServiceSchema(service: ServiceEntity, settings: SiteSettings | null) {
  const description =
    service.short_description || service.full_description || `${service.name} by Bell Fix & Solutions`;

  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'State',
      name: 'Kerala',
    },
    ...(settings?.phone ? { telephone: settings.phone } : {}),
  });
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── FAQPage ─────────────────────────────────────────────────────────────────

export function buildFaqSchema(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── BlogPosting / Article ───────────────────────────────────────────────────

export function buildArticleSchema(post: BlogPost, settings: SiteSettings | null) {
  const slug = getBlogSlug(post);
  const articleUrl = absoluteUrl(`/blog/${slug}`);
  const headline = post.title;
  const description = post.excerpt || post.title;
  const imageUrl = post.image_url || absoluteUrl('/og-image.jpg');

  return omitEmpty({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline,
    description,
    image: imageUrl,
    ...(post.created_at || post.date ? { datePublished: post.created_at || post.date } : {}),
    ...(post.updated_at ? { dateModified: post.updated_at } : {}),
    author: {
      '@type': 'Organization',
      name: settings?.business_name || 'Bell Fix & Solutions',
      url: SITE_URL,
    },
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    url: articleUrl,
  });
}
