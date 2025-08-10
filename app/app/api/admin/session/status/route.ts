import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        authenticated: false,
        session: null,
        admin: null,
        issue: 'no_session'
      });
    }

    // Check if this is an admin user
    const adminUser = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          ...(session.user.username ? [{ username: session.user.username }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : [])
        ]
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        isActive: true,
        lastLoginAt: true
      }
    });

    if (!adminUser) {
      return NextResponse.json({
        authenticated: true,
        session: session,
        admin: null,
        issue: 'not_admin'
      });
    }

    // Check for session/database mismatch
    const sessionHas2FA = session.user.twoFactorEnabled;
    const dbHas2FA = adminUser.twoFactorEnabled;
    
    return NextResponse.json({
      authenticated: true,
      session: {
        userId: session.user.id,
        username: session.user.username,
        role: session.user.role,
        twoFactorEnabled: sessionHas2FA
      },
      admin: adminUser,
      sessionDbSync: {
        sessionHas2FA,
        dbHas2FA,
        synced: sessionHas2FA === dbHas2FA
      },
      issue: sessionHas2FA === dbHas2FA ? null : 'session_db_mismatch'
    });

  } catch (error) {
    console.error('Session status check failed:', error);
    return NextResponse.json({
      authenticated: false,
      session: null,
      admin: null,
      issue: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}