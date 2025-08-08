import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import speakeasy from 'speakeasy';

export async function POST(request: NextRequest) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const secret = speakeasy.generateSecret({ name: 'Ekhaya Admin 2FA' });
  return NextResponse.json({
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  });
}

