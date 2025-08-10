import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

  // Professional 2FA enforcement - check database for current status
  // (Session might be stale after 2FA enable, so we check database directly)
  const adminUser = await prisma.adminUser.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.username ? [{ username: session.user.username }] : []),
        ...(session.user.email ? [{ email: session.user.email }] : [])
      ]
    },
    select: { twoFactorEnabled: true }
  });
  
  const has2FA = adminUser?.twoFactorEnabled;
  if (!has2FA) {
    // Redirect to secure 2FA setup with mandatory enrollment
    redirect('/admin/security/2fa/setup?required=true');
  }

  return <AdminDashboardClient session={session} />;
}