import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const vehicleId = params.id;

    // Verify vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: user.id,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if vehicle has any active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        vehicleId: vehicleId,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with active bookings. Please cancel or complete existing bookings first.' },
        { status: 400 }
      );
    }

    // Delete the vehicle
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({
      message: 'Vehicle deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const vehicleId = params.id;
    const body = await request.json();
    const { make, model, year, color, licensePlate } = body;

    // Verify vehicle belongs to user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: user.id,
      },
    });

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if license plate is already taken by another vehicle
    if (licensePlate !== existingVehicle.licensePlate) {
      const duplicatePlate = await prisma.vehicle.findFirst({
        where: {
          licensePlate: licensePlate,
          userId: user.id,
          id: { not: vehicleId }
        }
      });

      if (duplicatePlate) {
        return NextResponse.json(
          { error: 'A vehicle with this license plate already exists' },
          { status: 400 }
        );
      }
    }

    // Update the vehicle
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        make,
        model,
        year: parseInt(year),
        color,
        licensePlate,
      },
    });

    return NextResponse.json({
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle,
    });

  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
