import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { getNavigationHierarchy, getServices, getSiteSettings } from '@/lib/db';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog & Home Appliance Maintenance Tips | Bell Fix & Solutions',
  description: 'Expert advice, maintenance guides, and appliance repair tips from Bell Fix & Solutions.',
};

export default async function BlogPage() {
  const [settings, categories, services] = await Promise.all([
    getSiteSettings().catch(() => null),
    getNavigationHierarchy().catch(() => []),
    getServices(true).catch(() => []),
  ]);

  const blogPosts = [
    {
      title: 'How Often Should You Service Your Air Conditioner?',
      category: 'Repair Tips',
      date: 'November 2026',
      readTime: '4 min read',
      excerpt:
        'Regular filter cleaning and timely gas checks prevent unexpected breakdowns and reduce electricity bills significantly.',
    },
    {
      title: 'Top Signs Your Washing Machine Needs Urgent Repair',
      category: 'Appliance Care',
      date: 'November 2026',
      readTime: '3 min read',
      excerpt:
        'Excessive vibration, water leakage, or drum grinding noises indicate mechanical issues that require certified technician attention.',
    },
    {
      title: 'Why Deep Water Tank Cleaning is Crucial for Family Health',
      category: 'Cleaning Services',
      date: 'November 2026',
      readTime: '5 min read',
      excerpt:
        'Sludge buildup and bacterial growth in residential water tanks can cause water contamination. Learn how professional sanitization protects your family.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header settings={settings} categories={categories} />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#101820] text-white py-14 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-3 bg-[#102A43] px-3.5 py-1.5 rounded-full">
              Latest Insights & Advice
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Blog & Appliance Care Guides
            </h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Helpful tips, maintenance checklists, and professional guidance to keep your home appliances running smoothly.
            </p>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <article
                key={idx}
                className="bg-[#F5F8FA] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="font-bold text-[#1c71cd]">{post.category}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#101820] mb-3 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{post.date}</span>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1c71cd] hover:underline"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <Footer settings={settings} services={services} />
      <FloatingWhatsApp settings={settings} />
    </div>
  );
}

