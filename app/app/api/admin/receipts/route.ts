import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

// API endpoint for external CRM to query receipts
export async function GET(request: NextRequest) {
  try {
    // Get API key from headers for external CRM authentication
    const headersList = headers();
    const apiKey = headersList.get('x-api-key');
    
    // Basic API key validation (you should use a proper API key system)
    if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const receiptNumber = searchParams.get('receiptNumber');
    const customerEmail = searchParams.get('customerEmail');
    const vehiclePlate = searchParams.get('vehiclePlate');
    const customerName = searchParams.get('customerName');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause based on query parameters
    const where: any = {};
    
    if (receiptNumber) {
      where.receiptNumber = { contains: receiptNumber, mode: 'insensitive' };
    }
    
    if (customerEmail) {
      where.customerEmail = { contains: customerEmail, mode: 'insensitive' };
    }
    
    if (vehiclePlate) {
      where.vehiclePlate = { contains: vehiclePlate, mode: 'insensitive' };
    }
    
    if (customerName) {
      where.customerName = { contains: customerName, mode: 'insensitive' };
    }
    
    if (startDate || endDate) {
      where.generatedAt = {};
      if (startDate) where.generatedAt.gte = new Date(startDate);
      if (endDate) where.generatedAt.lte = new Date(endDate);
    }

    // Query receipts with pagination
    const [receipts, totalCount] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          booking: {
            select: {
              id: true,
              bookingDate: true,
              timeSlot: true,
              status: true,
              notes: true
            }
          }
        },
        orderBy: { generatedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.receipt.count({ where })
    ]);

    // Format response for CRM
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt.id,
      receiptNumber: receipt.receiptNumber,
      bookingId: receipt.bookingId,
      customer: {
        id: receipt.userId,
        name: receipt.customerName,
        email: receipt.customerEmail,
        phone: receipt.customerPhone,
        fullDetails: receipt.user
      },
      service: {
        name: receipt.serviceName,
        category: receipt.serviceCategory
      },
      vehicle: {
        plate: receipt.vehiclePlate,
        details: JSON.parse(receipt.vehicleDetails || '{}')
      },
      financial: {
        baseAmount: receipt.baseAmount,
        addOnAmount: receipt.addOnAmount,
        totalAmount: receipt.totalAmount,
        paymentMethod: receipt.paymentMethod,
        paymentStatus: receipt.paymentStatus
      },
      tracking: {
        generatedAt: receipt.generatedAt,
        downloadedAt: receipt.downloadedAt,
        downloadCount: receipt.downloadCount,
        emailedAt: receipt.emailedAt,
        emailCount: receipt.emailCount
      },
      booking: receipt.booking,
      fullReceiptData: JSON.parse(receipt.receiptData || '{}')
    }));

    return NextResponse.json({
      success: true,
      data: formattedReceipts,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('CRM receipt query error:', error);
    return NextResponse.json({ 
      error: 'Failed to query receipts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get receipt statistics for CRM dashboard
export async function POST(request: NextRequest) {
  try {
    const headersList = headers();
    const apiKey = headersList.get('x-api-key');
    
    if (!apiKey || apiKey !== process.env.CRM_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized - Invalid API key' }, { status: 401 });
    }

    const { action, startDate, endDate } = await request.json();

    if (action === 'stats') {
      const dateFilter = startDate && endDate ? {
        generatedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      } : {};

      const [
        totalReceipts,
        totalRevenue,
        receiptsByPaymentStatus,
        receiptsByService,
        downloadStats
      ] = await Promise.all([
        prisma.receipt.count({ where: dateFilter }),
        prisma.receipt.aggregate({
          where: dateFilter,
          _sum: { totalAmount: true }
        }),
        prisma.receipt.groupBy({
          by: ['paymentStatus'],
          where: dateFilter,
          _count: true,
          _sum: { totalAmount: true }
        }),
        prisma.receipt.groupBy({
          by: ['serviceName'],
          where: dateFilter,
          _count: true,
          _sum: { totalAmount: true }
        }),
        prisma.receipt.aggregate({
          where: dateFilter,
          _sum: { downloadCount: true, emailCount: true }
        })
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          totalReceipts,
          totalRevenue: totalRevenue._sum.totalAmount || 0,
          paymentBreakdown: receiptsByPaymentStatus,
          serviceBreakdown: receiptsByService,
          downloadStats: {
            totalDownloads: downloadStats._sum.downloadCount || 0,
            totalEmails: downloadStats._sum.emailCount || 0
          }
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('CRM receipt stats error:', error);
    return NextResponse.json({ 
      error: 'Failed to get receipt statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}