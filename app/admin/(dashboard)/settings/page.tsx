'use client';

import { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Loader2 } from 'lucide-react';
import { SiteSettings } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminSettingsPage() {
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
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    setSettings({ ...settings, [e.target.name]: e.target.value });
    if (saveSuccess) setSaveSuccess(false);
  };

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
        throw new Error(data.error || 'Failed to update settings');
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
        <span>Loading website settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#101820] tracking-tight">
          Website Settings
        </h2>
        <p className="text-xs text-[#667085] mt-0.5">
          Configure centralized brand identity, phone numbers, WhatsApp dispatcher, email, and location.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs sm:text-sm text-[#101820]">
        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs sm:text-sm p-3.5 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Website settings updated successfully! All pages will reflect changes immediately.</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-3.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Brand Information */}
        <div className="bg-white p-6 rounded-xl shadow-xs no-border space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[#101820] border-b border-gray-100 pb-2">
            Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={settings.business_name}
                onChange={handleChange}
                placeholder="Enter business name"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Tagline / Slogan
              </label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                placeholder="Enter tagline"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
          </div>

          <ImageUploader
            value={settings.logo_url}
            onChange={(url) => setSettings({ ...settings, logo_url: url })}
            label="Custom Brand Logo (Optional)"
            folder="branding"
          />
        </div>

        {/* Direct Contact Numbers */}
        <div className="bg-white p-6 rounded-xl shadow-xs no-border space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[#101820] border-b border-gray-100 pb-2">
            Contact & WhatsApp Integration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Phone Number (for tel: call links) *
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Displayed in Header, Footer, and Final CTA call buttons.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                WhatsApp Number (with country code, no +) *
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={settings.whatsapp_number}
                onChange={handleChange}
                placeholder="Enter WhatsApp number"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Powers the floating WhatsApp button and booking enquiry redirection.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Public Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Physical Office Address / Coverage Area *
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="Enter physical address"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
                required
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-white p-6 rounded-xl shadow-xs no-border space-y-4">
          <h3 className="text-sm sm:text-base font-bold text-[#101820] border-b border-gray-100 pb-2">
            Social Media Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Facebook URL
              </label>
              <input
                type="url"
                name="facebook_url"
                value={settings.facebook_url || ''}
                onChange={handleChange}
                placeholder="Enter Facebook URL"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Instagram URL
              </label>
              <input
                type="url"
                name="instagram_url"
                value={settings.instagram_url || ''}
                onChange={handleChange}
                placeholder="Enter Instagram URL"
                className="w-full bg-[#F5F8FA] px-3 py-2 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-[#1c71cd] hover:bg-[#165ba4] text-white px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
