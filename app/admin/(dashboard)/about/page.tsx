'use client';

import { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { SiteSettings } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminAboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error('Failed to load about content:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save about section');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#1c71cd] mb-2" />
        <span>Loading about content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#101820] tracking-tight">
          About Page Management
        </h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Update the story, company overview, and technician fleet photography.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-xs no-border space-y-4 text-xs sm:text-sm text-[#101820]">
        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>About section content updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-3.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Section Heading *
          </label>
          <input
            type="text"
            value={settings.about_heading}
            onChange={(e) => setSettings({ ...settings, about_heading: e.target.value })}
            placeholder="Enter section heading"
            className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            About Company Narrative *
          </label>
          <textarea
            rows={5}
            value={settings.about_description}
            onChange={(e) => setSettings({ ...settings, about_description: e.target.value })}
            placeholder="Enter company narrative"
            className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] resize-none"
            required
          />
        </div>

        <ImageUploader
          value={settings.about_image}
          onChange={(url) => setSettings({ ...settings, about_image: url })}
          label="Featured Technician Fleet Image *"
          folder="about"
        />

        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#1c71cd] hover:bg-[#165ba4] text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save About Content</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
