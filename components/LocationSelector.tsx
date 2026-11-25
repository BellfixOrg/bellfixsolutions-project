'use client';

import { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Search, X, Check } from 'lucide-react';
import { District } from '@/types';

interface LocationSelectorProps {
  districts?: District[];
  onSelect?: (district: District | null) => void;
  className?: string;
  variant?: 'header' | 'section';
}

export default function LocationSelector({
  districts: initialDistricts,
  onSelect,
  className = '',
  variant = 'header',
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>(initialDistricts || []);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch districts if not provided
  useEffect(() => {
    if (!initialDistricts || initialDistricts.length === 0) {
      fetch('/api/districts')
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setDistricts(d.data);
        })
        .catch((e) => console.error('Failed to load districts in selector:', e));
    } else {
      setDistricts(initialDistricts);
    }
  }, [initialDistricts]);

  // Load saved district from localStorage or set default
  useEffect(() => {
    const saved = localStorage.getItem('bellfix_selected_district');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedDistrict(parsed);
        if (onSelect) onSelect(parsed);
      } catch {
        // fallback
      }
    } else if (districts.length > 0) {
      const first = districts[0];
      setSelectedDistrict(first);
      localStorage.setItem('bellfix_selected_district', JSON.stringify(first));
      if (onSelect) onSelect(first);
    }

    const handleDistrictEvent = (e: any) => {
      if (e.detail) {
        setSelectedDistrict(e.detail);
      }
    };
    window.addEventListener('bellfix_district_changed', handleDistrictEvent);
    return () => window.removeEventListener('bellfix_district_changed', handleDistrictEvent);
  }, [districts, onSelect]);

  const handleSelectDistrict = (d: District | null) => {
    setSelectedDistrict(d);
    if (d) {
      localStorage.setItem('bellfix_selected_district', JSON.stringify(d));
    } else {
      localStorage.removeItem('bellfix_selected_district');
    }
    window.dispatchEvent(new CustomEvent('bellfix_district_changed', { detail: d }));
    if (onSelect) onSelect(d);
    setIsOpen(false);
  };

  const filtered = districts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F8FA] hover:bg-gray-100 text-[#101820] text-xs font-bold transition-all shadow-2xs cursor-pointer ${className}`}
          title="Select Service Coverage District"
        >
          <MapPin className="w-3.5 h-3.5 text-[#1c71cd] shrink-0" />
          <span className="truncate max-w-[120px]">
            {selectedDistrict ? selectedDistrict.name : 'Select District'}
          </span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      ) : (
        <div className={`p-4 bg-[#F5F8FA] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#102A43] text-[#1c71cd] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#1c71cd]">
                LOCATION AVAILABILITY
              </p>
              <h3 className="text-sm sm:text-base font-bold text-[#101820]">
                Showing Services in:{' '}
                <span className="text-[#1c71cd]">
                  {selectedDistrict ? selectedDistrict.name : 'Kerala Districts'}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="bg-white hover:bg-gray-50 text-[#101820] px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
          >
            <span>Change Location</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      )}

      {/* District Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#1c71cd]" />
                <h3 className="text-base font-bold text-[#101820]">
                  Select Your District
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#667085]">
              Choose your location to view certified technicians and instant service availability in your area.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search district name..."
                className="w-full pl-9 pr-3 py-2 bg-[#F5F8FA] rounded-lg text-xs text-[#101820] focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                autoFocus
              />
            </div>

            {/* Districts List */}
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pt-1">
              {filtered.map((d) => {
                const isSelected = selectedDistrict?.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDistrict(d)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#102A43] text-white'
                        : 'bg-[#F5F8FA] text-[#101820] hover:bg-gray-100'
                    }`}
                  >
                    <span>{d.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#1c71cd]" />}
                  </button>
                );
              })}
            </div>

            {/* All Districts Option */}
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
              <button
                onClick={() => handleSelectDistrict(null)}
                className="text-gray-500 hover:text-black font-semibold cursor-pointer"
              >
                Show All Districts
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-[#1c71cd] text-white font-bold rounded-lg cursor-pointer hover:bg-[#165ba4]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

