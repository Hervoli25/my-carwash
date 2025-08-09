import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { make, model, year, color, licensePlate, vehicleType } = body;

    // Validate required fields
    if (!make || !model || !year || !color || !licensePlate || !vehicleType) {
      return NextResponse.json(
        { error: 'All fields including vehicle type are required' },
        { status: 400 }
      );
    }

    // Check if license plate already exists for this user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        licensePlate: licensePlate.toUpperCase(),
        userId: user.id,
      },
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'A vehicle with this license plate already exists' },
        { status: 400 }
      );
    }

    // Create the vehicle
    const vehicle = await prisma.vehicle.create({
      data: {
        make: make.trim(),
        model: model.trim(),
        year: parseInt(year),
        color: color.trim(),
        licensePlate: licensePlate.toUpperCase().trim(),
        vehicleType: vehicleType,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: 'Vehicle added successfully',
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
      },
    });

  } catch (error) {
    console.error('Error adding vehicle:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    // Get all vehicles for the user
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      vehicles: vehicles.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        licensePlate: vehicle.licensePlate,
        createdAt: vehicle.createdAt,
      })),
    });

  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
