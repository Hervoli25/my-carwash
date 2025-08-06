import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting database migration...');

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Run any custom migration logic here
    console.log('🔧 Running custom migrations...');

    // Example: Update existing data to match new enum values
    // This would be needed when migrating from string to enum types
    
    // Update service categories to uppercase
    await prisma.$executeRaw`
      UPDATE "Service" 
      SET category = UPPER(category) 
      WHERE category IN ('express', 'premium', 'deluxe', 'executive')
    `;
    console.log('✅ Updated service categories');

    // Update vehicle types to uppercase
    await prisma.$executeRaw`
      UPDATE "Vehicle" 
      SET "vehicleType" = UPPER("vehicleType") 
      WHERE "vehicleType" IN ('sedan', 'suv', 'hatchback', 'bakkie', 'coupe', 'convertible', 'wagon', 'truck')
    `;
    console.log('✅ Updated vehicle types');

    // Update booking statuses to uppercase
    await prisma.$executeRaw`
      UPDATE "Booking" 
      SET status = UPPER(status) 
      WHERE status IN ('confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')
    `;
    console.log('✅ Updated booking statuses');

    // Update payment statuses to uppercase
    await prisma.$executeRaw`
      UPDATE "Payment" 
      SET status = UPPER(status) 
      WHERE status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')
    `;
    console.log('✅ Updated payment statuses');

    // Update payment method types to uppercase
    await prisma.$executeRaw`
      UPDATE "PaymentMethod" 
      SET type = UPPER(type) 
      WHERE type IN ('visa', 'mastercard', 'american_express', 'discovery', 'cash', 'eft')
    `;
    console.log('✅ Updated payment method types');

    // Update membership plans to uppercase
    await prisma.$executeRaw`
      UPDATE "Membership" 
      SET plan = UPPER(plan) 
      WHERE plan IN ('basic', 'premium', 'elite')
    `;
    console.log('✅ Updated membership plans');

    // Update notification types to uppercase
    await prisma.$executeRaw`
      UPDATE "Notification" 
      SET type = UPPER(type) 
      WHERE type IN ('booking', 'promotion', 'reminder', 'system', 'payment')
    `;
    console.log('✅ Updated notification types');

    // Update user genders to uppercase
    await prisma.$executeRaw`
      UPDATE "User" 
      SET gender = UPPER(gender) 
      WHERE gender IN ('male', 'female', 'other', 'prefer_not_to_say')
    `;
    console.log('✅ Updated user genders');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
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
