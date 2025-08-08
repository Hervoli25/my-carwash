import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { adminAuthOptions, requireStaff } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StaffDashboardPage() {
  const session = await getServerSession(adminAuthOptions);

  if (!session || !(await requireStaff(session))) {
    // Hide existence in public mode
    notFound();
  }

  // Get today's bookings for quick operations
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date();
  endOfDay.setHours(23,59,59,999);

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ['CONFIRMED','IN_PROGRESS'] }
    },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      service: { select: { name: true, duration: true } },
      vehicle: { select: { make: true, model: true, licensePlate: true } }
    },
    orderBy: { timeSlot: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto max-w-6xl py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Staff Operations</h1>
        <div className="grid gap-4">
          {bookings.map(b => (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between">
                  <span>{b.service.name} — {b.vehicle.make} {b.vehicle.model} ({b.vehicle.licensePlate})</span>
                  <span className="text-sm text-gray-500">{new Date(b.bookingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({b.timeSlot})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <form action={`/api/staff/bookings/${b.id}/status`} method="post">
                  <input type="hidden" name="status" value="IN_PROGRESS" />
                  <Button type="submit" variant="outline">Start</Button>
                </form>
                <form action={`/api/staff/bookings/${b.id}/status`} method="post">
                  <input type="hidden" name="status" value="COMPLETED" />
                  <Button type="submit" variant="outline">Complete</Button>
                </form>
                <form action={`/api/staff/bookings/${b.id}/status`} method="post">
                  <input type="hidden" name="status" value="CANCELLED" />
                  <Button type="submit" variant="destructive">Cancel</Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 && (
            <p className="text-gray-600">No bookings today.</p>
          )}
        </div>
      </main>
    </div>
  );
}

