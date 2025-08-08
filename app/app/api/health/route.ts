import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Count users and bookings
    const userCount = await prisma.user.count();
    const bookingCount = await prisma.booking.count();
    const serviceCount = await prisma.service.count();
    
    console.log('🩺 Health check results:', {
      database: '✅ Connected',
      users: userCount,
      bookings: bookingCount,
      services: serviceCount,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      counts: {
        users: userCount,
        bookings: bookingCount,
        services: serviceCount
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('💥 Health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}