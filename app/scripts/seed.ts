
import { PrismaClient, ServiceCategory, NotificationType, PaymentMethodType } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed database...');

  try {
    // Create test user - use environment variable for password
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestUser123!';
    const hashedPassword = await bcryptjs.hash(testPassword, 12);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {},
      create: {
        email: 'john@doe.com',
        password: hashedPassword,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+27-123-456-789',
        city: 'Cape Town',
        province: 'Western Cape',
        address: '123 Main Street',
        isAdmin: true,
        loyaltyPoints: 450,
      },
    });

    console.log('✅ Created test user:', testUser.email);

    // Create services based on realistic car wash pricing
    const services = [
      {
        name: 'Thunder Wash & Vacuum',
        description: 'Quick clean for busy lifestyles! Our professional team provides regular maintenance for your vehicle.',
        shortDesc: 'Exterior rinse, soap application, high-pressure wash, spot-free rinse, air dry, vacuum',
        price: 19000, // R190 in cents (average of small to large cars)
        duration: 30,
        category: ServiceCategory.EXPRESS,
        features: [
          'Exterior rinse',
          'Soap application',
          'High-pressure wash', 
          'Spot-free rinse',
          'Air dry',
          'Interior vacuum'
        ],
        rating: 4.9,
        reviewCount: 6904,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center',
      },
      {
        name: 'Classic Wash & Wax Express',
        description: 'Premium car care with express wax protection. Perfect for frequent drivers who want lasting shine.',
        shortDesc: 'Complete wash, vacuum plus express wax protection for enhanced shine',
        price: 24000, // R240 in cents (average pricing)
        duration: 45,
        category: ServiceCategory.PREMIUM,
        features: [
          'Pre-rinse',
          'Soap application',
          'Express wax protection',
          'Professional drying',
          'Tire shine',
          'Interior vacuum',
          'Trim protection',
          'Wheels cleaning'
        ],
        rating: 4.8,
        reviewCount: 367,
        imageUrl: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop&crop=center',
      },
      {
        name: 'Supreme Wash & Polish',
        description: 'Comprehensive wash and premium wax polish service for superior protection and shine.',
        shortDesc: 'Complete wash, vacuum plus premium radiant wax polish treatment',
        price: 35000, // R350 in cents (average pricing)
        duration: 60,
        category: ServiceCategory.DELUXE,
        features: [
          'Complete exterior wash',
          'Premium radiant wax polish',
          'Interior vacuum',
          'Dashboard treatment',
          'Window cleaning inside & out',
          'Tire shine treatment',
          'Air freshener'
        ],
        rating: 4.7,
        reviewCount: 892,
        imageUrl: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=400&h=300&fit=crop&crop=center',
      },
      {
        name: 'Ultimate Detail Experience',
        description: 'The ultimate car detailing experience with clay bar treatment and premium machine buffing.',
        shortDesc: 'Complete detailing with clay bar treatment, machine buff and premium HD wax',
        price: 55000, // R550 in cents (average pricing)
        duration: 120,
        category: ServiceCategory.EXECUTIVE,
        features: [
          'Complete exterior wash',
          'Clay bar treatment',
          'Machine buffing',
          'Premium HD wax finish',
          'Interior deep clean',
          'Leather conditioning',
          'Engine bay cleaning',
          'Quality inspection'
        ],
        rating: 4.9,
        reviewCount: 1543,
        imageUrl: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center',
      },
    ];

    const createdServices = [];
    for (const service of services) {
      const createdService = await prisma.service.upsert({
        where: { name: service.name },
        update: service,
        create: service,
      });
      createdServices.push(createdService);
      console.log(`✅ Created service: ${service.name}`);
    }

    // Create service add-ons with realistic pricing
    const createdAddOns = [];
    const addOns = [
      {
        serviceId: createdServices[0].id, // Thunder Wash
        name: 'Premium Tire Shine',
        description: 'Professional tire shine and sidewall treatment',
        price: 5000, // R50
      },
      {
        serviceId: createdServices[0].id, // Thunder Wash
        name: 'Dashboard Treatment',
        description: 'Dashboard cleaning and UV protection treatment',
        price: 4000, // R40
      },
      {
        serviceId: createdServices[0].id, // Thunder Wash
        name: 'Premium Air Freshener',
        description: 'Long-lasting premium air freshener application',
        price: 3000, // R30
      },
      {
        serviceId: createdServices[1].id, // Classic Wash & Wax
        name: 'Leather Conditioning',
        description: 'Professional leather conditioning and protection treatment',
        price: 8000, // R80
      },
      {
        serviceId: createdServices[1].id, // Classic Wash & Wax
        name: 'Engine Bay Cleaning',
        description: 'Complete engine bay cleaning and detailing service',
        price: 12000, // R120
      },
      {
        serviceId: createdServices[1].id, // Classic Wash & Wax
        name: 'Premium Wheel Detail',
        description: 'Specialized wheel and rim cleaning with protection coating',
        price: 7000, // R70
      },
      {
        serviceId: createdServices[2].id, // Supreme Wash & Polish
        name: 'Headlight Restoration',
        description: 'Professional headlight restoration service',
        price: 15000, // R150
      },
      {
        serviceId: createdServices[3].id, // Ultimate Detail
        name: 'Paint Protection Treatment',
        description: 'Advanced paint protection and ceramic coating application',
        price: 25000, // R250
      },
    ];

    for (const addOn of addOns) {
      const existingAddOn = await prisma.serviceAddOn.findFirst({
        where: {
          serviceId: addOn.serviceId,
          name: addOn.name
        }
      });

      if (!existingAddOn) {
        const createdAddOn = await prisma.serviceAddOn.create({
          data: addOn,
        });
        createdAddOns.push(createdAddOn);
        console.log(`✅ Created add-on: ${addOn.name}`);
      } else {
        createdAddOns.push(existingAddOn);
      }
    }

    // Create test vehicle for user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        userId: testUser.id,
        licensePlate: 'CA632JJ'
      }
    });

    const testVehicle = await prisma.vehicle.upsert({
      where: { licensePlate: 'CA632JJ' },
      update: {
        make: 'BYD',
        model: 'SUV',
        year: 2024,
        color: 'Blue',
        vehicleType: 'SUV',
      },
      create: {
        userId: testUser.id,
        make: 'BYD',
        model: 'SUV',
        year: 2024,
        color: 'Blue',
        licensePlate: 'CA632JJ',
        vehicleType: 'SUV',
        isPrimary: true,
      },
    });

    console.log('✅ Created test vehicle');

    // Create sample bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3); // 3 days from now
    
    const sampleBooking = await prisma.booking.upsert({
      where: { id: 'sample-booking-1' },
      update: {},
      create: {
        id: 'sample-booking-1',
        userId: testUser.id,
        serviceId: createdServices[0].id, // Express Exterior Wash (8000 cents = R80)
        vehicleId: testVehicle.id,
        bookingDate: tomorrow,
        timeSlot: '11:30',
        status: 'CONFIRMED',
        totalAmount: 10500, // R80 + R20 + R5 = R105
        baseAmount: 8000,   // R80 for Express Wash
        addOnAmount: 2500,  // R20 + R5 = R25
        notes: 'Please pay attention to the interior as well.',
      },
    });

    // Create booking add-ons for this booking
    const bookingAddOns = [
      {
        bookingId: sampleBooking.id,
        addOnId: createdAddOns[0].id, // Interior vacuum - R20
        quantity: 1,
        price: 2000, // R20 in cents
      },
      {
        bookingId: sampleBooking.id,
        addOnId: createdAddOns[2].id, // Air freshener - R10
        quantity: 1,
        price: 1000, // R10 in cents
      },
    ];

    for (const bookingAddOn of bookingAddOns) {
      const existing = await prisma.bookingAddOn.findFirst({
        where: {
          bookingId: bookingAddOn.bookingId,
          addOnId: bookingAddOn.addOnId,
        },
      });
      
      if (!existing) {
        await prisma.bookingAddOn.create({
          data: bookingAddOn,
        });
      }
    }

    console.log('✅ Created sample booking with add-ons');

    // Create sample reviews
    const reviews = [
      {
        userId: testUser.id,
        serviceId: createdServices[0].id,
        rating: 5,
        comment: 'Excellent service! Quick and professional. My car looks amazing.',
      },
      {
        userId: testUser.id,
        serviceId: createdServices[1].id,
        rating: 5,
        comment: 'Outstanding premium service. The lounge area is great for waiting.',
      },
    ];

    for (const review of reviews) {
      const existingReview = await prisma.review.findFirst({
        where: {
          userId: review.userId,
          serviceId: review.serviceId
        }
      });

      if (!existingReview) {
        await prisma.review.create({
          data: review,
        });
      }
    }

    console.log('✅ Created sample reviews');

    // Create sample notifications
    const notifications = [
      {
        userId: testUser.id,
        title: 'Premium Wash',
        message: 'Your booking for Apr 25, 2024 at 10:00 AM is confirmed.',
        type: NotificationType.BOOKING,
      },
      {
        userId: testUser.id,
        title: 'Update on account settings updated',
        message: 'Your account settings have been successfully updated.',
        type: NotificationType.SYSTEM,
      },
      {
        userId: testUser.id,
        title: 'Special promotion',
        message: 'Get 20% off your next premium service!',
        type: NotificationType.PROMOTION,
      },
      {
        userId: testUser.id,
        title: 'Reminder: car wash',
        message: 'Don\'t forget your upcoming car wash appointment.',
        type: NotificationType.REMINDER,
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
    }

    console.log('✅ Created sample notifications');

    // Create sample payment methods
    const paymentMethods = [
      {
        userId: testUser.id,
        type: PaymentMethodType.STRIPE_CARD,
        lastFour: '4532',
        expiryMonth: 12,
        expiryYear: 25,
        cardholderName: 'John Doe',
        stripeBrand: 'VISA',
        stripePaymentMethodId: 'pm_test_visa_4532',
        stripeFingerprint: 'test_fingerprint_visa',
        isDefault: true,
      },
      {
        userId: testUser.id,
        type: PaymentMethodType.STRIPE_CARD,
        lastFour: '8901',
        expiryMonth: 8,
        expiryYear: 25,
        cardholderName: 'John Doe',
        stripeBrand: 'MASTERCARD',
        stripePaymentMethodId: 'pm_test_mastercard_8901',
        stripeFingerprint: 'test_fingerprint_mastercard',
        isDefault: false,
      }
    ];

    for (const paymentMethod of paymentMethods) {
      const existing = await prisma.paymentMethod.findFirst({
        where: {
          userId: paymentMethod.userId,
          lastFour: paymentMethod.lastFour
        }
      });

      if (!existing) {
        await prisma.paymentMethod.create({
          data: paymentMethod,
        });
      }
    }

    console.log('✅ Created sample payment methods');

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
