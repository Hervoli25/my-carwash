import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { adminAuthOptions, requireAdmin, requireAdminWith2FA } from '@/lib/admin-auth';
import { AdminDashboardClient } from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  const session = await getServerSession(adminAuthOptions);

  if (!session) {
    redirect('/admin/login');
  }

  const isAdmin = await requireAdmin(session);
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