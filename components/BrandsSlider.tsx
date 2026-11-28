'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Brand } from '@/types';

interface BrandsSliderProps {
  brands: Brand[];
}

export default function BrandsSlider({ brands }: BrandsSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Check if brand cards exceed/overflow the screen or container width
  useEffect(() => {
    if (!brands || brands.length === 0) return;
    const checkOverflow = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const isMobile = window.innerWidth < 640;
        const cardWidth = isMobile ? 150 : 180;
        const gap = isMobile ? 16 : 20;
        const totalContentWidth = brands.length * (cardWidth + gap);

        // Slide only when content width is greater than available container/screen width
        setIsOverflowing(totalContentWidth > containerWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [brands?.length]);

  // If no brands, don't render anything
  if (!brands || brands.length === 0) {
    return null;
  }

  // If overflowing, repeat list so it can scroll seamlessly in an infinite loop
  const displayBrands = isOverflowing
    ? [...brands, ...brands, ...brands, ...brands]
    : brands;

  return (
    <section className="py-10 sm:py-14 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Heading Only */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight text-center mb-8">
          WE REPAIR ALL BRANDS
        </h2>

        {/* Brand Logos Container */}
        <div ref={containerRef} className="relative overflow-hidden w-full py-2">
          {/* Subtle gradient fades only when sliding/overflowing */}
          {isOverflowing && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            </>
          )}

          {isOverflowing ? (
            /* Automatically moves Right-to-Left when overflowing the screen */
            <div className="flex items-center gap-6 sm:gap-8 animate-marquee select-none">
              {displayBrands.map((brand, idx) => (
                <div
                  key={`${brand.id}-${idx}`}
                  className="w-[140px] sm:w-[170px] h-16 sm:h-20 bg-transparent flex items-center justify-center shrink-0 group select-none px-2"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name || 'Brand Logo'}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      sizes="170px"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Centered in the middle of the screen when logos fit without overflowing */
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {displayBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="w-[140px] sm:w-[170px] h-16 sm:h-20 bg-transparent flex items-center justify-center shrink-0 group px-2"
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Image
                      src={brand.logo_url}
                      alt={brand.name || 'Brand Logo'}
                      fill
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      sizes="170px"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
