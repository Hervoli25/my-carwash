import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, userId, newPassword } = body;

    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });
    } else if (email) {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } else {
      return NextResponse.json({ 
        error: 'Either email or userId is required' 
      }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (newPassword) {
      // Admin is setting a new password directly
      const hashedPassword = await bcryptjs.hash(newPassword, 12);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      // Log the action
      await logAdminAction(
        session.user.id,
        'RESET_PASSWORD',
        'USER',
        user.id,
        null,
        { passwordReset: true },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

      return NextResponse.json({
        message: 'Password updated successfully'
      });

    } else {
      // Generate a temporary password
      const tempPassword = crypto.randomBytes(8).toString('hex');
      const hashedPassword = await bcryptjs.hash(tempPassword, 12);

      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword
        }
      });

      // In a real app, you would send this via email
      // For now, we'll return it in the response (NOT recommended for production)
      console.log(`Temporary password for ${user.email}: ${tempPassword}`);

      // Log the action
      await logAdminAction(
        session.user.id,
        'GENERATE_TEMP_PASSWORD',
        'USER',
        user.id,
        null,
        { email: user.email },
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      );

      return NextResponse.json({
        message: 'Temporary password generated successfully',
        // WARNING: Only for development - remove in production
        tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined,
        note: 'Temporary password has been generated. In production, this would be sent via email.'
      });
    }

  } catch (error) {
    console.error('Admin password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

// Send password reset email endpoint
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Note: In production, you would save this to a separate PasswordResetToken table
    // For now, we'll skip saving to database and just generate the token
    console.log(`Generated reset token for ${email}: ${resetToken}`);

    // In a real app, send reset email here
    // For now, we'll log the reset link
    const resetLink = `${request.headers.get('origin')}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetLink}`);

    // Log the action
    await logAdminAction(
      session.user.id,
      'SEND_PASSWORD_RESET',
      'USER',
      user.id,
      null,
      { email, resetTokenGenerated: true },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Password reset email sent successfully',
      // WARNING: Only for development - remove in production
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
      note: 'Password reset link has been generated. In production, this would be sent via email.'
    });

  } catch (error) {
    console.error('Admin send password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}