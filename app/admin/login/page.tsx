'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-panel min-h-screen bg-[#101820] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-9 shadow-2xl no-border">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo light />
          </div>
          <h2 className="text-xl font-bold text-[#101820] tracking-tight">
            Admin CMS Portal
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Sign in with Supabase Authentication or system administrator credentials
          </p>
        </div>

        {error && (
          <div className="mb-5 bg-red-50 text-red-700 text-xs p-3.5 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#101820] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1c71cd]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#F5F8FA] pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#101820] rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1c71cd]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#1c71cd] hover:bg-[#165ba4] text-white py-2.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Authorized management access only. All activities are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
