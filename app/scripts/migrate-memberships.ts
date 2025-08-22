import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function migrateMemberships() {
  try {
    console.log('🚀 Starting membership migration...');

    // First, create membership plan configs
    console.log('📋 Creating membership plan configurations...');
    
    // Create Basic (FREE) plan
    const basicPlan = await prisma.membershipPlanConfig.upsert({
      where: { name: 'BASIC' },
      update: {},
      create: {
        name: 'BASIC',
        displayName: 'Basic Member',
        description: 'Perfect for occasional car washes',
        price: 0, // FREE
        duration: 365, // 1 year
        features: [
          '10% discount on all services',
          'Standard booking priority',
          '1x loyalty points',
          'Monthly newsletter',
          'Email customer support',
          'Digital membership card'
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

    console.log('✅ Membership plans created:', { basicPlan: basicPlan.id, premiumPlan: premiumPlan.id });

    // Now migrate existing memberships
    const existingMemberships = await prisma.membership.findMany({
      include: { user: true }
    });

    console.log(`📊 Found ${existingMemberships.length} existing memberships to migrate`);

    for (const membership of existingMemberships) {
      // Generate unique QR code
      const qrCode = `EKHAYA-${membership.userId}-${randomBytes(8).toString('hex').toUpperCase()}`;
      
      // Determine plan based on existing plan field
      const planId = membership.plan === 'PREMIUM' ? premiumPlan.id : basicPlan.id;
      
      // Update membership with new structure
      await prisma.membership.update({
        where: { id: membership.id },
        data: {
          membershipPlanId: planId,
          qrCode: qrCode,
          paymentMethod: membership.plan === 'BASIC' ? 'free_tier' : 'stripe_card'
        }
      });

      console.log(`✅ Migrated membership for user ${membership.user.email}: ${qrCode}`);
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateMemberships()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });