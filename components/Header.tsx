'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Calendar,
  ChevronDown,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import Logo from './Logo';
import ServiceIcon from './ServiceIcon';
import { District, Service, ServiceCategory, SiteSettings } from '@/types';

interface HeaderProps {
  settings?: SiteSettings | null;
  categories?: ServiceCategory[];
  onOpenBooking?: () => void;
}

// Module-level navigation cache to prevent reloading/flicker across page navigations
let globalCachedCategories: ServiceCategory[] | null = null;

export default function Header({
  settings,
  categories: initialCategories,
  onOpenBooking,
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize with initialCategories so server HTML matches client hydration perfectly
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories || []);

  // Hover states for desktop cascading dropdowns (Category -> Service -> Locations)
  const [activeCategoryHover, setActiveCategoryHover] = useState<string | null>(null);
  const [activeServiceHover, setActiveServiceHover] = useState<string | null>(null);

  // Accordion states for mobile menu
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [expandedMobileService, setExpandedMobileService] = useState<string | null>(null);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch navigation hierarchy only once; hydration-safe caching
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
      try {
        localStorage.setItem('bellfix_nav_categories', JSON.stringify(initialCategories));
      } catch {}
      return;
    }

    if (categories.length > 0) {
      return;
    }

    try {
      const stored = localStorage.getItem('bellfix_nav_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
          return;
        }
      }
    } catch {}

    let isMounted = true;
    fetch('/api/navigation')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
          try {
            localStorage.setItem('bellfix_nav_categories', JSON.stringify(data.data));
          } catch {}
          setCategories(data.data);
        }
      })
      .catch((err) => console.error('Failed to load navigation hierarchy:', err));

    return () => {
      isMounted = false;
    };
  }, [initialCategories, categories.length]);

  // When clicking a location inside a service dropdown
  const handleLocationClick = (
    category: ServiceCategory,
    service: Service,
    district: District,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    // Save selected location
    localStorage.setItem('bellfix_selected_district', JSON.stringify(district));
    window.dispatchEvent(new CustomEvent('bellfix_district_changed', { detail: district }));

    // Close dropdowns
    setActiveCategoryHover(null);
    setActiveServiceHover(null);
    setMobileMenuOpen(false);

    // Route to service details for that service and location
    router.push(`/services/${service.slug}?location=${district.slug}`);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-200 bg-white ${
          isScrolled ? 'shadow-sm py-3.5' : 'py-4.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo from public/logo.png */}
            <Logo />

            {/* Desktop Navigation Links & Cascading Flyout Dropdowns */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-7">
              <nav className="flex items-center space-x-5 lg:space-x-6">
                {/* 1. Home */}
                <Link
                  href="/"
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    pathname === '/' ? 'text-[#1c71cd]' : 'text-[#101820] hover:text-[#1c71cd]'
                  }`}
                >
                  Home
                </Link>

                {/* 2. Dynamic Categories with Cascading Dropdowns: Category -> Services -> Locations */}
                {categories.map((category) => {
                  const isCatActive = pathname.startsWith(`/services/${category.slug}`);
                  const isCatOpen = activeCategoryHover === category.id;
                  const serviceList = category.services || [];

                  return (
                    <div
                      key={category.id}
                      className="relative"
                      onMouseEnter={() => {
                        setActiveCategoryHover(category.id);
                        // Rule: Hovering on category shows its services, NOT available locations yet!
                        setActiveServiceHover(null);
                      }}
                      onMouseLeave={() => {
                        setActiveCategoryHover(null);
                        setActiveServiceHover(null);
                      }}
                    >
                      {/* Category Nav Trigger */}
                      <button
                        className={`flex items-center gap-1.5 text-sm font-bold tracking-wide transition-colors py-3 cursor-pointer ${
                          isCatActive ? 'text-[#1c71cd]' : 'text-[#101820] hover:text-[#1c71cd]'
                        }`}
                        onClick={() => router.push(`/services/${category.slug}`)}
                      >
                        <span>{category.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ease-out ${
                            isCatOpen ? 'rotate-180 text-[#1c71cd]' : 'text-[#101820]'
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu with smooth entry animation */}
                      {isCatOpen && serviceList.length > 0 && (
                        <div className="absolute left-0 top-full pt-1.5 z-50 animate-dropdown-menu">
                          <div
                            className="bg-white border-t-2 border-[#1c71cd] shadow-xl rounded-b-md w-[230px] sm:w-[250px] py-2 relative"
                            onMouseLeave={() => setActiveServiceHover(null)}
                          >
                            {serviceList.map((service) => {
                              const isServActive = activeServiceHover === service.id;

                              return (
                                <div
                                  key={service.id}
                                  className="relative"
                                  onMouseEnter={() => setActiveServiceHover(service.id)}
                                >
                                  {/* Service Item Row */}
                                  <div
                                    onClick={() => {
                                      setActiveCategoryHover(null);
                                      setActiveServiceHover(null);
                                      router.push(`/services/${service.slug}`);
                                    }}
                                    className={`flex items-center justify-between px-5 py-2.5 text-sm cursor-pointer transition-colors ${
                                      isServActive
                                        ? 'text-[#1c71cd] bg-[#F5F8FA] font-bold'
                                        : 'text-[#101820] hover:text-[#1c71cd] hover:bg-[#F5F8FA] font-medium'
                                    }`}
                                  >
                                    <span className="truncate pr-3">{service.name}</span>
                                    <ChevronRight
                                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${
                                        isServActive ? 'text-[#1c71cd] translate-x-0.5' : 'text-gray-400'
                                      }`}
                                    />
                                  </div>

                                  {/* Locations Flyout Submenu: Opens on that SAME LINE (left-full top-0) */}
                                  {isServActive && (
                                    <div
                                      className="absolute left-full top-0 min-w-[170px] bg-white shadow-xl py-1.5 flex flex-col z-50 border-l border-gray-100 rounded-r-md animate-flyout-submenu"
                                      onMouseEnter={() => setActiveServiceHover(service.id)}
                                    >
                                      {service.districts && service.districts.length > 0 ? (
                                        service.districts.map((district) => (
                                          <button
                                            key={district.id}
                                            onClick={(e) =>
                                              handleLocationClick(category, service, district, e)
                                            }
                                            className="px-5 py-2 text-sm text-[#101820] hover:text-[#1c71cd] hover:bg-[#F5F8FA] transition-colors text-left font-medium cursor-pointer truncate"
                                          >
                                            {district.name}
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-5 py-2 text-xs text-gray-500 italic">
                                          All Locations
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 3. About */}
                <Link
                  href="/about"
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    pathname === '/about' ? 'text-[#1c71cd]' : 'text-[#101820] hover:text-[#1c71cd]'
                  }`}
                >
                  About
                </Link>

                {/* 4. Blog */}
                <Link
                  href="/blog"
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    pathname === '/blog' ? 'text-[#1c71cd]' : 'text-[#101820] hover:text-[#1c71cd]'
                  }`}
                >
                  Blog
                </Link>

                {/* 5. Contact */}
                <Link
                  href="/contact"
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    pathname === '/contact'
                      ? 'text-[#1c71cd]'
                      : 'text-[#101820] hover:text-[#1c71cd]'
                  }`}
                >
                  Contact
                </Link>
              </nav>

              {/* Increased Size Book Service Action Button */}
              {onOpenBooking ? (
                <button
                  onClick={onOpenBooking}
                  className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Service</span>
                </button>
              ) : (
                <Link
                  href="/contact"
                  className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-6 py-2.5 sm:px-8 sm:py-3 rounded-full text-sm font-bold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Service</span>
                </Link>
              )}
            </div>

            {/* Mobile Header Actions */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#101820] hover:text-[#1c71cd] focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown & Accordion Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-xl px-5 pt-3 pb-6 mt-3 space-y-3 max-h-[80vh] overflow-y-auto">
            {/* Home */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-[#101820] hover:text-[#1c71cd]"
            >
              Home
            </Link>

            {/* Dynamic Categories with Accordions */}
            {categories.map((category) => {
              const isExpanded = expandedMobileCategory === category.id;

              return (
                <div key={category.id} className="border-b border-gray-100 pb-2">
                  <button
                    onClick={() =>
                      setExpandedMobileCategory(isExpanded ? null : category.id)
                    }
                    className="w-full flex items-center justify-between py-2 text-base font-bold text-[#101820] hover:text-[#1c71cd] text-left cursor-pointer"
                  >
                    <span>{category.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180 text-[#1c71cd]' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {/* Services Accordion Content */}
                  {isExpanded && category.services && (
                    <div className="pl-3 py-1 space-y-2">
                      {category.services.map((service) => {
                        const isServExpanded = expandedMobileService === service.id;

                        return (
                          <div key={service.id} className="bg-[#F5F8FA] rounded-lg p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/services/${service.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-xs font-bold text-[#101820] hover:text-[#1c71cd] flex items-center gap-2"
                              >
                                <ServiceIcon name={service.icon || 'Wrench'} className="w-3.5 h-3.5 text-[#1c71cd]" />
                                <span>{service.name}</span>
                              </Link>

                              <button
                                onClick={() =>
                                  setExpandedMobileService(isServExpanded ? null : service.id)
                                }
                                className="text-[11px] text-[#1c71cd] font-bold px-2 py-0.5 rounded cursor-pointer"
                              >
                                {isServExpanded ? 'Hide Locations' : 'Locations'}
                              </button>
                            </div>

                            {/* Mobile Location Chips */}
                            {isServExpanded && (
                              <div className="pt-2 border-t border-gray-200/60 flex flex-wrap gap-1">
                                {(service.districts || []).map((district) => (
                                  <button
                                    key={district.id}
                                    onClick={(e) =>
                                      handleLocationClick(category, service, district, e)
                                    }
                                    className="px-2 py-1 bg-white text-[#101820] text-[10px] font-semibold rounded shadow-2xs hover:bg-[#1c71cd] hover:text-white transition-colors"
                                  >
                                    {district.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* About */}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-[#101820] hover:text-[#1c71cd]"
            >
              About
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-[#101820] hover:text-[#1c71cd]"
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-bold text-[#101820] hover:text-[#1c71cd]"
            >
              Contact
            </Link>

            {/* Book Service Action */}
            <div className="pt-2">
              {onOpenBooking ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenBooking();
                  }}
                  className="w-full bg-[#1c71cd] text-white hover:bg-[#165ba4] py-3.5 rounded-full text-sm font-bold tracking-wide text-center flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Service</span>
                </button>
              ) : (
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-[#1c71cd] text-white hover:bg-[#165ba4] py-3.5 rounded-full text-sm font-bold tracking-wide text-center flex items-center justify-center gap-2 shadow-sm block"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Service</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
