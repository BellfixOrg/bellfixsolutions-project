'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Loader2, FolderTree, Search, AlertCircle, Layers } from 'lucide-react';
import { ServiceCategory, Subcategory } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusBadge from '@/components/admin/StatusBadge';
import ServiceIcon from '@/components/ServiceIcon';

export default function AdminSubcategoriesPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subcategoryToDelete, setSubcategoryToDelete] = useState<Subcategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    slug: '',
    icon: 'Wrench',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  const availableIcons = [
    'Wrench',
    'Snowflake',
    'Waves',
    'Refrigerator',
    'Camera',
    'Sparkles',
    'Layers',
    'Droplets',
    'Shield',
    'Zap',
    'Home',
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subRes, catRes] = await Promise.all([
        fetch('/api/subcategories?all=true'),
        fetch('/api/categories?all=true'),
      ]);
      const [subData, catData] = await Promise.all([subRes.json(), catRes.json()]);

      if (subData.success) setSubcategories(subData.data);
      if (catData.success) setCategories(catData.data);
    } catch (err) {
      console.error('Failed to load subcategories data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingSubcategory ? prev.slug : slug,
    }));
  };

  const openAddModal = () => {
    setEditingSubcategory(null);
    setFormData({
      category_id: categories[0]?.id || '',
      name: '',
      slug: '',
      icon: 'Wrench',
      description: '',
      image_url: '',
      display_order: subcategories.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subcategory) => {
    setEditingSubcategory(sub);
    setFormData({
      category_id: sub.category_id,
      name: sub.name,
      slug: sub.slug,
      icon: sub.icon || 'Wrench',
      description: sub.description || '',
      image_url: sub.image_url || '',
      display_order: sub.display_order ?? 1,
      is_active: sub.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.category_id) {
      setFormError('Please select a parent main category.');
      return;
    }
    if (!formData.name.trim()) {
      setFormError('Subcategory name is required.');
      return;
    }
    if (!formData.slug.trim()) {
      setFormError('Slug is required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        ...(editingSubcategory?.id ? { id: editingSubcategory.id } : {}),
      };

      const res = await fetch('/api/subcategories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save subcategory');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (sub: Subcategory) => {
    setSubcategoryToDelete(sub);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!subcategoryToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/subcategories/${subcategoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete subcategory');
      }

      setDeleteModalOpen(false);
      setSubcategoryToDelete(null);
      fetchData();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete subcategory.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = subcategories.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category_id === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101820] flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#1c71cd]" />
            <span>Subcategory Management</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Manage subcategories assigned to main categories (e.g. Repair Services → AC Repair, CCTV).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subcategory</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#F5F8FA] p-3 rounded-xl flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg w-full sm:w-1/2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcategory name..."
            className="bg-transparent text-xs w-full focus:outline-none text-[#101820]"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg w-full sm:w-1/2">
          <Layers className="w-4 h-4 text-[#1c71cd] shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-[#101820] font-medium cursor-pointer"
          >
            <option value="all">All Main Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subcategories Table */}
      <div className="bg-[#F5F8FA] rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1c71cd]" />
            <p className="text-xs">Loading subcategories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#101820]">No subcategories found</p>
            <p className="text-xs text-[#667085] mt-1">
              {search || categoryFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Click "Add Subcategory" to create your first subcategory'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Subcategory</th>
                  <th className="px-5 py-3.5">Parent Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Active Services</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/80 transition-colors">
                    {/* Subcategory Name & Icon */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#102A43] text-[#1c71cd] flex items-center justify-center shrink-0">
                          <ServiceIcon name={sub.icon || 'Wrench'} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#101820]">{sub.name}</p>
                          {sub.description && (
                            <p className="text-[11px] text-[#667085] line-clamp-1 max-w-xs mt-0.5">
                              {sub.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Parent Main Category */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white text-[#102A43] font-bold text-[11px] shadow-2xs">
                        <Layers className="w-3 h-3 text-[#1c71cd]" />
                        <span>{sub.category_name || 'Assigned Category'}</span>
                      </span>
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-4 font-mono text-gray-600 text-[11px]">
                      {sub.slug}
                    </td>

                    {/* Services Count */}
                    <td className="px-5 py-4 font-bold text-gray-700">
                      {sub.services_count ?? 0} services
                    </td>

                    {/* Order */}
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      #{sub.display_order}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={sub.is_active ? 'active' : 'inactive'} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 text-gray-500 hover:text-[#1c71cd] transition-colors cursor-pointer"
                          title="Edit Subcategory"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(sub)}
                          className="p-1.5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Subcategory"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Subcategory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Parent Category Selection */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Main Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd] text-[#101820] font-medium cursor-pointer"
            >
              <option value="">Select Parent Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Subcategory Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. AC Repair, CCTV"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Slug (URL Identifier) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. ac-repair"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Subcategory Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {availableIcons.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setFormData({ ...formData, icon: ic })}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    formData.icon === ic
                      ? 'bg-[#102A43] text-[#1c71cd] font-bold shadow-xs'
                      : 'bg-[#F5F8FA] text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ServiceIcon name={ic} className="w-4 h-4" />
                  <span className="text-[9px] truncate max-w-full">{ic}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Short Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter short description"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-[#1c71cd] rounded focus:ring-0"
                />
                <span className="text-xs font-bold text-[#101820]">Active / Visible</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#1c71cd] text-white hover:bg-[#165ba4] rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingSubcategory ? 'Save Changes' : 'Create Subcategory'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subcategory"
        itemName={subcategoryToDelete?.name || ''}
        isLoading={isDeleting}
      />

      {/* Delete Error Notification */}
      {deleteError && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-red-600 text-white p-4 rounded-xl shadow-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold">Deletion Prevented</p>
            <p className="text-xs mt-1 text-red-100">{deleteError}</p>
          </div>
          <button
            onClick={() => setDeleteError('')}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

