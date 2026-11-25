import Link from 'next/link';
import { Phone, Mail, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { Service, SiteSettings } from '@/types';

interface FooterProps {
  settings?: SiteSettings | null;
  services: Service[];
}

export default function Footer({ settings, services }: FooterProps) {
  const cleanPhone = settings?.phone ? settings.phone.replace(/[^0-9+]/g, '') : '';
  const cleanWhatsApp = settings?.whatsapp_number ? settings.whatsapp_number.replace(/[^0-9]/g, '') : '';

  return (
    <footer className="bg-[#101820] text-gray-300 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
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

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#1c71cd] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#1c71cd]" /> Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#1c71cd] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#1c71cd]" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#1c71cd] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#1c71cd]" /> Our Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1c71cd] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#1c71cd]" /> Book Service / Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gray-300 transition-colors flex items-center gap-1.5 text-gray-500">
                  <ArrowRight className="w-3 h-3" /> Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Available Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Our Services
            </h4>
            {services.length === 0 ? (
              <p className="text-xs text-gray-500">No services listed yet.</p>
            ) : (
              <ul className="space-y-2.5 text-xs text-gray-400">
                {services.slice(0, 6).map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services/${service.slug}`}
                      className="hover:text-[#1c71cd] transition-colors flex items-center gap-1.5"
                    >
                      <ArrowRight className="w-3 h-3 text-[#1c71cd]" /> {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact Details */}
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

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3">
          <p>© {new Date().getFullYear()} {settings?.business_name || 'BELL FIX & SOLUTIONS'}. All rights reserved.</p>
          <p>Delivering excellence across residential and commercial properties.</p>
        </div>
      </div>
    </footer>
  );
}
