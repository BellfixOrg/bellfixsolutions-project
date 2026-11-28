import type { MetadataRoute } from 'next';
import { getBlogPosts, getBlogSlug, getServiceCategories, getServices } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const seenUrls = new Set<string>(staticRoutes.map((r) => r.url));
  const dynamicEntries: MetadataRoute.Sitemap = [];

  try {
    // 1. Fetch active service categories
    const categories = await getServiceCategories(true).catch((err) => {
      console.error('Failed to load categories for sitemap:', err);
      return [];
    });

    for (const category of categories) {
      if (category.is_active && category.slug) {
        const url = `${SITE_URL}/services/${category.slug}`;
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          dynamicEntries.push({
            url,
            lastModified: category.updated_at ? new Date(category.updated_at) : currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }

    // 2. Fetch active services (canonical pattern: /services/[slug])
    const services = await getServices(true).catch((err) => {
      console.error('Failed to load services for sitemap:', err);
      return [];
    });

    for (const service of services) {
      if (service.is_active && service.slug) {
        const url = `${SITE_URL}/services/${service.slug}`;
        if (!seenUrls.has(url)) {
          seenUrls.add(url);
          dynamicEntries.push({
            url,
            lastModified: service.updated_at ? new Date(service.updated_at) : currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
          });
        }
      }
    }

    // 3. Fetch active blog articles (canonical pattern: /blog/[slug])
    const blogs = await getBlogPosts(true).catch((err) => {
      console.error('Failed to load blog posts for sitemap:', err);
      return [];
    });

    for (const post of blogs) {
      if (post.is_active !== false) {
        const slug = getBlogSlug(post);
        if (slug) {
          const url = `${SITE_URL}/blog/${slug}`;
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            dynamicEntries.push({
              url,
              lastModified: post.updated_at ? new Date(post.updated_at) : currentDate,
              changeFrequency: 'weekly',
              priority: 0.7,
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('Error generating dynamic sitemap entries:', err);
  }

  return [...staticRoutes, ...dynamicEntries];
}
