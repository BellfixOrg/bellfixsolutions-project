'use client';

import { useState } from 'react';
import { Banner, District, Service, ServiceCategory, SiteSettings, Testimonial, WhyChooseUsSection } from '@/types';
import Header from './Header';
import HeroSlider from './HeroSlider';
import TrustBar from './TrustBar';
import CategoryServiceSections from './CategoryServiceSections';
import AboutSection from './AboutSection';
import WhyChooseUs from './WhyChooseUs';
import HowItWorks from './HowItWorks';
import TestimonialsSection from './TestimonialsSection';
import FinalCTA from './FinalCTA';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import BookingModal from './BookingModal';

interface HomeViewProps {
  settings?: SiteSettings | null;
  banners: Banner[];
  categories: ServiceCategory[];
  districts: District[];
  services: Service[];
  testimonials: Testimonial[];
  whyChooseUs?: WhyChooseUsSection | null;
}

export default function HomeView({
  settings,
  banners,
  categories,
  districts,
  services,
  testimonials,
  whyChooseUs,
}: HomeViewProps) {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceName, setSelectedServiceName] = useState<string | undefined>();

  const handleOpenBooking = (serviceName?: string) => {
    setSelectedServiceName(serviceName);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation Header with Cascading Dropdowns */}
      <Header
        settings={settings}
        categories={categories}
        onOpenBooking={() => handleOpenBooking()}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 1. Hero Section Slider */}
        <HeroSlider
          banners={banners}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* 2. Trust Highlights Bar */}
        <TrustBar />

        {/* 3. About Bell Fix & Solutions */}
        {settings && <AboutSection settings={settings} />}

        {/* 4. Categorized Service Sections (Repair Services & Cleaning Services separately) */}
        <CategoryServiceSections
          categories={categories}
          services={services}
          districts={districts}
          onBookNow={(name) => handleOpenBooking(name)}
        />

        {/* 5. Why Choose Us (Left image, right accordion) */}
        <WhyChooseUs data={whyChooseUs} />

        {/* 6. How It Works Process */}
        <HowItWorks />

        {/* 7. Customer Testimonials */}
        <TestimonialsSection testimonials={testimonials} />

        {/* 8. Final CTA Banner */}
        <FinalCTA settings={settings} />
      </main>

      {/* Footer */}
      <Footer settings={settings} services={services} />

      {/* Persistent Floating WhatsApp Action */}
      <FloatingWhatsApp settings={settings} />

      {/* Booking Popup Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        selectedServiceName={selectedServiceName}
        settings={settings}
      />
    </div>
  );
}
