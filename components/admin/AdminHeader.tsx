'use client';

import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title: string;
  subtitle?: string;
}

export default function AdminHeader({
  onToggleSidebar,
  title,
  subtitle,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 sm:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-600 hover:text-black rounded-md hover:bg-gray-100"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#101820] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-[#667085] hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#F5F8FA] px-3 py-1.5 rounded-full text-xs text-[#101820] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">System Live</span>
        </div>
      </div>
    </header>
  );
}
