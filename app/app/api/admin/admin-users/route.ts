import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

function makeUsernameFrom(workNumber?: string, lastName?: string): string | null {
  if (!workNumber || !lastName) return null;
  const wn = String(workNumber).replace(/[^0-9A-Za-z]/g, '');
  const ln = String(lastName).toLowerCase().replace(/[^a-z]/g, '');
  if (!wn || !ln) return null;
  return `${wn}.${ln}`;
}

function generateTempPassword(): string {
  // 10-char alphanumeric temp password
  return Math.random().toString(36).slice(-10) + '!A';
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get('role') || undefined;

  const users = await prisma.adminUser.findMany({
    where: role ? { role } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      allowedIPs: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const {
      username: rawUsername,
      workNumber,
      lastName,
      name,
      email,
      role = 'STAFF',
      password: plainPassword,
      allowedIPs = [],
    } = body || {};

    let username: string | null = (rawUsername || '').trim() || null;
    if (!username) {
      username = makeUsernameFrom(workNumber, lastName);
    }

    if (!username || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields (username/workNumber+lastName, email, name)' }, { status: 400 });
    }

    // Ensure username/email unique
    const existing = await prisma.adminUser.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existing) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }

    const tempPassword = plainPassword || generateTempPassword();
    const hashed = await bcryptjs.hash(tempPassword, 10);

    const created = await prisma.adminUser.create({
      data: {
        username,
        email,
        name,
        role,
        password: hashed,
        isActive: true,
        allowedIPs,
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        allowedIPs: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ user: created, tempPassword: plainPassword ? undefined : tempPassword }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to create admin/staff user', details: e?.message }, { status: 500 });
  }
}

