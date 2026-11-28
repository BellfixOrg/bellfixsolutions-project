'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, X, BookOpen, MessageCircle, ExternalLink } from 'lucide-react';
import { BlogPost, SiteSettings } from '@/types';
import { getBlogSlug } from '@/lib/site';

interface BlogListClientProps {
  blogs: BlogPost[];
  settings?: SiteSettings | null;
}

export default function BlogListClient({ blogs, settings }: BlogListClientProps) {
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Lock background scroll when popup is open
  useEffect(() => {
    if (selectedBlog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBlog]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedBlog(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '919778215489';

  return (
    <>
      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {blogs.length === 0 ? (
          <div className="bg-[#F5F8FA] rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-white text-[#1c71cd] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#101820] mb-1">No Articles Published</h3>
            <p className="text-xs text-[#667085]">
              Blog posts and appliance care guides will appear here once added in the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="bg-[#F5F8FA] rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2.5">
                    <span className="font-bold text-[#1c71cd] bg-white px-2 py-0.5 rounded shadow-2xs">
                      {post.category}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{post.read_time || '3 min read'}</span>
                    </div>
                  </div>

                  <Link href={`/blog/${getBlogSlug(post)}`} className="block group/link">
                    <h3 className="text-sm sm:text-[15px] font-bold text-[#101820] mb-2 leading-snug group-hover/link:text-[#1c71cd] transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#667085] leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{post.date || 'Recent'}</span>
                  </div>

                  {/* Dual Action: Quick View Modal + Standalone HTML Link */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedBlog(post)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1c71cd] hover:text-[#165ba4] hover:underline cursor-pointer transition-colors"
                    >
                      <span>Quick View</span>
                    </button>
                    <span className="text-gray-300 text-xs">·</span>
                    <Link
                      href={`/blog/${getBlogSlug(post)}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#101820] hover:text-[#1c71cd] transition-colors"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Blog Details Popup Modal */}
      {selectedBlog && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedBlog(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-dropdown-menu"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-7 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-[#1c71cd] bg-blue-50 px-2.5 py-1 rounded-md inline-block mb-2">
                  {selectedBlog.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#101820] tracking-tight leading-snug">
                  {selectedBlog.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#1c71cd]" />
                    <span>{selectedBlog.date || 'Recent'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#1c71cd]" />
                    <span>{selectedBlog.read_time || '3 min read'}</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedBlog(null)}
                aria-label="Close details"
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Full Details */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
              {/* Short summary highlight box */}
              {selectedBlog.excerpt && (
                <div className="bg-[#F5F8FA] border-l-4 border-[#1c71cd] p-4 rounded-r-lg text-xs sm:text-sm text-[#101820] font-medium leading-relaxed">
                  {selectedBlog.excerpt}
                </div>
              )}

              {/* Detailed Article Body */}
              <div className="whitespace-pre-line text-xs sm:text-sm text-[#475467] leading-relaxed pt-2">
                {selectedBlog.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-[#F5F8FA] border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-[#667085] text-center sm:text-left">
                Need professional assistance? Our technicians are ready to help.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/blog/${getBlogSlug(selectedBlog)}`}
                  className="inline-flex items-center justify-center gap-1 px-3.5 py-2 bg-white hover:bg-gray-50 text-[#101820] text-xs font-bold rounded-lg border border-gray-200 transition-colors w-full sm:w-auto"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#1c71cd]" />
                  <span>Full Article</span>
                </Link>
                {cleanWhatsApp && (
                  <a
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                      `Hello Bell Fix & Solutions, I read your article "${selectedBlog.title}" and would like to enquire about your services.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg transition-colors shadow-2xs w-full sm:w-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Us</span>
                  </a>
                )}
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-colors w-full sm:w-auto cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

