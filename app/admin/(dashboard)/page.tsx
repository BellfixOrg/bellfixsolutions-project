import Link from 'next/link';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Wrench,
  ArrowRight,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { getDashboardStats } from '@/lib/db';
import StatusBadge from '@/components/admin/StatusBadge';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: CalendarCheck,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'New Bookings',
      value: stats.newBookings,
      icon: Clock,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Completed Bookings',
      value: stats.completedBookings,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Active Services',
      value: stats.totalActiveServices,
      icon: Wrench,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xl shadow-xs no-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1c71cd] block mb-1">
            CONTROL CENTER
          </span>
          <h2 className="text-xl font-bold text-[#101820] tracking-tight">
            Welcome to Bell Fix Operations
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-0.5">
            Real-time database analytics and live customer service requests.
          </p>
        </div>

        <Link
          href="/admin/bookings"
          className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-2xs flex items-center gap-2"
        >
          <span>Manage All Bookings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Dynamic Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl shadow-xs no-border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#667085] tracking-wide">
                  {item.title}
                </span>
                <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#101820] tracking-tight">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-xs no-border overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#101820] tracking-tight">
              Recent Customer Bookings
            </h3>
            <p className="text-xs text-[#667085]">
              Latest entries received from the website booking forms.
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-semibold text-[#1c71cd] hover:underline"
          >
            View all ({stats.totalBookings})
          </Link>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#667085]">
            No bookings recorded yet. New submissions will appear here automatically.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F5F8FA] text-[#667085] text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Quick Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#101820]">
                {stats.recentBookings.map((bk) => {
                  const cleanPhone = bk.phone.replace(/[^0-9+]/g, '');
                  const cleanWA = bk.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr key={bk.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        <div>{bk.customer_name}</div>
                        <div className="text-xs text-[#667085] font-normal">{bk.phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#101820]">{bk.service_name}</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#667085]">
                        {bk.preferred_date}
                      </td>
                      <td className="py-3.5 px-4 text-[#667085] max-w-xs truncate">
                        {bk.location}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={bk.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${cleanWA}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="w-7 h-7 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-colors"
                            title="Call Customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
