'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Phone,
  MessageSquare,
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Booking, BookingStatus } from '@/types';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import Modal from '@/components/admin/Modal';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && selectedBooking.id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBooking) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.id !== selectedBooking.id));
        setDeleteModalOpen(false);
        setDetailsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to delete booking:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions: { label: string; value: BookingStatus | 'all' }[] = [
    { label: 'All Bookings', value: 'all' },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101820] tracking-tight">
            Bookings & Inquiries
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage customer appointments, update statuses, and call or WhatsApp clients directly.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs no-border flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter search keywords by name, phone, or location"
            className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-gray-400 hidden sm:block mr-1" />
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-[#101820] text-white'
                  : 'bg-[#F5F8FA] text-[#667085] hover:bg-gray-200/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-xs no-border overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
            <span>Loading database records...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#667085]">
            No bookings found in the database matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#F5F8FA] text-[#667085] text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Preferred Date</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[#101820]">
                {bookings.map((booking) => {
                  const cleanPhone = booking.phone.replace(/[^0-9+]/g, '');
                  const cleanWA = booking.phone.replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setDetailsModalOpen(true);
                          }}
                          className="text-left hover:text-[#1c71cd] transition-colors"
                        >
                          <div className="text-xs sm:text-sm font-bold text-[#101820]">
                            {booking.customer_name}
                          </div>
                          <div className="text-xs text-[#667085] font-normal">
                            {booking.phone}
                          </div>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <div className="font-semibold text-[#101820]">{booking.service_name}</div>
                        {(booking.category_name || booking.subcategory_name) && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            {booking.category_name && <span>{booking.category_name}</span>}
                            {booking.category_name && booking.subcategory_name && <span>&bull;</span>}
                            {booking.subcategory_name && <span>{booking.subcategory_name}</span>}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[#667085]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{booking.preferred_date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#667085] max-w-xs truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{booking.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(booking.id, e.target.value as BookingStatus)
                          }
                          className="bg-[#F5F8FA] text-xs font-semibold py-1 px-2.5 rounded-full focus:outline-none cursor-pointer"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="w-7 h-7 rounded-md bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white flex items-center justify-center transition-colors"
                            title={`Call ${booking.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`https://wa.me/${cleanWA}?text=${encodeURIComponent(
                              `Hello ${booking.customer_name}, regarding your ${booking.service_name} booking with Bell Fix & Solutions...`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setDeleteModalOpen(true);
                            }}
                            className="w-7 h-7 rounded-md bg-red-50 text-red-600 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete booking"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title={`Booking Details #${selectedBooking.id.slice(0, 8)}`}
          subtitle={`Submitted on ${new Date(selectedBooking.created_at || '').toLocaleDateString()}`}
        >
          <div className="space-y-5 text-xs sm:text-sm text-[#101820]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Status</span>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Customer Name
                </span>
                <span className="text-sm sm:text-base font-bold text-[#101820]">
                  {selectedBooking.customer_name}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Phone Number
                </span>
                <span className="text-sm sm:text-base font-bold text-[#101820]">
                  {selectedBooking.phone}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Main Category
                </span>
                <span className="font-semibold text-[#101820]">
                  {selectedBooking.category_name || '—'}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Subcategory
                </span>
                <span className="font-semibold text-[#101820]">
                  {selectedBooking.subcategory_name || '—'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Selected Service
                </span>
                <span className="font-semibold text-[#101820]">
                  {selectedBooking.service_name}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Preferred Date
                </span>
                <span className="font-semibold text-[#101820]">
                  {selectedBooking.preferred_date}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Location / Address
              </span>
              <div className="bg-[#F5F8FA] p-3 rounded-md text-[#101820]">
                {selectedBooking.location}
              </div>
            </div>

            {selectedBooking.message && (
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Customer Message / Notes
                </span>
                <div className="bg-[#F5F8FA] p-3 rounded-md text-[#101820] italic">
                  &ldquo;{selectedBooking.message}&rdquo;
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${selectedBooking.phone.replace(/[^0-9+]/g, '')}`}
                  className="bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Client</span>
                </a>
                <a
                  href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3.5 py-2 rounded-md font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <button
                onClick={() => {
                  setDetailsModalOpen(false);
                  setDeleteModalOpen(true);
                }}
                className="text-red-500 hover:text-red-700 px-3 py-2 text-xs font-semibold cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </Modal>
      )}

      {selectedBooking && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={`booking from ${selectedBooking.customer_name} (${selectedBooking.service_name})`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
