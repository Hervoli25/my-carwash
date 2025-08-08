import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      });
    }

    // Find or create vehicle
    let vehicle = await prisma.vehicle.findFirst({
      where: {
        userId: user.id,
        licensePlate: data.plateNumber
      }
    });

    if (!vehicle) {
      // Determine vehicle type
      let vehicleType = 'SEDAN';
      const makeModel = `${data.vehicleMake} ${data.vehicleModel}`.toLowerCase();
      if (makeModel.includes('suv') || makeModel.includes('x5') || makeModel.includes('q7')) {
        vehicleType = 'SUV';
      } else if (makeModel.includes('bakkie') || makeModel.includes('hilux') || makeModel.includes('ranger')) {
        vehicleType = 'BAKKIE';
      } else if (makeModel.includes('hatch') || makeModel.includes('polo') || makeModel.includes('corsa')) {
        vehicleType = 'HATCHBACK';
      }

      vehicle = await prisma.vehicle.create({
        data: {
          userId: user.id,
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: parseInt(data.vehicleYear),
          color: data.vehicleColor,
          licensePlate: data.plateNumber,
          vehicleType: vehicleType as any,
          isPrimary: true
        }
      });
    }

    // Find or create service
    let service = await prisma.service.findFirst({
      where: { name: { contains: data.serviceType, mode: 'insensitive' } }
    });

    if (!service) {
      // Create service if doesn't exist
      const serviceData = getServiceData(data.serviceType);
      service = await prisma.service.create({
        data: serviceData
      });
    }

    // Calculate total amount (convert from Rand to cents)
    const totalAmount = Math.round(data.totalPrice * 100);
    const baseAmount = Math.round(service.price);

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        serviceId: service.id,
        vehicleId: vehicle.id,
        bookingDate: new Date(data.preferredDate),
        timeSlot: data.preferredTime,
        status: 'CONFIRMED',
        totalAmount: totalAmount,
        baseAmount: baseAmount,
        addOnAmount: totalAmount - baseAmount,
        notes: data.specialInstructions || null,
      },
      include: {
        user: true,
        service: true,
        vehicle: true
      }
    });

    // Handle add-ons if any
    if (data.addOns && data.addOns.length > 0) {
      for (const addOnId of data.addOns) {
        // Find or create add-on
        let addOn = await prisma.serviceAddOn.findFirst({
          where: { 
            serviceId: service.id,
            name: { contains: addOnId, mode: 'insensitive' }
          }
        });

        if (!addOn) {
          const addOnData = getAddOnData(addOnId);
          addOn = await prisma.serviceAddOn.create({
            data: {
              ...addOnData,
              serviceId: service.id
            }
          });
        }

        await prisma.bookingAddOn.create({
          data: {
            bookingId: booking.id,
            addOnId: addOn.id,
            quantity: 1,
            price: addOn.price
          }
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      booking: {
        id: booking.id,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
        totalAmount: booking.totalAmount / 100, // Convert back to Rand
        service: booking.service.name,
        vehicle: `${booking.vehicle.make} ${booking.vehicle.model} (${booking.vehicle.licensePlate})`
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function getServiceData(serviceType: string) {
  const services = {
    'express': {
      name: 'Express Exterior Wash',
      description: 'Quick exterior wash and dry',
      shortDesc: 'Express wash',
      price: 8000, // R80 in cents
      duration: 15,
      category: 'EXPRESS',
      features: ['Exterior wash', 'Quick dry', 'Tire cleaning']
    },
    'premium': {
      name: 'Premium Wash & Wax',
      description: 'Complete wash with wax protection',
      shortDesc: 'Premium wash',
      price: 15000, // R150 in cents
      duration: 30,
      category: 'PREMIUM',
      features: ['Exterior wash', 'Wax protection', 'Tire shine', 'Interior vacuum']
    },
    'deluxe': {
      name: 'Deluxe Interior & Exterior',
      description: 'Full interior and exterior detailing',
      shortDesc: 'Deluxe package',
      price: 20000, // R200 in cents
      duration: 60,
      category: 'DELUXE',
      features: ['Full exterior wash', 'Interior detailing', 'Dashboard treatment', 'Seat cleaning']
    },
    'executive': {
      name: 'Executive Detail Package',
      description: 'Premium detailing service',
      shortDesc: 'Executive detail',
      price: 30000, // R300 in cents
      duration: 120,
      category: 'EXECUTIVE',
      features: ['Complete detailing', 'Paint protection', 'Interior deep clean', 'Engine bay cleaning']
    }
  };

  return services[serviceType as keyof typeof services] || services.express;
}

function getAddOnData(addOnId: string) {
  const addOns = {
    'tire-shine': { name: 'Tire Shine', description: 'Premium tire shine treatment', price: 2500 },
    'air-freshener': { name: 'Premium Air Freshener', description: 'Long-lasting air freshener', price: 1500 },
    'dashboard-treatment': { name: 'Dashboard Treatment', description: 'UV protection for dashboard', price: 3500 },
    'floor-mats': { name: 'Floor Mat Deep Clean', description: 'Deep cleaning of floor mats', price: 5000 },
    'engine-bay': { name: 'Engine Bay Cleaning', description: 'Professional engine bay cleaning', price: 7500 }
  };

  return addOns[addOnId as keyof typeof addOns] || addOns['tire-shine'];
}
