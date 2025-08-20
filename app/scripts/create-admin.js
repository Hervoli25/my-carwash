const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');
    
    // Get admin password from environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD environment variable is required');
    }
    
    // Hash the admin password
    const hashedPassword = await bcryptjs.hash(adminPassword, 12);
    
    // Create or update admin user
    const adminUser = await prisma.adminUser.upsert({
      where: { username: 'admin' },
      update: {
        password: hashedPassword,
        isActive: true,
        twoFactorEnabled: false,
        failedLogins: 0,
        lockedUntil: null
      },
      create: {
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@example.com',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
        twoFactorEnabled: false,
        allowedIPs: [], // Empty array means all IPs allowed
        failedLogins: 0,
        lockedUntil: null
      }
    });

    console.log('✅ Admin user created/updated successfully:');
    console.log(`   Username: admin`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   2FA Enabled: ${adminUser.twoFactorEnabled}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();