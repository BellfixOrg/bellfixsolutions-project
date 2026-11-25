import { redirect } from 'next/navigation';
import { verifyAdminSession } from '@/lib/auth';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  // If visiting admin routes without authentication, redirect to login
  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

