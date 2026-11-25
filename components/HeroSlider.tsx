'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Phone, ArrowRight } from 'lucide-react';
import { Banner } from '@/types';

interface HeroSliderProps {
  banners: Banner[];
  onOpenBooking?: () => void;
}

export default function HeroSlider({ banners, onOpenBooking }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeBanners = banners.filter((b) => b.is_active);
  const slides = activeBanners.length > 0 ? activeBanners : banners;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="relative w-full h-[540px] sm:h-[600px] lg:h-[660px] bg-[#101820] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Hero Banner Slider"
    >
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 w-full h-full">
              {slide.mobile_image_url ? (
                <>
                  {/* Desktop Banner Image */}
                  <Image
                    src={slide.background_image}
                    alt={slide.heading}
                    fill
                    priority={idx === 0}
                    className="object-cover object-center hidden sm:block"
                    sizes="100vw"
                  />
                  {/* Mobile Dedicated Banner Image */}
                  <Image
                    src={slide.mobile_image_url}
                    alt={`${slide.heading} (Mobile)`}
                    fill
                    priority={idx === 0}
                    className="object-cover object-center block sm:hidden"
                    sizes="100vw"
                  />
                </>
              ) : (
                <Image
                  src={slide.background_image}
                  alt={slide.heading}
                  fill
                  priority={idx === 0}
                  className="object-cover object-center"
                  sizes="100vw"
                />
              )}

              {/* Black gradient covering ONLY the content area (left side on desktop, bottom content area on mobile) */}
              <div className="hidden sm:block absolute inset-y-0 left-0 sm:w-[60%] lg:w-[48%] bg-gradient-to-r from-black/85 via-black/55 to-transparent pointer-events-none" />
              <div className="sm:hidden absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/95 via-black/75 via-50% to-transparent pointer-events-none" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-end justify-center pb-8 sm:pb-0 sm:items-center sm:justify-start">
              <div className="max-w-3xl text-center sm:text-left flex flex-col items-center sm:items-start pt-6 sm:pt-0">
                {slide.subheading && (
                  <span className="inline-block text-[#1c71cd] text-xs font-semibold tracking-widest uppercase mb-2 sm:mb-3 font-nav">
                    {slide.subheading}
                  </span>
                )}

                <h1 className="text-[26px] sm:text-[40px] font-semibold text-white leading-tight tracking-tight mb-4 sm:mb-4 font-heading">
                  {slide.heading}
                </h1>

                {/* Description hidden on mobile view */}
                <p className="hidden sm:block text-[16px] text-gray-200 leading-[1.6] mb-8 max-w-lg font-body">
                  {slide.description}
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 sm:mt-0">
                  {onOpenBooking ? (
                    <button
                      onClick={onOpenBooking}
                      className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{slide.cta_text || 'Contact Us'}</span>
                    </button>
                  ) : (
                    <Link
                      href={slide.cta_url || '/contact'}
                      className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all shadow-sm flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{slide.cta_text || 'Contact Us'}</span>
                    </Link>
                  )}

                  <Link
                    href="/services"
                    className="hidden sm:flex bg-transparent hover:bg-white/10 text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all items-center gap-1.5"
                  >
                    <span>Explore Services</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Next and Previous Buttons (Hidden on mobile) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#102A43]/60 hover:bg-[#1c71cd] text-white hover:text-[#101820] items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#102A43]/60 hover:bg-[#1c71cd] text-white hover:text-[#101820] items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Bottom slide bar indicators (Hidden on mobile) */}
      {slides.length > 1 && (
        <div className="hidden sm:flex absolute bottom-5 left-1/2 -translate-x-1/2 z-20 items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-6 bg-[#1c71cd]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
