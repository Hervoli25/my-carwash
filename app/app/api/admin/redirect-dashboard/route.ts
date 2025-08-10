import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check current 2FA status in database (not session)
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
    
    if (!adminUser?.twoFactorEnabled) {
      return NextResponse.redirect(new URL('/admin/security/2fa/setup?required=true', request.url));
    }

    // 2FA is properly enabled, redirect to dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));

  } catch (error) {
    console.error('Admin redirect error:', error);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}