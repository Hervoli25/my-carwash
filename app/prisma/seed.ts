import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create membership plan configurations
  console.log('📋 Creating membership plans...');
  
  // Create Basic (FREE) plan
  const basicPlan = await prisma.membershipPlanConfig.upsert({
    where: { name: 'BASIC' },
    update: {},
    create: {
      name: 'BASIC',
      displayName: 'Basic Member',
      description: 'Perfect for occasional car washes',
      price: 0, // FREE
      duration: 365, // 1 year (never expires for free)
      features: [
        '10% discount on all services',
        'Standard booking priority',
        '1x loyalty points',
        'Monthly newsletter',
        'Email customer support',
        'Digital membership card with QR code'
      ],
      discountRate: 0.1,
      loyaltyMultiplier: 1.0,
      isActive: true,
      isDefault: true, // Auto-assign this to new users
      sortOrder: 1
    }
  });

  // Create Premium plan
  const premiumPlan = await prisma.membershipPlanConfig.upsert({
    where: { name: 'PREMIUM' },
    update: {},
    create: {
      name: 'PREMIUM',
      displayName: 'Premium Member',
      description: 'Great value for regular car care',
      price: 9900, // R99
      duration: 30, // Monthly
      features: [
        '20% discount on all services',
        'Priority booking slots',
        '2x loyalty points earned',
        'Free tire shine monthly',
        'WhatsApp customer support',
        'Birthday month special discount',
        'Booking reminders via SMS',
        'Premium digital membership card'
      ],
      discountRate: 0.2,
      loyaltyMultiplier: 2.0,
      isActive: true,
      isDefault: false,
      sortOrder: 2
    }
  });

  console.log('✅ Membership plans created:');
  console.log('  - Basic (FREE):', basicPlan.id);
  console.log('  - Premium (R99):', premiumPlan.id);

  console.log('🌱 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });