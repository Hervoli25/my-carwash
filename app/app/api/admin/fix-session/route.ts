import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Get admin user current status
    const adminUser = await prisma.adminUser.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // If 2FA is enabled but we're stuck in setup loop, reset the 2FA completely
    if (adminUser.twoFactorEnabled) {
      await prisma.adminUser.update({
        where: { username: 'admin' },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        }
      });

      console.log('✅ Reset 2FA for admin user to resolve session loop');
    }

    return NextResponse.json({
      success: true,
      message: 'Admin session fixed - 2FA reset',
      admin: {
        username: adminUser.username,
        twoFactorEnabled: false
      }
    });

  } catch (error) {
    console.error('❌ Error fixing admin session:', error);
    return NextResponse.json({ 
      error: 'Failed to fix session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminUser = await prisma.adminUser.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        failedLogins: true,
        lockedUntil: true,
        lastLoginAt: true
      }
    });

    return NextResponse.json({
      admin: adminUser,
      status: adminUser?.isActive ? 'active' : 'inactive',
      sessionStatus: 'checking'
    });

  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return NextResponse.json({ 
      error: 'Failed to check status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}