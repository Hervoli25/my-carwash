import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Starting database validation...');

  try {
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Validate Users
    const users = await prisma.user.count();
    const admins = await prisma.user.count({ where: { isAdmin: true } });
    console.log(`👥 Users: ${users} total, ${admins} admins`);

    // Validate Vehicles
    const vehicles = await prisma.vehicle.count();
    const primaryVehicles = await prisma.vehicle.count({ where: { isPrimary: true } });
    console.log(`🚗 Vehicles: ${vehicles} total, ${primaryVehicles} primary`);

    // Check for duplicate license plates
    const duplicatePlates = await prisma.$queryRaw`
      SELECT "licensePlate", COUNT(*) as count 
      FROM "Vehicle" 
      GROUP BY "licensePlate" 
      HAVING COUNT(*) > 1
    `;
    if (Array.isArray(duplicatePlates) && duplicatePlates.length > 0) {
      console.warn('⚠️  Duplicate license plates found:', duplicatePlates);
    } else {
      console.log('✅ No duplicate license plates');
    }

    // Validate Services
    const services = await prisma.service.count();
    const activeServices = await prisma.service.count({ where: { isActive: true } });
    console.log(`🛎️  Services: ${services} total, ${activeServices} active`);

    // Validate Service Categories
    const serviceCategories = await prisma.service.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    console.log('📊 Service categories:', serviceCategories);

    // Validate Bookings
    const bookings = await prisma.booking.count();
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    console.log(`📅 Bookings: ${bookings} total`);
    console.log('📊 Booking statuses:', bookingsByStatus);

    // Validate Payments
    const payments = await prisma.payment.count();
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    console.log(`💳 Payments: ${payments} total`);
    console.log('📊 Payment statuses:', paymentsByStatus);

    // Check for bookings without payments
    const bookingsWithoutPayments = await prisma.booking.count({
      where: { payment: null }
    });
    if (bookingsWithoutPayments > 0) {
      console.warn(`⚠️  ${bookingsWithoutPayments} bookings without payments`);
    } else {
      console.log('✅ All bookings have payments');
    }

    // Validate Payment Methods
    const paymentMethods = await prisma.paymentMethod.count();
    const activePaymentMethods = await prisma.paymentMethod.count({ where: { isActive: true } });
    console.log(`💳 Payment Methods: ${paymentMethods} total, ${activePaymentMethods} active`);

    // Validate Memberships
    const memberships = await prisma.membership.count();
    const activeMemberships = await prisma.membership.count({ where: { isActive: true } });
    console.log(`🏆 Memberships: ${memberships} total, ${activeMemberships} active`);

    // Validate Reviews
    const reviews = await prisma.review.count();
    const visibleReviews = await prisma.review.count({ where: { isVisible: true } });
    const avgRating = await prisma.review.aggregate({
      _avg: { rating: true }
    });
    console.log(`⭐ Reviews: ${reviews} total, ${visibleReviews} visible`);
    console.log(`📊 Average rating: ${avgRating._avg.rating?.toFixed(2) || 'N/A'}`);

    // Validate Notifications
    const notifications = await prisma.notification.count();
    const unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
    console.log(`🔔 Notifications: ${notifications} total, ${unreadNotifications} unread`);

    // Check referential integrity
    console.log('\n🔗 Checking referential integrity...');

    // Check orphaned vehicles (vehicles without users)
    const orphanedVehicles = await prisma.vehicle.count({
      where: {
        user: {
          is: null
        }
      }
    });
    if (orphanedVehicles > 0) {
      console.warn(`⚠️  ${orphanedVehicles} orphaned vehicles found`);
    } else {
      console.log('✅ No orphaned vehicles');
    }

    // Check orphaned bookings (bookings without required relations)
    const orphanedBookings = await prisma.booking.count({
      where: {
        OR: [
          { user: { is: null } },
          { service: { is: null } },
          { vehicle: { is: null } }
        ]
      }
    });
    if (orphanedBookings > 0) {
      console.warn(`⚠️  ${orphanedBookings} orphaned bookings found`);
    } else {
      console.log('✅ No orphaned bookings');
    }

    console.log('\n🎉 Database validation completed!');
  } catch (error) {
    console.error('❌ Error during validation:', error);
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
