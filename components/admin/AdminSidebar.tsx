'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Wrench,
  MapPin,
  CalendarCheck,
  Settings,
  Image as ImageIcon,
  MessageSquareQuote,
  Info,
  HelpCircle,
  Tag,
  BookOpen,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';
import Logo from '../Logo';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavGroup {
  title: string;
  items: {
    name: string;
    href: string;
    icon: any;
  }[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navGroups: NavGroup[] = [
    {
      title: 'Main Dashboard',
      items: [{ name: 'Overview', href: '/admin', icon: LayoutDashboard }],
    },
    {
      title: 'Service Management',
      items: [
        { name: 'Category Management', href: '/admin/categories', icon: Layers },
        { name: 'Services Catalog', href: '/admin/services', icon: Wrench },
      ],
    },
    {
      title: 'Location Management',
      items: [{ name: 'Location Management', href: '/admin/districts', icon: MapPin }],
    },
    {
      title: 'Business Management',
      items: [
        { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
        { name: 'Website Settings', href: '/admin/settings', icon: Settings },
      ],
    },
    {
      title: 'Content Management',
      items: [
        { name: 'Hero Banners', href: '/admin/banners', icon: ImageIcon },
        { name: 'Brand Logos', href: '/admin/brands', icon: Tag },
        { name: 'Blog Posts', href: '/admin/blogs', icon: BookOpen },
        { name: 'Why Choose Us', href: '/admin/why-choose-us', icon: HelpCircle },
        { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
        { name: 'About Page', href: '/admin/about', icon: Info },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#101820] text-gray-300 flex flex-col justify-between transition-transform duration-300 overflow-y-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-5 flex items-center justify-between border-b border-gray-800/80 sticky top-0 bg-[#101820] z-10">
            <Logo light />
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden text-gray-400 hover:text-white p-1 cursor-pointer"
                aria-label="Close admin menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Groups */}
          <div className="py-4 space-y-5 px-3">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1c71cd]/90">
                    {group.title}
                  </span>
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#102A43] text-[#1c71cd] font-bold'
                          : 'text-gray-400 hover:bg-gray-800/60 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-800/80 space-y-2 sticky bottom-0 bg-[#101820]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#1c71cd] px-3 py-2 rounded-md hover:bg-gray-800/40 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Website</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-md hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
