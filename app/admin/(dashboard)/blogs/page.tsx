'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, BookOpen, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { BlogPost } from '@/types';
import Modal from '@/components/admin/Modal';
import ConfirmDeleteModal from '@/components/admin/ConfirmDeleteModal';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Repair Tips',
    read_time: '4 min read',
    date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    excerpt: '',
    content: '',
    display_order: 1,
    is_active: true,
  });

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/blogs?all=true');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.data);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const openAddModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      category: 'Repair Tips',
      read_time: '4 min read',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      excerpt: '',
      content: '',
      display_order: blogs.length + 1,
      is_active: true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      category: blog.category,
      read_time: blog.read_time || '4 min read',
      date: blog.date || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      excerpt: blog.excerpt,
      content: blog.content,
      display_order: blog.display_order ?? 1,
      is_active: blog.is_active ?? true,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.category.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      setFormError('Please fill in Title, Category, Excerpt, and Full Content.');
      return;
    }

    setIsSaving(true);
    try {
      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const method = editingBlog ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save blog post.');
      }

      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/blogs/${blogToDelete.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete blog post.');
      }

      setDeleteModalOpen(false);
      setBlogToDelete(null);
      fetchBlogs();
    } catch (err: any) {
      alert(err.message || 'Error deleting blog post');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101820]">Blog Management</h1>
          <p className="text-xs sm:text-sm text-[#667085] mt-1">
            Publish maintenance advice and repair guides. Readers can click &quot;Read More&quot; to open the full details popup.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-[#1c71cd] hover:bg-[#165ba4] text-white px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Blog</span>
        </button>
      </div>

      {/* Blogs List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-16 bg-white rounded-xl shadow-xs">
          <Loader2 className="w-8 h-8 text-[#1c71cd] animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1c71cd] flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#101820] mb-1">No Blog Posts Yet</h3>
          <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4">
            Add your first blog article to share maintenance knowledge with your customers.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#1c71cd] hover:bg-[#165ba4] text-white px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Blog Post</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Meta info */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-bold text-[#1c71cd] bg-blue-50 px-2 py-0.5 rounded">
                    {blog.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.read_time}
                    </span>
                    {blog.is_active ? (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#101820] mb-2 leading-snug">
                  {blog.title}
                </h3>
                <p className="text-xs text-[#667085] line-clamp-3 leading-relaxed mb-4">
                  {blog.excerpt}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {blog.date}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(blog)}
                    className="p-1.5 text-gray-500 hover:text-[#1c71cd] hover:bg-blue-50 rounded transition-colors"
                    title="Edit Blog"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setBlogToDelete(blog);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Blog"
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
        title={editingBlog ? 'Edit Blog Post' : 'Add New Blog Post'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg">
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Blog Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. How Often Should You Service Your Air Conditioner?"
              className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              required
            />
          </div>

          {/* Category & Read Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Category / Tag *
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g. Repair Tips, Appliance Care"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Read Time (e.g. 4 min read)
              </label>
              <input
                type="text"
                value={formData.read_time}
                onChange={(e) => setFormData((prev) => ({ ...prev, read_time: e.target.value }))}
                placeholder="e.g. 4 min read"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
          </div>

          {/* Date & Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#101820] mb-1">
                Display Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                placeholder="e.g. November 2026"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

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
          </div>

          {/* Short Excerpt */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Short Summary / Excerpt * (shown on blog card)
            </label>
            <textarea
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief summary introducing the article on the card..."
              className="w-full bg-[#F5F8FA] p-3 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
              required
            />
          </div>

          {/* Full Content */}
          <div>
            <label className="block text-xs font-bold text-[#101820] mb-1">
              Full Content * (displayed inside the popup when clicking &quot;Read More&quot;)
            </label>
            <textarea
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Enter complete article details, bullet points, maintenance advice, etc."
              className="w-full bg-[#F5F8FA] p-3 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-y"
              required
            />
            <p className="text-[11px] text-[#667085] mt-1">
              Supports markdown formatting (paragraphs, bullet points with -, and subheadings with ###).
            </p>
          </div>

          {/* Active Status */}
          <div className="pt-2">
            <label className="relative flex items-center gap-2 cursor-pointer text-xs font-bold text-[#101820]">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-[#1c71cd] rounded focus:ring-[#1c71cd]"
              />
              <span>Published & Visible on Website</span>
            </label>
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
              <span>{editingBlog ? 'Save Changes' : 'Publish Blog'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${blogToDelete?.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
}

