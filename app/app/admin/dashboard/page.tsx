import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { AdminDashboardClient } from './admin-dashboard-client';

export default async function AdminDashboardPage() {
  const session = await getServerSession(adminAuthOptions);

  if (!session || !(await requireAdmin(session))) {
    redirect('/admin/login');
  }

  return <AdminDashboardClient session={session} />;
}