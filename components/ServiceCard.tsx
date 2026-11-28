import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Service } from '@/types';
import ServiceIcon from './ServiceIcon';

interface ServiceCardProps {
  service: Service;
  onBookNow?: (serviceName: string) => void;
}

export default function ServiceCard({ service, onBookNow }: ServiceCardProps) {
  return (
    <div className="group bg-[#F5F8FA] rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col no-border">
      {/* Service Image */}
      <Link href={`/services/${service.slug}`} className="relative aspect-[4/3] w-full overflow-hidden block">
        <Image
          src={service.main_image}
          alt={service.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      {/* Card Content Footer with #F5F8FA background */}
      <div className="p-2.5 sm:p-5 flex items-center justify-between gap-2 sm:gap-3 flex-1 bg-[#F5F8FA]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Crisp Icon Badge */}
          <div className="hidden sm:flex w-9 h-9 rounded-md bg-white text-[#1c71cd] shadow-2xs items-center justify-center shrink-0">
            <ServiceIcon name={service.icon} className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <Link
              href={`/services/${service.slug}`}
              className="text-xs sm:text-sm font-bold text-[#101820] hover:text-[#1c71cd] transition-colors line-clamp-2 sm:line-clamp-1"
            >
              {service.name}
            </Link>
            <p className="hidden sm:line-clamp-2 text-[11px] text-[#667085] mt-0.5">
              {service.short_description}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {onBookNow ? (
          <button
            onClick={() => onBookNow(service.name)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1c71cd] group-hover:bg-[#1c71cd] group-hover:text-white shadow-2xs flex items-center justify-center transition-all shrink-0 cursor-pointer"
            title={`Book ${service.name}`}
            aria-label={`Book ${service.name}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={`/services/${service.slug}`}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#1c71cd] group-hover:bg-[#1c71cd] group-hover:text-white shadow-2xs flex items-center justify-center transition-all shrink-0"
            title={`View ${service.name}`}
            aria-label={`View ${service.name}`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
