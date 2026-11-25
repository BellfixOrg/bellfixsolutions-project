'use client';

import { Service, ServiceCategory } from '@/types';
import ServiceCard from './ServiceCard';
import { Wrench, Settings, Layers } from 'lucide-react';

interface CategoryServiceSectionsProps {
  categories: ServiceCategory[];
  services: Service[];
  districts?: unknown[];
  onBookNow?: (serviceName: string) => void;
}

export default function CategoryServiceSections({
  categories,
  services,
  onBookNow,
}: CategoryServiceSectionsProps) {
  // Filter all active services for each category
  const getServicesForCategory = (catId: string) => {
    return services.filter((s) => s.is_active && s.category_id === catId);
  };

  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <section className="py-14 sm:py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-24">
        {/* Categories Loop: Repair Services, Cleaning Services, etc. */}
        {activeCategories.length === 0 ? (
          <div className="bg-[#F5F8FA] rounded-2xl p-12 text-center max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-white text-[#1c71cd] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#101820] mb-1">
              No Service Categories Configured
            </h3>
            <p className="text-xs text-[#667085]">
              Categories and services configured in Supabase will appear here dynamically.
            </p>
          </div>
        ) : (
          activeCategories.map((category, index) => {
            const categoryServices = getServicesForCategory(category.id);
            const isFirst = index === 0;

            return (
              <div key={category.id} className="space-y-8">
                {/* Section Header for Main Category */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-1.5 inline-flex items-center gap-1.5">
                      {isFirst ? (
                        <Wrench className="w-3.5 h-3.5" />
                      ) : (
                        <Settings className="w-3.5 h-3.5" />
                      )}
                      <span>MAIN SERVICE CATEGORY</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-xs sm:text-sm text-[#667085] max-w-2xl mt-1 leading-relaxed">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Services Grid for Category */}
                {categoryServices.length === 0 ? (
                  <div className="bg-[#F5F8FA] rounded-xl p-8 text-center text-xs text-[#667085]">
                    No {category.name.toLowerCase()} are currently available.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {categoryServices.map((service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBookNow={onBookNow}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

