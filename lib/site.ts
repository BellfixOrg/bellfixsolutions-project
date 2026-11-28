/**
 * Centralized site configuration and canonical URL utilities
 * Official production domain: https://bellfixsolutions.com
 */

export const SITE_URL = 'https://bellfixsolutions.com';
export const SITE_NAME = 'Bell Fix & Solutions';

/**
 * Returns an absolute URL using the canonical production domain.
 * Ensures clean leading slashes and prevents duplicate trailing slashes.
 */
export function absoluteUrl(path: string = ''): string {
  if (!path || path === '/') {
    return SITE_URL;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

export const DEFAULT_OG_IMAGE = absoluteUrl('/og-image.jpg');

/**
 * Pure helper to generate/derive a URL-friendly slug for a blog article.
 * Fully isomorphic (safe for server and client components).
 */
export function getBlogSlug(post: { slug?: string; title?: string; id?: string }): string {
  if (post.slug && post.slug.trim()) {
    return post.slug.trim();
  }
  const base = (post.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return base || post.id || '';
}


