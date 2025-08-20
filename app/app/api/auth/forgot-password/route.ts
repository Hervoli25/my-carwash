import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Create a simple PasswordResetToken table via Prisma without migration here.
// We'll use the VerificationToken table temporarily to store password reset tokens
// with identifier = user email and token = hashed token.
// If VerificationToken is used elsewhere, consider adding a dedicated model.

// Email transporter (reuses Gmail SMTP env vars already in project)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond success to avoid user enumeration
    if (!user) {
      return NextResponse.json({ message: 'If that email exists, a reset link will be sent' });
    }

    // Generate token and hash before storing
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Clear existing tokens for this identifier
    await prisma.verificationToken.deleteMany({ where: { identifier: email } }).catch(() => {});

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        expires,
      },
    });

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || req.headers.get('origin') || '';
    const resetUrl = `${baseUrl.replace(/\/$/, '')}/auth/reset-password?token=${rawToken}`;

    // Send email
    try {
      const { buildPasswordResetEmail } = await import('@/components/email/templates/password-reset');
      await transporter.sendMail({
        from: `PRESTIGE Car Wash <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset your PRESTIGE Car Wash password',
        html: buildPasswordResetEmail(resetUrl, user.firstName || user.name || undefined),
      });
    } catch (e) {
      // Do not fail if email sending fails; user can retry
      console.error('Email send failed', e);
    }

    return NextResponse.json({ message: 'If that email exists, a reset link will be sent' });
  } catch (err) {
    console.error('forgot-password error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

