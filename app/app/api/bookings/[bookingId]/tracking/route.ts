import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Compute tracking stages based on booking status, service duration and timestamps
function buildTracking(booking: any, service: any) {
  const startAt = new Date(booking.bookingDate); // Use scheduled start time
  const now = new Date();
  const durationMin: number = service?.duration ?? 30; // minutes

  // Estimate completion based on scheduled start + service duration
  const estComplete = new Date(startAt.getTime() + durationMin * 60 * 1000);

  // Define stages and their estimated portions of the duration
  // Scheduled (pre-start), Arrival 5%, Pre-wash 15%, Wash 70%, Quality 10%
  const portions = {
    scheduled: 0,
    arrival: Math.max(2, Math.round(durationMin * 0.05)),
    pre: Math.max(3, Math.round(durationMin * 0.15)),
    wash: Math.max(10, Math.round(durationMin * 0.7)),
    quality: Math.max(2, Math.round(durationMin * 0.1)),
  };

  let totalProgress = 0;
  let current = 'scheduled' as 'scheduled' | 'arrival' | 'pre' | 'wash' | 'quality' | 'complete';

  const hasStartedByTime = now.getTime() >= startAt.getTime();
  const overdueMs = hasStartedByTime ? Math.max(0, now.getTime() - startAt.getTime()) : 0;
  const overdueMinutes = Math.floor(overdueMs / 60000);

  // Derive progress from status and time
  if (booking.status === 'COMPLETED' && booking.completedAt) {
    totalProgress = 100;
    current = 'complete';
  } else if (!hasStartedByTime) {
    // Not started yet by scheduled time
    totalProgress = 0;
    current = 'scheduled';
  } else if (booking.status === 'IN_PROGRESS') {
    // Time-based progress capped to 95% until completed
    const elapsedMs = Math.max(0, now.getTime() - startAt.getTime());
    const totalMs = durationMin * 60 * 1000;
    totalProgress = Math.min(95, Math.round((elapsedMs / totalMs) * 100));
  } else if (booking.status === 'CONFIRMED') {
    // Scheduled time has passed but not marked IN_PROGRESS by staff yet
    totalProgress = 5; // show as awaiting check-in
    current = 'arrival';
  } else if (booking.status === 'CANCELLED' || booking.status === 'NO_SHOW') {
    totalProgress = 0;
    current = 'scheduled';
  }

  // Determine which stage is current based on progress once started
  const thresholds = {
    arrival: portions.arrival,
    pre: portions.arrival + portions.pre,
    wash: portions.arrival + portions.pre + portions.wash,
    quality: portions.arrival + portions.pre + portions.wash + portions.quality,
  };

  if (totalProgress >= 100 || current === 'complete') {
    current = 'complete';
  } else if (current !== 'scheduled') {
    if (totalProgress < thresholds.arrival) current = 'arrival';
    else if (totalProgress < thresholds.pre) current = 'pre';
    else if (totalProgress < thresholds.wash) current = 'wash';
    else current = 'quality';
  }

  const stages = [
    {
      id: 'scheduled',
      name: 'Scheduled',
      completed: hasStartedByTime && (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED'),
      current: current === 'scheduled',
      estimatedTime: 0,
      notes: `Starts at ${startAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    },
    {
      id: 'arrival',
      name: 'Vehicle Arrival Check-in',
      completed: current !== 'scheduled' && (totalProgress >= thresholds.arrival),
      current: current === 'arrival',
      estimatedTime: portions.arrival,
      notes: booking.notes ? 'Special instructions: ' + booking.notes : undefined,
    },
    {
      id: 'pre',
      name: 'Pre-Wash Inspection',
      completed: totalProgress >= thresholds.pre && current !== 'scheduled',
      current: current === 'pre',
      estimatedTime: portions.pre,
    },
    {
      id: 'wash',
      name: 'Premium Wash Process',
      completed: totalProgress >= thresholds.wash && current !== 'scheduled',
      current: current === 'wash',
      estimatedTime: portions.wash,
    },
    {
      id: 'quality',
      name: 'Quality Check & Final Photos',
      completed: totalProgress >= thresholds.quality || current === 'complete',
      current: current === 'quality',
      estimatedTime: portions.quality,
    },
    {
      id: 'complete',
      name: 'Ready for Pickup',
      completed: totalProgress >= 100 || booking.status === 'COMPLETED',
      current: current === 'complete',
      estimatedTime: 0,
    },
  ];

  return {
    stages,
    totalProgress: Math.min(100, totalProgress),
    estimatedCompletion: booking.status === 'COMPLETED' && booking.completedAt
      ? new Date(booking.completedAt).toISOString()
      : estComplete.toISOString(),
    actualCompletion: booking.completedAt ? new Date(booking.completedAt).toISOString() : null,
    status: booking.status,
    startsAt: startAt.toISOString(),
    overdue: booking.status === 'CONFIRMED' && hasStartedByTime,
    overdueMinutes: booking.status === 'CONFIRMED' && hasStartedByTime ? overdueMinutes : 0,
  };
}

export async function GET(request: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = params.bookingId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        user: { select: { id: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ensure user owns the booking (or is admin)
    const isOwner = booking.user.email === session.user.email;

    let isAdmin = false;
    try {
      // Try to infer admin via a simple flag on session (if present)
      // Fallback to email domain check if you like; keeping it false by default for safety
      // @ts-ignore
      isAdmin = Boolean(session.user?.isAdmin);
    } catch {
      isAdmin = false;
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tracking = buildTracking(booking, booking.service);
    return NextResponse.json(tracking);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load tracking' }, { status: 500 });
  }
}

