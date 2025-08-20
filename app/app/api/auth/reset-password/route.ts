import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Hash the token and look it up
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const vt = await prisma.verificationToken.findFirst({
      where: { token: tokenHash },
    });

    if (!vt || vt.expires < new Date()) {
      return NextResponse.json({ error: 'Reset link is invalid or has expired' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: vt.identifier } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete the token so it cannot be reused
    await prisma.verificationToken.deleteMany({ where: { identifier: vt.identifier } }).catch(() => {});

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('reset-password error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

