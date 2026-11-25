'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { WhyChooseUsSection } from '@/types';

interface WhyChooseUsProps {
  data?: WhyChooseUsSection | null;
}

const DEFAULT_DATA: WhyChooseUsSection = {
  heading: 'Why Choose Us',
  subheading: 'ADVANTAGES',
  description:
    'We go beyond just service — we deliver trust, quality, and long-term support for your home.',
  image_url:
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
  items: [
    {
      id: 'item-1',
      question: 'Expert & Certified Technicians',
      answer:
        'Our skilled, verified professionals have years of hands-on experience across appliance repair, electrical systems, and home maintenance. We ensure precision diagnosis and safe, lasting repairs on every visit.',
      display_order: 1,
      is_active: true,
    },
    {
      id: 'item-2',
      question: 'Quick & Punctual Doorstep Service',
      answer:
        'We value your schedule. Our rapid-dispatch technicians arrive promptly with fully equipped tools and authentic parts to resolve your problems without unnecessary delays.',
      display_order: 2,
      is_active: true,
    },
    {
      id: 'item-3',
      question: 'Transparent Pricing & Authentic Parts',
      answer:
        'No surprise fees or hidden charges. We provide upfront, fair pricing before beginning any repair work, using only genuine, manufacturer-backed replacement components.',
      display_order: 3,
      is_active: true,
    },
    {
      id: 'item-4',
      question: 'Safe, Reliable & Satisfaction Guaranteed',
      answer:
        'Your complete peace of mind and home safety are our highest priorities. All our work is backed by a satisfaction warranty and friendly post-service support.',
      display_order: 4,
      is_active: true,
    },
  ],
};

export default function WhyChooseUs({ data: propData }: WhyChooseUsProps) {
  const currentData = propData || DEFAULT_DATA;
  const activeItems = (currentData.items || []).filter((i) => i.is_active);

  // Default first accordion item opened (index 0)
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-16 sm:py-24 bg-white text-[#101820] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Feature Image */}
          <div className="lg:col-span-5 relative flex flex-col">
            <div className="relative w-full h-[280px] sm:h-[340px] lg:h-full min-h-[300px] rounded-xl overflow-hidden shadow-lg group">
              <Image
                src={currentData.image_url || DEFAULT_DATA.image_url}
                alt={currentData.heading || 'Why Choose Us'}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>

          {/* Right Column: Accordion Section */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Header Text */}
            <div className="mb-8">
              {currentData.subheading && (
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1c71cd] mb-2 inline-block font-nav">
                  {currentData.subheading}
                </span>
              )}
              <h2 className="text-[20px] sm:text-[26px] font-semibold text-[#101820] tracking-tight mb-3 font-heading">
                {currentData.heading || 'Why Choose Us'}
              </h2>
              {currentData.description && (
                <p className="text-sm text-[#475467] leading-[1.6] max-w-2xl font-body">
                  {currentData.description}
                </p>
              )}
            </div>

            {/* Accordion Questions & Answers */}
            <div className="space-y-3.5">
              {activeItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={item.id || index}
                    className={`rounded-xl transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#F2F6FA] shadow-xs'
                        : 'bg-[#F8FAFC] hover:bg-[#F2F6FA]/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(index)}
                      className="w-full px-5 py-4 sm:py-4.5 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                      aria-expanded={isOpen}
                    >
                      <span className="font-semibold text-[#101820] text-[13px] sm:text-sm pr-2 tracking-tight">
                        {item.question}
                      </span>
                      {/* Round animated Plus icon */}
                      <div
                        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 shadow-xs ${
                          isOpen
                            ? 'bg-[#1c71cd] text-white rotate-45 scale-105'
                            : 'bg-white text-[#101820] hover:bg-[#1c71cd] hover:text-white rotate-0'
                        }`}
                        title={isOpen ? 'Collapse answer' : 'Expand answer'}
                      >
                        <Plus className="w-4 h-4 transition-transform duration-300" />
                      </div>
                    </button>

                    {/* Smooth expanding Answer block */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out px-5 ${
                        isOpen
                          ? 'grid-rows-[1fr] pb-4.5 opacity-100'
                          : 'grid-rows-[0fr] pb-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-[13px] text-[#475467] leading-relaxed pt-1 font-body">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
