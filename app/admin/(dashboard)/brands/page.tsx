'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Loader2, Tag, CheckCircle2, XCircle } from 'lucide-react';
import { Brand } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    display_order: 1,
    is_active: true,
  });

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/brands?all=true');
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      logo_url: '',
      display_order: brands.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      logo_url: brand.logo_url,
      display_order: brand.display_order ?? 1,
      is_active: brand.is_active ?? true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.logo_url.trim()) {
      setFormError('Please upload a brand logo image.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingBrand ? `/api/brands/${editingBrand.id}` : '/api/brands';
      const method = editingBrand ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim() || 'Brand',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save brand logo.');
      }

      setIsModalOpen(false);
      fetchBrands();
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/brands/${brandToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete brand logo.');
      }

      setDeleteModalOpen(false);
      setBrandToDelete(null);
      fetchBrands();
    } catch (err: any) {
      alert(err.message || 'Error deleting brand logo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101820]">Brand Logos</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Manage appliance manufacturer logos displayed in the &quot;WE REPAIR ALL BRANDS&quot; slider on repair service pages.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#1c71cd] hover:bg-[#165ba4] text-white px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Logo</span>
        </button>
      </div>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-[#1c71cd] animate-spin" />
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1c71cd] flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#101820] mb-1">No Brand Logos Found</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4">
            Upload manufacturer logos to display them in the slider under repair service categories.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#1c71cd] hover:bg-[#165ba4] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Upload First Brand Logo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Logo Preview Container */}
                <div className="relative aspect-[16/9] w-full bg-[#F5F8FA] rounded-lg overflow-hidden flex items-center justify-center p-2 mb-3">
                  <Image
                    src={brand.logo_url}
                    alt={brand.name || 'Brand Logo'}
                    fill
                    className="object-contain p-2"
                    sizes="200px"
                  />
                </div>

                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-[#101820] truncate">
                    {brand.name || 'Brand'}
                  </h4>
                  {brand.is_active ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#667085]">
                  Order: {brand.display_order ?? 1}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-gray-100">
                <button
                  onClick={() => openEditModal(brand)}
                  className="p-1.5 text-gray-500 hover:text-[#1c71cd] hover:bg-blue-50 rounded transition-colors"
                  title="Edit Brand"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setBrandToDelete(brand);
                    setDeleteModalOpen(true);
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete Brand"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
        title={editingBrand ? 'Edit Brand Logo' : 'Add Brand Logo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1.5">
              Brand Logo Image *
            </label>
            <ImageUploader
              value={formData.logo_url}
              onChange={(url) => setFormData((prev) => ({ ...prev, logo_url: url }))}
            />
            <p className="text-[11px] text-[#667085] mt-1">
              Upload a clear PNG, SVG, or JPG logo with transparent or light background.
            </p>
          </div>

          {/* Brand Name (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Brand Name (Optional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Samsung, LG, Whirlpool"
              className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, display_order: parseInt(e.target.value) || 1 }))
                }
                min="1"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="relative flex items-center gap-2 cursor-pointer text-xs font-bold text-[#101820]">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="w-4 h-4 text-[#1c71cd] rounded focus:ring-[#1c71cd]"
                />
                <span>Active & Visible</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1c71cd] hover:bg-[#165ba4] rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingBrand ? 'Save Changes' : 'Upload Brand'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Brand Logo"
        message={`Are you sure you want to delete "${brandToDelete?.name || 'this brand logo'}"? It will no longer appear in the brands slider.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

