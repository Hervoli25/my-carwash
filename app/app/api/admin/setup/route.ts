import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Only allow this endpoint in development/setup mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Admin setup disabled in production' }, { status: 403 });
    }

    console.log('🔧 Setting up admin user...');
    
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: 'Admin user already exists',
        username: 'admin',
        email: existingAdmin.email 
      });
    }

    // Hash the admin password
    const hashedPassword = await bcryptjs.hash('EkhayaAdmin2024!#$', 12);
    
    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'hervetshombe@gmail.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        twoFactorEnabled: false,
        allowedIPs: [], // Empty array means all IPs allowed
        failedLogins: 0,
        lockedUntil: null
      }
    });

    console.log('✅ Admin user created successfully:', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        twoFactorEnabled: adminUser.twoFactorEnabled
      }
    });

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin user status
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
        createdAt: true,
        lastLoginAt: true
      }
    });

    if (!adminUser) {
      return NextResponse.json({ 
        exists: false,
        message: 'Admin user not found' 
      });
    }

    return NextResponse.json({
      exists: true,
      admin: adminUser,
      status: adminUser.isActive ? 'active' : 'inactive',
      locked: adminUser.lockedUntil ? adminUser.lockedUntil > new Date() : false
    });

  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return NextResponse.json({ 
      error: 'Failed to check admin status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}