'use client';

import { useState, useEffect } from 'react';
import { Calendar, User, Phone, MapPin, MessageSquare, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Service, ServiceCategory, District, SiteSettings } from '@/types';

interface BookingFormProps {
  services: Service[];
  settings?: SiteSettings | null;
  categories?: ServiceCategory[];
  districts?: District[];
  selectedServiceName?: string;
  initialLocation?: string;
  onSuccess?: () => void;
}

export default function BookingForm({
  services,
  settings,
  categories,
  districts,
  selectedServiceName,
  initialLocation,
  onSuccess,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    service_name: selectedServiceName || (services[0]?.name ?? ''),
    location: initialLocation || '',
    preferred_date: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappRedirectUrl, setWhatsappRedirectUrl] = useState('');
  const [liveSettings, setLiveSettings] = useState<SiteSettings | null>(settings || null);

  useEffect(() => {
    if (initialLocation) {
      setFormData((prev) => ({ ...prev, location: initialLocation }));
    }
  }, [initialLocation]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setFormData((prev) => (prev.preferred_date ? prev : { ...prev, preferred_date: dateStr }));
  }, []);

  useEffect(() => {
    if (!settings) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            setLiveSettings(data.data);
          }
        })
        .catch(() => {});
    }
  }, [settings]);

  const currentSettings = settings || liveSettings;
  const rawWhatsApp = currentSettings?.whatsapp_number || '919778215489';
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, '');
  const businessName = currentSettings?.business_name || 'BELL FIX & SOLUTIONS';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.customer_name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }
    if (!formData.service_name) {
      setErrorMessage('Please select a service.');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please enter your location or address.');
      return;
    }
    if (!formData.preferred_date) {
      setErrorMessage('Please select a preferred service date.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedService = services.find((s) => s.name === formData.service_name || s.id === formData.service_name);
      const catName = selectedService?.category_name || selectedService?.category?.name || '';
      const subcatName = selectedService?.subcategory_name || selectedService?.subcategory?.name || '';

      const payload = {
        ...formData,
        category_id: selectedService?.category_id || undefined,
        category_name: catName || undefined,
        subcategory_id: selectedService?.subcategory_id || undefined,
        subcategory_name: subcatName || undefined,
        service_id: selectedService?.id || undefined,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save booking. Please try again.');
      }

      const categoryLines = [
        catName ? `Category: ${catName}` : '',
        subcatName ? `Subcategory: ${subcatName}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const whatsappText = `Hello ${businessName},

I would like to book a service enquiry:

• Name: ${formData.customer_name}
• Phone: ${formData.phone}
• Service: ${formData.service_name}
${categoryLines ? `• ${categoryLines}\n` : ''}• Location / Address: ${formData.location}
• Preferred Date: ${formData.preferred_date}
• Message / Note: ${formData.message || 'None'}

Please confirm availability and dispatch details. Thank you!`;

      const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(whatsappText)}`;

      setWhatsappRedirectUrl(whatsappUrl);
      setIsSuccess(true);
      setIsLoading(false);

      // Instant redirect via window.location / window.open
      try {
        const win = window.open(whatsappUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = whatsappUrl;
        }
      } catch {
        window.location.href = whatsappUrl;
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 3500);
      }
    } catch (err: unknown) {
      console.error('Booking submission error:', err);
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Database booking save failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-[#101820]">
      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-xs sm:text-sm p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm p-3.5 rounded-lg space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-emerald-800">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Booking saved to database! Opening WhatsApp...</span>
          </div>
          {whatsappRedirectUrl && (
            <a
              href={whatsappRedirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Click to Chat on WhatsApp Now</span>
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Your Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Select Service *
          </label>
          {services.length > 0 ? (
            <select
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
              className="w-full bg-[#F5F8FA] px-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
              required
              disabled={isLoading}
            >
              <option value="">Select a service...</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.name}>
                  {srv.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
              placeholder="Enter service name"
              className="w-full bg-[#F5F8FA] px-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
              required
              disabled={isLoading}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Preferred Date *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              name="preferred_date"
              value={formData.preferred_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Location / Address *
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="location"
            list="booking-available-districts"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location or address"
            className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all"
            required
            disabled={isLoading}
          />
          {districts && districts.length > 0 && (
            <datalist id="booking-available-districts">
              {districts.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Additional Details or Problem Description
        </label>
        <textarea
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          placeholder="Enter additional details or service requirements..."
          className="w-full bg-[#F5F8FA] p-3 text-xs sm:text-sm rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1c71cd] transition-all resize-none"
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full bg-[#1c71cd] hover:bg-[#165ba4] text-white py-3 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Booking...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check className="w-4 h-4" />
            <span>Redirecting to WhatsApp...</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            <span>Book Service & WhatsApp Enquiry</span>
          </>
        )}
      </button>

   
    </form>
  );
}
