import { Service } from '@/types';
import ServiceCard from './ServiceCard';
import { Wrench } from 'lucide-react';

interface ServiceGridProps {
  services: Service[];
  onBookNow?: (serviceName: string) => void;
  title?: string;
  subtitle?: string;
}

export default function ServiceGrid({
  services,
  onBookNow,
  title = 'Our Services',
  subtitle = 'Complete home service solutions for your comfort and peace of mind.',
}: ServiceGridProps) {
  const activeServices = services.filter((s) => s.is_active);

  return (
    <section className="py-4 sm:py-10 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] mb-1.5 inline-block">
            SERVICES
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101820] tracking-tight mb-2.5">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Empty State if database has no active services */}
        {activeServices.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center max-w-md mx-auto shadow-xs no-border">
            <div className="w-12 h-12 rounded-full bg-[#F5F8FA] text-[#1c71cd] flex items-center justify-center mx-auto mb-3">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#101820] mb-1">
              No Services Available Yet
            </h3>
            <p className="text-xs text-[#667085]">
              Services stored in Supabase will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {activeServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBookNow={onBookNow}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
