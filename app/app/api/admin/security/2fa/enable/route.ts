import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  let secret: string | null = null;
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await request.json();
      secret = body?.secret || null;
    } else {
      const form = await request.formData();
      secret = (form.get('secret') as string) || null;
    }
  } catch {}

  if (!secret) return NextResponse.json({ error: 'Missing secret' }, { status: 400 });

  await prisma.adminUser.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true, twoFactorSecret: secret }
  });

  return NextResponse.redirect(new URL('/admin/dashboard', request.url), 303);
}

