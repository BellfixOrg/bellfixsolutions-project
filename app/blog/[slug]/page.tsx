import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Phone,
  Share2,
  BookOpen,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import JsonLd from '@/components/JsonLd';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getBlogSlug,
  getNavigationHierarchy,
  getServices,
  getSiteSettings,
} from '@/lib/db';
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/site';
import { buildArticleSchema, buildBreadcrumbSchema } from '@/lib/schema';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug, true).catch(() => null);

  if (!post) {
    return {
      title: 'Article Not Found | Bell Fix & Solutions',
      description: 'The requested blog article could not be found.',
    };
  }

  const postSlug = getBlogSlug(post);
  const canonical = absoluteUrl(`/blog/${postSlug}`);
  const title = `${post.title} | Bell Fix & Solutions`;
  const description = post.excerpt || `Read ${post.title} on Bell Fix & Solutions.`;
  const ogImage = post.image_url || DEFAULT_OG_IMAGE;

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
      type: 'article',
      publishedTime: post.created_at || post.date,
      modifiedTime: post.updated_at,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
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

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const [post, settings, categories, services, allBlogs] = await Promise.all([
    getBlogPostBySlug(slug, true).catch(() => null),
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
    getBlogPosts(true).catch(() => []),
  ]);

  if (!post) {
    notFound();
  }

  const postSlug = getBlogSlug(post);
  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number
    ? settings.whatsapp_number.replace(/[^0-9]/g, '')
    : '919778215489';

  // Filter related articles (exclude current post, max 3)
  const relatedArticles = allBlogs
    .filter((b) => b.id !== post.id && getBlogSlug(b) !== postSlug)
    .slice(0, 3);

  return (
    <>
      {/* Structured Data: BlogPosting & BreadcrumbList */}
      <JsonLd data={buildArticleSchema(post, settings)} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: absoluteUrl('/') },
          { name: 'Blog', url: absoluteUrl('/blog') },
          { name: post.title, url: absoluteUrl(`/blog/${postSlug}`) },
        ])}
      />

      <div className="min-h-screen flex flex-col bg-white">
        <Header settings={settings} categories={categories} />

        <main className="flex-1">
          {/* Top Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="bg-[#F8FAFC] border-b border-gray-100 py-3"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ol className="flex items-center flex-wrap gap-1.5 text-xs text-gray-500">
                <li>
                  <Link
                    href="/"
                    className="hover:text-[#1c71cd] transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-[#1c71cd] transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </li>
                <li className="font-semibold text-[#101820] truncate max-w-[200px] sm:max-w-xs">
                  {post.title}
                </li>
              </ol>
            </div>
          </nav>

          {/* Article Header & Hero */}
          <header className="bg-[#101820] text-white py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center flex-wrap gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white bg-[#1c71cd] px-3 py-1 rounded-full shadow-2xs">
                  {post.category}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-[#1c71cd]" />
                  <span>{post.read_time || '3 min read'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-[#1c71cd]" />
                  <span>{post.date || 'Recent'}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white mb-4">
                {post.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            </div>
          </header>

          {/* Article Content Container */}
          <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {/* Optional Featured Image */}
            {post.image_url && (
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-10 shadow-sm border border-gray-100">
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 896px) 100vw, 896px"
                />
              </div>
            )}

            {/* Excerpt Callout */}
            {post.excerpt && (
              <div className="bg-[#F5F8FA] border-l-4 border-[#1c71cd] p-5 sm:p-6 rounded-r-xl mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                  Key Takeaway
                </span>
                <p className="text-sm sm:text-base text-[#101820] font-medium leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Semantic Article Body */}
            <div className="prose prose-slate max-w-none text-sm sm:text-base text-[#334155] leading-relaxed space-y-5">
              {post.content.split('\n\n').map((paragraph, idx) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;

                // Handle Subheadings (###)
                if (trimmed.startsWith('###')) {
                  const headingText = trimmed.replace(/^###\s*/, '');
                  return (
                    <h2
                      key={idx}
                      className="text-md sm:text-xl font-bold text-[#101820] pt-4 pb-1 border-b border-gray-100"
                    >
                      {headingText}
                    </h2>
                  );
                }

                // Handle Bullet Lists (- or *)
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  const items = trimmed
                    .split('\n')
                    .map((item) => item.replace(/^[-*]\s*/, '').trim())
                    .filter(Boolean);

                  return (
                    <ul key={idx} className="space-y-2 my-3 pl-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-[#1c71cd] shrink-0 mt-1" />
                          <span
                            className="text-xs sm:text-sm text-[#475467]"
                            dangerouslySetInnerHTML={{
                              __html: item.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="text-[#101820] font-bold">$1</strong>'
                              ),
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Handle Numbered Lists
                if (/^\d+\./.test(trimmed)) {
                  const items = trimmed
                    .split('\n')
                    .map((item) => item.replace(/^\d+\.\s*/, '').trim())
                    .filter(Boolean);

                  return (
                    <ol key={idx} className="space-y-2 my-3 pl-2">
                      {items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-[#1c71cd]/10 text-[#1c71cd] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {itemIdx + 1}
                          </span>
                          <span
                            className="text-xs sm:text-sm text-[#475467]"
                            dangerouslySetInnerHTML={{
                              __html: item.replace(
                                /\*\*(.*?)\*\*/g,
                                '<strong class="text-[#101820] font-bold">$1</strong>'
                              ),
                            }}
                          />
                        </li>
                      ))}
                    </ol>
                  );
                }

                // Normal Paragraph
                return (
                  <p
                    key={idx}
                    className="text-xs sm:text-sm text-[#475467] leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: trimmed.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-[#101820] font-bold">$1</strong>'
                      ),
                    }}
                  />
                );
              })}
            </div>

            {/* Author / Trust Verification Box */}
            <div className="mt-12 pt-8 border-t border-gray-100 bg-[#F8FAFC] rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                  Published by
                </span>
                <h3 className="text-base font-bold text-[#101820]">
                  Bell Fix & Solutions Technical Team
                </h3>
                <p className="text-xs text-[#667085] mt-1 max-w-lg leading-relaxed">
                  Certified technicians providing professional appliance repairs, AC maintenance, water tank sanitization, and deep cleaning services across Kerala.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {cleanWhatsApp && (
                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                      `Hello Bell Fix & Solutions, I read your article "${post.title}" and would like to consult or book a service.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Enquiry</span>
                  </a>
                )}
                {cleanPhone && (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101820] hover:bg-[#1c71cd] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
            </div>

            {/* Back to Blog Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1c71cd] hover:text-[#165ba4] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Articles</span>
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667085] hover:text-[#101820] transition-colors"
              >
                <span>Browse Our Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </article>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="bg-[#F5F8FA] py-12 sm:py-16 border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
                    Keep Reading
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#101820]">
                    Related Maintenance Guides
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {relatedArticles.map((rel) => {
                    const relSlug = getBlogSlug(rel);
                    return (
                      <Link
                        key={rel.id}
                        href={`/blog/${relSlug}`}
                        className="bg-white rounded-xl p-5 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group border border-transparent hover:border-gray-100"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                            <span className="font-bold text-[#1c71cd] bg-blue-50 px-2 py-0.5 rounded">
                              {rel.category}
                            </span>
                            <span className="text-gray-400">
                              {rel.read_time || '3 min read'}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-[#101820] group-hover:text-[#1c71cd] transition-colors mb-2 line-clamp-2">
                            {rel.title}
                          </h3>

                          <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                            {rel.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-[#1c71cd]">
                          <span>Read Guide</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </main>

        <Footer settings={settings} services={services} />
        {settings?.whatsapp_number && <FloatingWhatsApp settings={settings} />}
      </div>
    </>
  );
}
