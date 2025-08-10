import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { adminAuthOptions } from '@/lib/admin-auth';
import { AdminDashboardClient } from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect('/admin/login');
  }

  // Check if user has admin role
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  if (!isAdmin) {
    redirect('/admin/login');
  }

  // Professional 2FA enforcement for production security
  const has2FA = session?.user?.twoFactorEnabled;
  if (!has2FA) {
    // Redirect to secure 2FA setup with mandatory enrollment
    redirect('/admin/security/2fa/setup?required=true');
  }

  return <AdminDashboardClient session={session} />;
}