import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ServiceCategory } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('🔐 Session check:', { 
      hasSession: !!session, 
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });
    
    if (!session?.user?.email) {
      console.error('❌ Unauthorized: No session or email');
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    const data = await request.json();
    console.log('📝 Booking data received:', JSON.stringify(data, null, 2));
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    
    console.log('👤 User lookup:', { found: !!user, email: session.user.email });

    if (!user) {
      // Create user if doesn't exist
      console.log('🆕 Creating new user...');
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        }
      });
      console.log('✅ User created:', { id: user.id, email: user.email });
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

    // Find or create service - try exact name match first, then fallback to key mapping
    let service = await prisma.service.findFirst({
      where: { 
        OR: [
          { name: { equals: data.serviceType, mode: 'insensitive' } },
          { name: { contains: data.serviceType, mode: 'insensitive' } }
        ]
      }
    });

    if (!service) {
      // Map service name to key for getServiceData function
      const serviceKey = mapServiceNameToKey(data.serviceType);
      console.log('🔄 Service mapping:', { 
        originalServiceType: data.serviceType, 
        mappedKey: serviceKey 
      });
      
      // Create service if doesn't exist
      const serviceData = getServiceData(serviceKey);
      const categoryValue = ServiceCategory[serviceData.category as keyof typeof ServiceCategory] ?? ServiceCategory.EXPRESS;
      service = await prisma.service.create({
        data: {
          name: serviceData.name,
          description: serviceData.description,
          shortDesc: serviceData.shortDesc,
          price: serviceData.price,
          duration: serviceData.duration,
          category: categoryValue,
          features: serviceData.features,
        }
      });
      
      console.log('✅ Service created:', { id: service.id, name: service.name });
    } else {
      console.log('✅ Service found:', { id: service.id, name: service.name });
    }

    // Calculate total amount (convert from Rand to cents)
    const totalAmount = Math.round(data.totalPrice * 100);
    const baseAmount = service.price; // service.price is already in cents
    
    console.log('💰 Price calculation:', {
      frontendTotal: data.totalPrice,
      totalAmountInCents: totalAmount,
      serviceBasePriceInCents: baseAmount,
      convertedDisplay: {
        total: totalAmount / 100,
        base: baseAmount / 100
      }
    });

    // Create booking
    console.log('📅 Creating booking with data:', {
      userId: user.id,
      serviceId: service.id,
      vehicleId: vehicle.id,
      bookingDate: new Date(data.preferredDate),
      timeSlot: data.preferredTime,
      totalAmount: totalAmount,
      baseAmount: baseAmount
    });
    
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
    
    console.log('🎉 Booking created successfully:', {
      id: booking.id,
      status: booking.status,
      totalAmount: booking.totalAmount,
      date: booking.bookingDate,
      timeSlot: booking.timeSlot
    });

    // Create payment record with selected payment method
    let paymentRecord = null;
    if (data.paymentMethod) {
      console.log('💳 Creating payment record:', {
        paymentMethod: data.paymentMethod,
        amount: totalAmount
      });

      paymentRecord = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalAmount,
          status: 'PENDING',
          description: `Payment for ${service.name}`,
          currency: 'ZAR',
          paymentDate: data.paymentMethod === 'cash' ? null : new Date(),
        }
      });

      console.log('✅ Payment record created:', paymentRecord.id);
    }

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
    console.error('💥 Booking creation error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    return NextResponse.json({ 
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function mapServiceNameToKey(serviceName: string): string {
  const nameToKeyMap = {
    'Express Exterior Wash': 'express',
    'Express Wash': 'express',
    'Express': 'express',
    'Premium Wash & Wax': 'premium',
    'Premium Wash': 'premium',
    'Premium': 'premium',
    'Deluxe Interior & Exterior': 'deluxe',
    'Deluxe Package': 'deluxe',
    'Deluxe': 'deluxe',
    'Executive Detail Package': 'executive',
    'Executive Detail': 'executive',
    'Executive': 'executive'
  };

  // Try exact match first
  for (const [name, key] of Object.entries(nameToKeyMap)) {
    if (serviceName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(serviceName.toLowerCase())) {
      return key;
    }
  }

  // Fallback to keyword matching
  const lowerServiceName = serviceName.toLowerCase();
  if (lowerServiceName.includes('express')) return 'express';
  if (lowerServiceName.includes('premium')) return 'premium';
  if (lowerServiceName.includes('deluxe')) return 'deluxe';
  if (lowerServiceName.includes('executive')) return 'executive';

  // Default fallback
  return 'express';
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
