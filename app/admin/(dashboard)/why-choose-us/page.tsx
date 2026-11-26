'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Loader2,
  HelpCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { WhyChooseUsItem, WhyChooseUsSection } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';
import StatusBadge from '@/components/admin/StatusBadge';

export default function AdminWhyChooseUsPage() {
  const [sectionData, setSectionData] = useState<WhyChooseUsSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHeader, setIsSavingHeader] = useState(false);
  const [headerSuccess, setHeaderSuccess] = useState(false);
  const [headerError, setHeaderError] = useState('');

  // Item Modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhyChooseUsItem | null>(null);
  const [itemFormData, setItemFormData] = useState({
    question: '',
    answer: '',
    display_order: 1,
    is_active: true,
  });
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [itemError, setItemError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WhyChooseUsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/why-choose-us');
      const data = await res.json();
      if (data.success && data.data) {
        setSectionData(data.data);
      }
    } catch (err) {
      console.error('Failed to load why choose us data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save section image and headers
  const handleSaveSectionHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionData) return;

    setIsSavingHeader(true);
    setHeaderError('');
    setHeaderSuccess(false);

    try {
      const res = await fetch('/api/why-choose-us', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: sectionData.heading,
          subheading: sectionData.subheading,
          description: sectionData.description,
          image_url: sectionData.image_url,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update section header');
      }

      setHeaderSuccess(true);
      setTimeout(() => setHeaderSuccess(false), 3000);
    } catch (err: unknown) {
      setHeaderError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSavingHeader(false);
    }
  };

  // Open modal to add new accordion item
  const openAddItemModal = () => {
    setEditingItem(null);
    setItemFormData({
      question: '',
      answer: '',
      display_order: (sectionData?.items?.length || 0) + 1,
      is_active: true,
    });
    setItemError('');
    setIsItemModalOpen(true);
  };

  // Open modal to edit existing accordion item
  const openEditItemModal = (item: WhyChooseUsItem) => {
    setEditingItem(item);
    setItemFormData({
      question: item.question,
      answer: item.answer,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setItemError('');
    setIsItemModalOpen(true);
  };

  // Save accordion item (create or update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setItemError('');

    if (!itemFormData.question.trim() || !itemFormData.answer.trim()) {
      setItemError('Question title and answer text are required.');
      return;
    }

    setIsSavingItem(true);
    try {
      const url = editingItem
        ? `/api/why-choose-us/items/${editingItem.id}`
        : '/api/why-choose-us/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save accordion item');
      }

      setIsItemModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      setItemError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSavingItem(false);
    }
  };

  // Delete accordion item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/why-choose-us/items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete accordion item');
      }

      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err: unknown) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || !sectionData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
        <span>Loading Why Choose Us settings...</span>
      </div>
    );
  }

  const sortedItems = [...(sectionData.items || [])].sort(
    (a, b) => a.display_order - b.display_order
  );

  return (
    <div className=" space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-[#101820] tracking-tight">
          Why Choose Us Management
        </h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Customize the side image, section title, and expandable accordion questions and answers.
        </p>
      </div>

      {/* Part 1: Section Image & Heading Settings */}
      <div className="bg-white p-6 rounded-xl shadow-xs no-border space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <ImageIcon className="w-4 h-4 text-[#1c71cd]" />
          <h3 className="text-sm font-bold text-[#101820]">
            Left Side Feature Image & Section Headers
          </h3>
        </div>

        {headerError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{headerError}</span>
          </div>
        )}

        {headerSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>Section details saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSectionHeader} className="space-y-4 text-xs sm:text-sm text-[#101820]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Eyebrow Tag / Subheading
              </label>
              <input
                type="text"
                value={sectionData.subheading || ''}
                onChange={(e) =>
                  setSectionData({ ...sectionData, subheading: e.target.value })
                }
                placeholder="ADVANTAGES"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Section Main Heading *
              </label>
              <input
                type="text"
                value={sectionData.heading || ''}
                onChange={(e) =>
                  setSectionData({ ...sectionData, heading: e.target.value })
                }
                placeholder="Why Choose Us"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Section Description
            </label>
            <textarea
              rows={2}
              value={sectionData.description || ''}
              onChange={(e) =>
                setSectionData({ ...sectionData, description: e.target.value })
              }
              placeholder="We go beyond just service..."
              className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
            />
          </div>

          {/* Image Uploader */}
          <ImageUploader
            value={sectionData.image_url || ''}
            onChange={(url) => setSectionData({ ...sectionData, image_url: url })}
            label="Left Side Feature Image *"
            folder="why-choose-us"
          />

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingHeader}
              className="bg-[#1c71cd] hover:bg-[#165ba4] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isSavingHeader ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Image & Headers</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Part 2: Accordion Questions & Answers List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#101820] tracking-tight">
              Accordion Questions & Answers ({sortedItems.length})
            </h3>
            <p className="text-xs text-[#667085]">
              These items are rendered on the right side of the section with expanding plus icon animation.
            </p>
          </div>

          <button
            onClick={openAddItemModal}
            className="bg-[#1c71cd] hover:bg-[#165ba4] text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Accordion Item</span>
          </button>
        </div>

        {sortedItems.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl text-xs text-gray-500 shadow-xs">
            No accordion items created yet. Click above to add your first advantage.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-gray-100/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
                      #{item.display_order}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-[#1c71cd]">
                        Default Open
                      </span>
                    )}
                    <StatusBadge status={item.is_active ? 'active' : 'inactive'} />
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-[#101820]">
                    {item.question}
                  </h4>
                  <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                    {item.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => openEditItemModal(item)}
                    className="p-2 rounded-md text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete(item);
                      setDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Accordion Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Accordion Item' : 'Add Accordion Item'}
        subtitle="Manage the question headline and detailed answer content."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveItem} className="space-y-4 text-xs sm:text-sm text-[#101820]">
          {itemError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-xs">
              {itemError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Question / Title *
            </label>
            <input
              type="text"
              value={itemFormData.question}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, question: e.target.value })
              }
              placeholder="e.g. Expert & Certified Technicians"
              className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Answer / Explanation *
            </label>
            <textarea
              rows={4}
              value={itemFormData.answer}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, answer: e.target.value })
              }
              placeholder="Enter full answer or service description..."
              className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={itemFormData.display_order}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    display_order: parseInt(e.target.value, 10) || 1,
                  })
                }
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={itemFormData.is_active}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, is_active: e.target.checked })
                  }
                  className="rounded text-[#1c71cd] focus:ring-[#1c71cd] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700">
                  Active (Visible on Website)
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsItemModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingItem}
              className="bg-[#1c71cd] hover:bg-[#165ba4] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-xs"
            >
              {isSavingItem ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{editingItem ? 'Update Item' : 'Add Item'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Item Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteItem}
        title="Delete Accordion Item"
        message={`Are you sure you want to delete "${itemToDelete?.question}"? This will remove it from the website.`}
        isDeleting={isDeleting}
      />
    </div>
  );
}

