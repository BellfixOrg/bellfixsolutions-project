'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Banner } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    description: '',
    background_image: '',
    mobile_image_url: '',
    cta_text: 'Contact Us',
    cta_url: '/contact',
    display_order: 1,
    is_active: true,
  });

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      heading: '',
      subheading: '',
      description: '',
      background_image: '',
      mobile_image_url: '',
      cta_text: 'Contact Us',
      cta_url: '/contact',
      display_order: banners.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      heading: banner.heading,
      subheading: banner.subheading || '',
      description: banner.description,
      background_image: banner.background_image,
      mobile_image_url: banner.mobile_image_url || '',
      cta_text: banner.cta_text,
      cta_url: banner.cta_url,
      display_order: banner.display_order,
      is_active: banner.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.heading.trim() || !formData.background_image) {
      setFormError('Heading and background image are required.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save hero banner');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${bannerToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete.id));
        setDeleteModalOpen(false);
      }
    } catch (err) {
      console.error('Delete banner error:', err);
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
            Hero Slider Banners
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage automatic hero carousel slides, captions, background images, and CTA targets.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
          <span>Loading hero banners...</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-xs text-xs sm:text-sm text-gray-500">
          No hero banners created yet in Supabase.
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-xl overflow-hidden shadow-xs no-border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative w-32 sm:w-40 aspect-[16/10] rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                    <Image
                      src={banner.background_image}
                      alt={banner.heading}
                      fill
                      className="object-cover"
                      sizes="180px"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.5 rounded font-mono">
                      Desktop
                    </span>
                  </div>

                  {banner.mobile_image_url && (
                    <div className="relative w-14 sm:w-16 aspect-[9/16] rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100 hidden sm:block">
                      <Image
                        src={banner.mobile_image_url}
                        alt={`${banner.heading} Mobile`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <span className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1 py-0.2 rounded font-mono">
                        Mobile
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {banner.subheading && (
                      <span className="text-xs font-bold text-[#1c71cd] uppercase tracking-wider">
                        {banner.subheading}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        banner.is_active ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                      }`}
                    >
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {banner.mobile_image_url && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-[#1c71cd]">
                        Mobile Ready
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      Order: {banner.display_order}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#101820]">
                    {banner.heading}
                  </h3>

                  <p className="text-xs text-[#667085] line-clamp-2 max-w-xl">
                    {banner.description}
                  </p>

                  <div className="pt-1 text-xs text-gray-400">
                    CTA: <span className="text-[#101820] font-semibold">{banner.cta_text}</span> → {banner.cta_url}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => openEditModal(banner)}
                  className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Edit Banner"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setBannerToDelete(banner);
                    setDeleteModalOpen(true);
                  }}
                  className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Hero Banner' : 'Add Hero Banner'}
        subtitle="Manage hero slide imagery, headline text, and CTA buttons."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm text-[#101820]">
          {formError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-md">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Subheading / Eyebrow Tag
            </label>
            <input
              type="text"
              value={formData.subheading}
              onChange={(e) => setFormData({ ...formData, subheading: e.target.value })}
              placeholder="Enter subheading or brand tag"
              className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Main Headline *
            </label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              placeholder="Enter headline"
              className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Banner Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploader
              value={formData.background_image}
              onChange={(url) => setFormData({ ...formData, background_image: url })}
              label="Desktop Banner Image *"
              folder="banners"
            />

            <ImageUploader
              value={formData.mobile_image_url}
              onChange={(url) => setFormData({ ...formData, mobile_image_url: url })}
              label="Mobile Banner Image (Optional)"
              folder="banners"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                CTA Button Text
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                placeholder="Enter button text"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                CTA Button Destination
              </label>
              <input
                type="text"
                value={formData.cta_url}
                onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                placeholder="Enter button destination URL"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#1c71cd] focus:ring-[#1c71cd] w-4 h-4"
                />
                <span className="text-xs sm:text-sm font-semibold">Active in Slider</span>
              </label>
            </div>
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
                <span>Save Banner</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {bannerToDelete && (
        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={`banner "${bannerToDelete.heading}"`}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
