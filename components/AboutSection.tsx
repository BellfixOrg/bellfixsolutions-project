import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { SiteSettings } from '@/types';

interface AboutSectionProps {
  settings?: SiteSettings | null;
}

export default function AboutSection({ settings }: AboutSectionProps) {
  if (!settings) return null;

  const highlights = [
    'Trained and background-verified technicians',
    'Transparent pricing with zero hidden fees',
    'Genuine spare parts with standard warranties',
    'Prompt same-day scheduling for emergency fixes',
  ];

  return (
    <section className="py-16 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Column: Technician Photo */}
          <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-lg overflow-hidden shadow-sm">
            <Image
              src={settings.about_image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop'}
              alt="Bell Fix & Solutions technician at work"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute bottom-4 left-4 bg-[#102A43]/90 backdrop-blur-xs px-4 py-2 rounded-md flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1c71cd] animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                Certified In-House Crew
              </span>
            </div>
          </div>

          {/* Right Column: Editorial Text */}
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-2">
              ABOUT BELL FIX & SOLUTIONS
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight leading-tight mb-4">
              {settings.about_heading}
            </h2>

            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed mb-6">
              {settings.about_description}
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mb-8">
              {highlights.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1c71cd] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-[#101820] font-medium leading-tight">
                    {point}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/about"
              className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-xs flex items-center gap-2"
            >
              <span>Learn More</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
