'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Loader2, Layers, Search, AlertCircle } from 'lucide-react';
import { ServiceCategory } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';
import StatusBadge from '@/components/admin/StatusBadge';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories?all=true');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : slug,
    }));
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: categories.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: ServiceCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      display_order: cat.display_order ?? 1,
      is_active: cat.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Category name is required.');
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
        ...(editingCategory?.id ? { id: editingCategory.id } : {}),
      };

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (cat: ServiceCategory) => {
    setCategoryToDelete(cat);
    setDeleteError('');
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101820] flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#1c71cd]" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Manage top-level main service categories (e.g. Repair Services, Cleaning Services).
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Main Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#F5F8FA] p-3 rounded-xl">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="bg-transparent text-xs w-full focus:outline-none text-[#101820]"
        />
      </div>

      {/* Table / List */}
      <div className="bg-[#F5F8FA] rounded-xl overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1c71cd]" />
            <p className="text-xs">Loading categories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#101820]">No categories found</p>
            <p className="text-xs text-[#667085] mt-1">
              {search ? 'Try adjusting your search query' : 'Click "Add Main Category" to create your first category'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100/70 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Slug</th>
                  <th className="px-5 py-3.5">Services Count</th>
                  <th className="px-5 py-3.5">Order</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image_url ? (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                            <Image
                              src={cat.image_url}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                            <Layers className="w-5 h-5 text-[#1c71cd]" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm text-[#101820]">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[11px] text-[#667085] line-clamp-1 max-w-xs mt-0.5">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-gray-600 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-700">
                      {cat.services_count ?? 0} services
                    </td>
                    <td className="px-5 py-4 text-gray-600 font-medium">
                      #{cat.display_order}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={cat.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-[#1c71cd] transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Main Category' : 'Add Main Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Repair Services"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Slug (URL Identifier) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. repair-services"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter short description"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          <ImageUploader
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            label="Category Cover Image"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
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
              <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        itemName={categoryToDelete?.name || ''}
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
            className="text-white/80 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

