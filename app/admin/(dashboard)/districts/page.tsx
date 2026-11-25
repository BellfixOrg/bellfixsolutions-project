'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, MapPin, Search, AlertCircle } from 'lucide-react';
import { District } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import StatusBadge from '@/components/admin/StatusBadge';

export default function AdminDistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [districtToDelete, setDistrictToDelete] = useState<District | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_order: 1,
    is_active: true,
  });

  const fetchDistricts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/districts?all=true');
      const data = await res.json();
      if (data.success) {
        setDistricts(data.data);
      }
    } catch (err) {
      console.error('Failed to load districts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingDistrict ? prev.slug : slug,
    }));
  };

  const openAddModal = () => {
    setEditingDistrict(null);
    setFormData({
      name: '',
      slug: '',
      display_order: districts.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (dist: District) => {
    setEditingDistrict(dist);
    setFormData({
      name: dist.name,
      slug: dist.slug,
      display_order: dist.display_order ?? 1,
      is_active: dist.is_active,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('District / Location name is required.');
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
        ...(editingDistrict?.id ? { id: editingDistrict.id } : {}),
      };

      const res = await fetch('/api/districts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save location.');
      }

      setIsModalOpen(false);
      await fetchDistricts();
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!districtToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch(`/api/districts/${districtToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete location.');
      }

      setDeleteModalOpen(false);
      setDistrictToDelete(null);
      await fetchDistricts();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete location.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101820]">Location Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage districts and coverage locations where services are offered.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1c71cd] text-white rounded-xl font-bold hover:bg-[#00b5d1] transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F5F8FA] p-4 rounded-2xl flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search locations by name or slug..."
          className="w-full bg-transparent text-sm text-[#101820] placeholder-gray-400 focus:outline-none"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#1c71cd] mb-3" />
            <p className="text-sm">Loading locations...</p>
          </div>
        ) : filteredDistricts.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold text-gray-600">No locations found</p>
            <p className="text-sm mt-1">
              {search
                ? 'Try searching with a different keyword.'
                : 'Get started by creating your first coverage district.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F8FA] text-xs font-semibold uppercase text-gray-500 tracking-wider">
                  <th className="py-3.5 px-4">Location / District</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4 text-center">Assigned Services</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredDistricts.map((dist) => (
                  <tr key={dist.id} className="hover:bg-[#F5F8FA]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#101820]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#1c71cd]/10 text-[#1c71cd] flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <span>{dist.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-xs">
                      {dist.slug}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5F8FA] text-gray-600">
                        {dist.services_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-600 font-medium">
                      {dist.display_order ?? 1}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={dist.is_active ? 'active' : 'inactive'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dist)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#101820] hover:bg-[#F5F8FA] transition-colors"
                          title="Edit location"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDistrictToDelete(dist);
                            setDeleteError('');
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete location"
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDistrict ? 'Edit Location' : 'Add New Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#101820] mb-1.5">
              District / Location Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter location name (e.g. Malappuram)"
              required
              className="w-full px-3.5 py-2.5 bg-[#F5F8FA] rounded-xl text-sm text-[#101820] focus:outline-none focus:ring-2 focus:ring-[#1c71cd]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#101820] mb-1.5">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. malappuram"
              required
              className="w-full px-3.5 py-2.5 bg-[#F5F8FA] rounded-xl text-sm text-[#101820] font-mono focus:outline-none focus:ring-2 focus:ring-[#1c71cd]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#101820] mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3.5 py-2.5 bg-[#F5F8FA] rounded-xl text-sm text-[#101820] focus:outline-none focus:ring-2 focus:ring-[#1c71cd]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#1c71cd] focus:ring-[#1c71cd]"
                />
                <span className="text-sm font-semibold text-[#101820]">Active</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#1c71cd] text-white rounded-xl text-sm font-bold hover:bg-[#00b5d1] transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingDistrict ? 'Save Changes' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDistrictToDelete(null);
          setDeleteError('');
        }}
        onConfirm={handleDelete}
        title="Delete Location"
        message={`Are you sure you want to delete "${districtToDelete?.name}"? Any services mapped to this district will lose this location assignment.`}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
}

