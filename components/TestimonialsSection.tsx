import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const activeTestimonials = testimonials.filter((t) => t.is_active);

  if (activeTestimonials.length === 0) {
    return null;
  }

  const renderCard = (item: Testimonial, key: string | number) => (
    <div
      key={key}
      className="w-[300px] sm:w-[360px] shrink-0 bg-[#F5F8FA] rounded-xl p-6 sm:p-7 shadow-2xs flex flex-col justify-between no-border select-none"
    >
      <div>
        <Quote className="w-6 h-6 text-[#1c71cd] mb-3 opacity-60" />
        <p className="text-xs sm:text-sm text-[#101820] leading-relaxed italic mb-6">
          &ldquo;{item.review}&rdquo;
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/60">
        {item.avatar_url ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-white shadow-2xs">
            <Image
              src={item.avatar_url}
              alt={item.customer_name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#102A43] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {item.customer_name.charAt(0)}
          </div>
        )}

        <div>
          <h4 className="text-xs sm:text-sm font-bold text-[#101820]">
            {item.customer_name}
          </h4>
          {item.role_or_location && (
            <p className="text-[11px] text-[#667085]">
              {item.role_or_location}
            </p>
          )}
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < item.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-1.5 inline-block">
            REVIEWS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight mb-2.5">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Real feedback from our happy customers across the city.
          </p>
        </div>
      </div>

      {/* Single-row continuous right-to-left marquee */}
      <div className="w-full overflow-hidden">
        <div className="flex flex-row flex-nowrap animate-marquee">
          <div className="flex flex-row flex-nowrap shrink-0 gap-6 pr-6">
            {activeTestimonials.map((item, idx) =>
              renderCard(item, `t1-${item.id || idx}`)
            )}
          </div>
          <div className="flex flex-row flex-nowrap shrink-0 gap-6 pr-6" aria-hidden="true">
            {activeTestimonials.map((item, idx) =>
              renderCard(item, `t2-${item.id || idx}`)
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
