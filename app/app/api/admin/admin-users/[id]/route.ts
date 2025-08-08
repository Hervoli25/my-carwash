import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import bcryptjs from 'bcryptjs';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireAdmin(session))) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, email, role, isActive, password, allowedIPs } = body || {};

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = !!isActive;
    if (Array.isArray(allowedIPs)) data.allowedIPs = allowedIPs;
    if (password) {
      data.password = await bcryptjs.hash(password, 10);
    }

    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        allowedIPs: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update', details: e?.message }, { status: 500 });
  }
}

