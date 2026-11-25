'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Star, Loader2 } from 'lucide-react';
import { Testimonial } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: '',
    role_or_location: '',
    rating: 5,
    review: '',
    avatar_url: '',
    is_active: true,
    display_order: 1,
  });

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/testimonials?all=true');
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      customer_name: '',
      role_or_location: '',
      rating: 5,
      review: '',
      avatar_url: '',
      is_active: true,
      display_order: testimonials.length + 1,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      customer_name: item.customer_name,
      role_or_location: item.role_or_location || '',
      rating: item.rating,
      review: item.review,
      avatar_url: item.avatar_url || '',
      is_active: item.is_active,
      display_order: item.display_order,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.customer_name.trim() || !formData.review.trim()) {
      setFormError('Customer name and review text are required.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingItem ? `/api/testimonials/${editingItem.id}` : '/api/testimonials';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save testimonial');
      }

      setIsModalOpen(false);
      fetchTestimonials();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${itemToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== itemToDelete.id));
        setDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#101820] tracking-tight">
            Customer Testimonials
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage genuine customer reviews, ratings, and avatar photos.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
          <span>Loading testimonials...</span>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-xs text-xs sm:text-sm text-gray-500">
          No testimonials created yet in Supabase.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-5 shadow-xs no-border flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                    }`}
                  >
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#101820] italic leading-relaxed mb-4">
                  &ldquo;{item.review}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  {item.avatar_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      <Image src={item.avatar_url} alt={item.customer_name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#102A43] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {item.customer_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#101820]">{item.customer_name}</div>
                    <div className="text-xs text-[#667085]">{item.role_or_location || 'Customer'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        subtitle="Customer reviews must come from real client feedback."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm text-[#101820]">
          {formError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Enter customer name"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Location or Role
              </label>
              <input
                type="text"
                value={formData.role_or_location}
                onChange={(e) => setFormData({ ...formData, role_or_location: e.target.value })}
                placeholder="Enter location or role"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= formData.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs sm:text-sm font-bold text-gray-700 ml-2">
                {formData.rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Customer Review / Feedback *
            </label>
            <textarea
              rows={3}
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Enter customer review"
              className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
              required
            />
          </div>

          <ImageUploader
            value={formData.avatar_url}
            onChange={(url) => setFormData({ ...formData, avatar_url: url })}
            label="Customer Photo (Optional)"
            folder="testimonials"
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_check"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded text-[#1c71cd] focus:ring-[#1c71cd] w-4 h-4"
            />
            <label htmlFor="is_active_check" className="text-xs sm:text-sm font-semibold cursor-pointer">
              Visible on Website
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-[#101820] bg-[#1c71cd] hover:bg-[#165ba4] rounded-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Testimonial</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {itemToDelete && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={`review from ${itemToDelete.customer_name}`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
