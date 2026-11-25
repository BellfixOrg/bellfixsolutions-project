'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Layers,
  FolderTree,
  MapPin,
  Check,
  Search,
  Filter,
} from 'lucide-react';
import { District, Service, ServiceCategory } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import ImageUploader from '@/components/admin/ImageUploader';
import ServiceIcon from '@/components/ServiceIcon';
import StatusBadge from '@/components/admin/StatusBadge';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // District multi-select search in modal
  const [districtSearch, setDistrictSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    icon: 'Wrench',
    short_description: '',
    full_description: '',
    main_image: '',
    benefits: [''],
    display_order: 1,
    is_active: true,
    district_ids: [] as string[],
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
      const [servRes, catRes, distRes] = await Promise.all([
        fetch('/api/services?all=true'),
        fetch('/api/categories?all=true'),
        fetch('/api/districts?all=true'),
      ]);

      const [servData, catData, distData] = await Promise.all([
        servRes.json(),
        catRes.json(),
        distRes.json(),
      ]);

      if (servData.success) setServices(servData.data);
      if (catData.success) setCategories(catData.data);
      if (distData.success) setDistricts(distData.data);
    } catch (err) {
      console.error('Failed to load services data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    setDistrictSearch('');
    const defaultCatId = categories.length > 0 ? categories[0].id : '';
    const allDistIds = districts.filter((d) => d.is_active).map((d) => d.id);

    setFormData({
      name: '',
      slug: '',
      category_id: defaultCatId,
      icon: 'Wrench',
      short_description: '',
      full_description: '',
      main_image: '',
      benefits: ['Same-day service', 'Guaranteed workmanship'],
      display_order: services.length + 1,
      is_active: true,
      district_ids: allDistIds,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setDistrictSearch('');

    let distIds = service.district_ids || service.districts?.map((d) => d.id) || [];
    if (distIds.length === 0 && districts.length > 0) {
      distIds = districts.filter((d) => d.is_active).map((d) => d.id);
    }

    setFormData({
      name: service.name,
      slug: service.slug,
      category_id: service.category_id || (categories[0]?.id ?? ''),
      icon: service.icon || 'Wrench',
      short_description: service.short_description,
      full_description: service.full_description || '',
      main_image: service.main_image,
      benefits: service.benefits && service.benefits.length > 0 ? service.benefits : [''],
      display_order: service.display_order ?? 1,
      is_active: service.is_active ?? true,
      district_ids: distIds,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingService ? prev.slug : slug,
    }));
  };

  const handleCategoryChange = (catId: string) => {
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
    }));
  };

  const toggleDistrict = (districtId: string) => {
    setFormData((prev) => {
      const exists = prev.district_ids.includes(districtId);
      return {
        ...prev,
        district_ids: exists
          ? prev.district_ids.filter((id) => id !== districtId)
          : [...prev.district_ids, districtId],
      };
    });
  };

  const selectAllDistricts = () => {
    setFormData((prev) => ({
      ...prev,
      district_ids: districts.map((d) => d.id),
    }));
  };

  const clearAllDistricts = () => {
    setFormData((prev) => ({
      ...prev,
      district_ids: [],
    }));
  };

  const handleBenefitChange = (index: number, val: string) => {
    const updated = [...formData.benefits];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, benefits: updated }));
  };

  const addBenefitField = () => {
    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefitField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (
      !formData.name.trim() ||
      !formData.slug.trim() ||
      !formData.category_id ||
      !formData.short_description.trim() ||
      !formData.main_image
    ) {
      setFormError('Name, slug, category, short description, and main image are required.');
      return;
    }

    if (formData.district_ids.length === 0) {
      setFormError('Please select at least one available location for this service.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        benefits: formData.benefits.filter((b) => b.trim() !== ''),
      };

      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save service');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      setDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete service. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Services List
  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'all' || s.category_id === selectedCategoryFilter;

    const matchesDistrict =
      selectedDistrictFilter === 'all' ||
      s.district_ids?.includes(selectedDistrictFilter) ||
      s.districts?.some((d) => d.id === selectedDistrictFilter);

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  // Modal district search filter
  const modalDistrictsFiltered = districts.filter((d) =>
    d.name.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101820]">
            Services Management
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Create and edit individual services, assign them to main categories &amp; subcategories, and select multiple available locations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#1c71cd] text-white hover:bg-[#165ba4] px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all shadow-sm flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#F5F8FA] p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 bg-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd] text-[#101820]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
            <Layers className="w-4 h-4 text-[#1c71cd] shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none text-[#101820] font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* District / Location Filter */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg">
            <MapPin className="w-4 h-4 text-[#1c71cd] shrink-0" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none text-[#101820] font-medium cursor-pointer"
            >
              <option value="all">All Locations</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Pill Summary */}
        {(selectedCategoryFilter !== 'all' || selectedDistrictFilter !== 'all' || search) && (
          <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-500">
            <Filter className="w-3.5 h-3.5 text-[#1c71cd]" />
            <span>Showing filtered services</span>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategoryFilter('all');
                setSelectedDistrictFilter('all');
              }}
              className="text-[#1c71cd] font-bold hover:underline ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
          <span>Loading services catalog from Supabase...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-[#F5F8FA] p-12 text-center rounded-xl text-xs sm:text-sm text-gray-500">
          No services match your filters. Click &quot;Add New Service&quot; above to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => {
            const assignedCount = service.district_ids?.length || service.districts?.length || 0;
            return (
              <div
                key={service.id}
                className="bg-[#F5F8FA] rounded-xl overflow-hidden shadow-2xs no-border flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-gray-200">
                    <Image
                      src={service.main_image}
                      alt={service.name}
                      fill
                      className="object-cover"
                      sizes="400px"
                    />
                    <div className="absolute top-3 left-3 bg-[#101820]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1.5">
                      <ServiceIcon name={service.icon} className="w-3.5 h-3.5 text-[#1c71cd]" />
                      <span>{service.icon}</span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={service.is_active ? 'active' : 'inactive'} />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Category & Subcategory Tags */}
                    {/* Category Tag */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1c71cd] bg-white px-2 py-0.5 rounded shadow-2xs">
                        <Layers className="w-3 h-3" />
                        <span>{service.category_name || 'Category'}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm sm:text-base font-bold text-[#101820]">
                        {service.name}
                      </h3>
                      <span className="text-xs text-gray-400 font-mono">
                        #{service.display_order}
                      </span>
                    </div>

                    <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                      {service.short_description}
                    </p>

                    {/* Districts Coverage Chip */}
                    <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] text-[#102A43] font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#1c71cd]" />
                      <span>
                        Available in {assignedCount} {assignedCount === 1 ? 'location' : 'locations'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-200/50 mt-2 pt-3 bg-white/40">
                  <span className="text-[11px] text-gray-500 font-mono">
                    /{service.slug}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-1.5 rounded-md text-gray-600 hover:text-[#1c71cd] hover:bg-white transition-colors cursor-pointer"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setServiceToDelete(service);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Service Modal with Cascading Category, Subcategory & Locations */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Service' : 'Add New Service'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* 1. Service Name */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Service Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. AC Repair"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* 2. Select Main Category */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Select Main Category *
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd] text-[#101820] font-medium cursor-pointer"
            >
              <option value="">Choose Main Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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

          {/* 4. Service Description */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Short Summary Description *
            </label>
            <input
              type="text"
              required
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Enter brief description"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Full Editorial Description
            </label>
            <textarea
              rows={3}
              value={formData.full_description}
              onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
              placeholder="Enter full comprehensive service details"
              className="w-full px-3 py-2 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            />
          </div>

          {/* 5. Service Image */}
          <ImageUploader
            value={formData.main_image}
            onChange={(url) => setFormData({ ...formData, main_image: url })}
            label="Service Image *"
          />

          {/* Service Icon */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Service Icon
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

          {/* 6. SELECT MULTIPLE AVAILABLE LOCATIONS */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-[#101820]">
                  Select Multiple Available Locations * ({formData.district_ids.length} selected)
                </label>
                <p className="text-[11px] text-[#667085]">
                  Select all locations / districts where this service is active.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllDistricts}
                  className="text-[11px] font-bold text-[#1c71cd] hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={clearAllDistricts}
                  className="text-[11px] font-bold text-gray-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Selected Location Chips / Removable Tags */}
            {formData.district_ids.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2.5 bg-[#F5F8FA] rounded-lg max-h-24 overflow-y-auto">
                {formData.district_ids.map((did) => {
                  const dObj = districts.find((d) => d.id === did);
                  return (
                    <span
                      key={did}
                      className="inline-flex items-center gap-1 bg-white text-[#101820] px-2 py-0.5 rounded text-[11px] font-semibold shadow-2xs"
                    >
                      <span>{dObj?.name || 'Location'}</span>
                      <button
                        type="button"
                        onClick={() => toggleDistrict(did)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Location Checkbox Grid */}
            <div className="border border-gray-100 rounded-lg p-2.5 space-y-2 bg-white">
              <input
                type="text"
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                placeholder="Filter locations..."
                className="w-full px-2.5 py-1.5 bg-[#F5F8FA] rounded text-xs focus:outline-none"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pt-1">
                {modalDistrictsFiltered.map((d) => {
                  const isChecked = formData.district_ids.includes(d.id);
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDistrict(d.id)}
                      className={`flex items-center gap-2 p-1.5 rounded text-left transition-colors cursor-pointer text-xs ${
                        isChecked
                          ? 'bg-[#102A43] text-white font-bold'
                          : 'bg-[#F5F8FA] text-[#101820] hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-[#1c71cd] text-white' : 'border border-gray-300'
                        }`}
                      >
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="truncate">{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-[#101820]">
              Service Highlights
            </label>
            {formData.benefits.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={b}
                  onChange={(e) => handleBenefitChange(idx, e.target.value)}
                  placeholder="Enter highlight"
                  className="flex-1 px-3 py-1.5 bg-[#F5F8FA] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefitField(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBenefitField}
              className="text-xs text-[#1c71cd] hover:underline font-bold cursor-pointer"
            >
              + Add Another Highlight
            </button>
          </div>

          {/* Display Order & Active */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
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
              <span>{editingService ? 'Save Changes' : 'Create Service'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Service"
        itemName={serviceToDelete?.name || ''}
        isLoading={isDeleting}
      />
    </div>
  );
}
