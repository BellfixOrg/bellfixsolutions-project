import { BookingStatus } from '@/types';

export type GeneralStatus = BookingStatus | 'active' | 'inactive' | string;

interface StatusBadgeProps {
  status: GeneralStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const configs: Record<string, { label: string; bg: string; text: string }> = {
    new: {
      label: 'New',
      bg: 'bg-sky-50',
      text: 'text-sky-700',
    },
    contacted: {
      label: 'Contacted',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
    confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
    },
    completed: {
      label: 'Completed',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
    },
    active: {
      label: 'Active',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    inactive: {
      label: 'Inactive',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
    },
  };

  const current = configs[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
}
