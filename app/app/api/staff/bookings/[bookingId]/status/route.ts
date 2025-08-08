import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireStaff, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  const session = await getServerSession(adminAuthOptions);
  if (!session || !(await requireStaff(session))) {
    // avoid revealing the endpoint
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  try {
    const { bookingId } = params;
    const form = await request.formData();
    const status = String(form.get('status') || '');

    if (!['CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const oldStatus = booking.status;
    const data: any = { status };
    if (status === 'COMPLETED') data.completedAt = new Date();
    if (status === 'CANCELLED') data.cancelledAt = new Date();

    const updated = await prisma.booking.update({ where: { id: bookingId }, data });

    // Audit log
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const ua = request.headers.get('user-agent') || 'unknown';
    await logAdminAction(
      session.user.id,
      'UPDATE_BOOKING_STATUS',
      'BOOKING',
      bookingId,
      { status: oldStatus },
      { status },
      ip,
      ua
    );

    return NextResponse.redirect(new URL('/staff/dashboard', request.url), 303);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

