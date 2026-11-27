'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { Service, SiteSettings } from '@/types';

interface FooterProps {
  settings?: SiteSettings | null;
  services: Service[];
}

export default function Footer({ settings, services }: FooterProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '';

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/about' },
    { label: 'Our Services', href: '/services' },
    { label: 'Book Service / Contact', href: '/contact' },
  ];

  const activeServices = services.slice(0, 6);

  return (
    <footer className="bg-[#101820] text-gray-300 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================================
            DESKTOP VIEW: Standard 4-Column Grid
        ========================================= */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* 1. Brand Info */}
          <div>
            <Logo light />
            <p className="mt-4 text-xs text-gray-400 leading-relaxed max-w-sm">
              Professional, reliable home maintenance, appliance repairs, and sanitation services delivered directly to your doorstep with guaranteed workmanship.
            </p>
            <div className="mt-5 flex items-center space-x-3">
              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="Phone"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* 2. Quick Links (Admin Portal removed) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-[#1c71cd] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Available Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Our Services
            </h4>
            {activeServices.length === 0 ? (
              <p className="text-xs text-gray-500">No services listed yet.</p>
            ) : (
              <ul className="space-y-2.5 text-xs text-gray-400">
                {activeServices.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="hover:text-[#1c71cd] transition-colors"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Contact Information
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              {settings?.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#1c71cd] shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings?.phone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#1c71cd] shrink-0" />
                  <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.whatsapp_number && (
                <li className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-[#1c71cd] shrink-0" />
                  <a
                    href={`https://wa.me/${cleanWhatsApp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    +{cleanWhatsApp} (WhatsApp)
                  </a>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#1c71cd] shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* =========================================
            MOBILE VIEW: Accordion (No Bottom Borders)
        ========================================= */}
        <div className="md:hidden mb-10">
          {/* Brand Info */}
          <div className="mb-6">
            <Logo light />
            <p className="mt-3 text-xs text-gray-400 leading-relaxed max-w-sm">
              Professional, reliable home maintenance, appliance repairs, and sanitation services delivered directly to your doorstep with guaranteed workmanship.
            </p>
            <div className="mt-4 flex items-center space-x-3">
              {cleanWhatsApp && (
                <a
                  href={`https://wa.me/${cleanWhatsApp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="Phone"
                >
                  <Phone className="w-4 h-4" />
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="w-8 h-8 rounded-full bg-[#102A43] flex items-center justify-center text-[#1c71cd] hover:bg-[#1c71cd] hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Accordion Group - Strictly without background colors and without bottom borders */}
          <div className="space-y-1">
            {/* 1. Quick Links Accordion */}
            <div className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('quick-links')}
                className="w-full flex items-center justify-between py-3 text-left cursor-pointer focus:outline-none"
                aria-expanded={!!openSections['quick-links']}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Quick Links
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    openSections['quick-links'] ? 'rotate-180 text-[#1c71cd]' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSections['quick-links']
                    ? 'grid-rows-[1fr] pb-3 opacity-100'
                    : 'grid-rows-[0fr] pb-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-2.5 text-xs text-gray-400 pt-1">
                    {quickLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="hover:text-[#1c71cd] transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Our Services Accordion */}
            <div className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('services')}
                className="w-full flex items-center justify-between py-3 text-left cursor-pointer focus:outline-none"
                aria-expanded={!!openSections['services']}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Our Services
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    openSections['services'] ? 'rotate-180 text-[#1c71cd]' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSections['services']
                    ? 'grid-rows-[1fr] pb-3 opacity-100'
                    : 'grid-rows-[0fr] pb-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  {activeServices.length === 0 ? (
                    <p className="text-xs text-gray-500 pt-1">No services listed yet.</p>
                  ) : (
                    <ul className="space-y-2.5 text-xs text-gray-400 pt-1">
                      {activeServices.map((service) => (
                        <li key={service.id}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="hover:text-[#1c71cd] transition-colors"
                          >
                            {service.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Contact Information Accordion */}
            <div className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('contact')}
                className="w-full flex items-center justify-between py-3 text-left cursor-pointer focus:outline-none"
                aria-expanded={!!openSections['contact']}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Contact Information
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                    openSections['contact'] ? 'rotate-180 text-[#1c71cd]' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  openSections['contact']
                    ? 'grid-rows-[1fr] pb-3 opacity-100'
                    : 'grid-rows-[0fr] pb-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden">
                  <ul className="space-y-3 text-xs text-gray-400 pt-1">
                    {settings?.address && (
                      <li className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-[#1c71cd] shrink-0 mt-0.5" />
                        <span>{settings.address}</span>
                      </li>
                    )}
                    {settings?.phone && (
                      <li className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-[#1c71cd] shrink-0" />
                        <a href={`tel:${cleanPhone}`} className="hover:text-white transition-colors">
                          {settings.phone}
                        </a>
                      </li>
                    )}
                    {settings?.whatsapp_number && (
                      <li className="flex items-center gap-2.5">
                        <MessageSquare className="w-4 h-4 text-[#1c71cd] shrink-0" />
                        <a
                          href={`https://wa.me/${cleanWhatsApp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors"
                        >
                          +{cleanWhatsApp} (WhatsApp)
                        </a>
                      </li>
                    )}
                    {settings?.email && (
                      <li className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-[#1c71cd] shrink-0" />
                        <a href={`mailto:${settings.email}`} className="hover:text-white transition-colors">
                          {settings.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================
            Bottom Copyright Bar
        ========================================= */}
        <div className="pt-6 sm:border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} {settings?.business_name || 'BELL FIX & SOLUTIONS'}. All rights reserved.</p>
          <p>
            Crafted by{' '}
            <a
              href="https://www.ekodrix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Ekodrix
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
