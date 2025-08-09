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
  const has2FA = await requireAdminWith2FA(session);
  if (!has2FA) {
    redirect('/admin/security/2fa');
  }

  return <AdminDashboardClient session={session} />;
}