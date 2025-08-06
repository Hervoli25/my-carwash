
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed database...');

  try {
    // Create admin/test user
    const hashedPassword = await bcryptjs.hash('johndoe123', 10);
    
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

    // Create services based on wireframes
    const services = [
      {
        name: 'Express Exterior Wash',
        description: 'Quick clean for busy lifestyles! Our professional team provides regular maintenance for your vehicle.',
        shortDesc: 'Exterior rinse, soap application, high-pressure wash, spot-free rinse, air dry',
        price: 8000, // R80 in cents
        duration: 30,
        category: 'EXPRESS',
        features: [
          'Exterior rinse',
          'Soap application',
          'High-pressure wash', 
          'Spot-free rinse',
          'Air dry'
        ],
        rating: 4.9,
        reviewCount: 6904,
      },
      {
        name: 'Premium Wash & Wax',
        description: 'Premium car care with productive customer lounge experience. Extended protection for frequent drivers.',
        shortDesc: 'Complete wash, wax protection, tire shine, interior vacuum, trim protection',
        price: 15000, // R150 in cents
        duration: 60,
        category: 'PREMIUM',
        features: [
          'Pre-rinse',
          'Soap application',
          'Contact & wax protection',
          'Professional drying',
          'Tire shine',
          'Interior vacuum',
          'Trim protection',
          'Wheels & cleaning'
        ],
        rating: 4.8,
        reviewCount: 367,
      },
      {
        name: 'Deluxe Interior & Exterior',
        description: 'Comprehensive interior and exterior cleaning service for complete vehicle care.',
        shortDesc: 'Full interior and exterior cleaning with premium treatments',
        price: 20000, // R200 in cents
        duration: 90,
        category: 'DELUXE',
        features: [
          'Complete exterior wash',
          'Interior deep clean',
          'Dashboard treatment',
          'Leather conditioning',
          'Window cleaning',
          'Vacuum cleaning',
          'Air freshener'
        ],
        rating: 4.7,
        reviewCount: 892,
      },
      {
        name: 'Executive Detail Package',
        description: 'The ultimate car detailing experience with premium treatments and finishing.',
        shortDesc: 'Complete detailing service with premium treatments and protection',
        price: 30000, // R300 in cents
        duration: 120,
        category: 'EXECUTIVE',
        features: [
          'Premium exterior detailing',
          'Complete interior detailing',
          'Paint protection',
          'Leather conditioning',
          'Engine bay cleaning',
          'Tire treatment',
          'Premium wax finish',
          'Quality inspection'
        ],
        rating: 4.9,
        reviewCount: 1543,
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

    // Create service add-ons
    const addOns = [
      {
        serviceId: createdServices[0].id, // Express
        name: 'Interior vacuum',
        description: 'Complete interior vacuum cleaning',
        price: 2000, // R20
      },
      {
        serviceId: createdServices[0].id, // Express
        name: 'Tire shine',
        description: 'Professional tire shine treatment',
        price: 1500, // R15
      },
      {
        serviceId: createdServices[0].id, // Express
        name: 'Air freshener',
        description: 'Premium air freshener application',
        price: 1000, // R10
      },
      {
        serviceId: createdServices[1].id, // Premium
        name: 'Leather Conditioning',
        description: 'Professional leather conditioning treatment',
        price: 4000, // R40
      },
      {
        serviceId: createdServices[1].id, // Premium
        name: 'Engine cleaning',
        description: 'Engine bay cleaning and detailing',
        price: 5000, // R50
      },
      {
        serviceId: createdServices[1].id, // Premium
        name: 'Wheel cleaning',
        description: 'Specialized wheel and rim cleaning',
        price: 2500, // R25
      },
      {
        serviceId: createdServices[1].id, // Premium
        name: 'Complete waxing',
        description: 'Full vehicle wax protection',
        price: 10000, // R100
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
        await prisma.serviceAddOn.create({
          data: addOn,
        });
        console.log(`✅ Created add-on: ${addOn.name}`);
      }
    }

    // Create test vehicle for user
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        userId: testUser.id,
        licensePlate: 'CA 123 GP'
      }
    });

    const testVehicle = existingVehicle || await prisma.vehicle.create({
      data: {
        userId: testUser.id,
        make: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Silver',
        licensePlate: 'CA 123 GP',
        vehicleType: 'SEDAN',
        isPrimary: true,
      },
    });

    console.log('✅ Created test vehicle');

    // Create sample bookings
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const sampleBooking = await prisma.booking.upsert({
      where: { id: 'sample-booking-1' },
      update: {},
      create: {
        id: 'sample-booking-1',
        userId: testUser.id,
        serviceId: createdServices[1].id, // Premium service
        vehicleId: testVehicle.id,
        bookingDate: tomorrow,
        timeSlot: '10:00 AM',
        status: 'CONFIRMED',
        totalAmount: 15000,
        baseAmount: 15000,
        addOnAmount: 0,
      },
    });

    console.log('✅ Created sample booking');

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
        type: 'BOOKING',
      },
      {
        userId: testUser.id,
        title: 'Update on account settings updated',
        message: 'Your account settings have been successfully updated.',
        type: 'SYSTEM',
      },
      {
        userId: testUser.id,
        title: 'Special promotion',
        message: 'Get 20% off your next premium service!',
        type: 'PROMOTION',
      },
      {
        userId: testUser.id,
        title: 'Reminder: car wash',
        message: 'Don\'t forget your upcoming car wash appointment.',
        type: 'REMINDER',
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
        type: 'STRIPE_CARD',
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
        type: 'STRIPE_CARD',
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
