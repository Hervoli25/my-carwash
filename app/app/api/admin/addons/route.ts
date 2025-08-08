import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions, requireAdmin, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId');

    const where: any = {};
    if (serviceId) {
      where.serviceId = serviceId;
    }

    const addOns = await prisma.serviceAddOn.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        service: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      addOns: addOns.map(addOn => ({
        id: addOn.id,
        name: addOn.name,
        description: addOn.description,
        price: addOn.price,
        isActive: addOn.isActive,
        serviceId: addOn.serviceId,
        service: addOn.service,
        createdAt: addOn.createdAt
      })),
      totalAddOns: addOns.length
    });

  } catch (error) {
    console.error('Admin add-ons fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch add-ons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(adminAuthOptions);

    if (!session || !(await requireAdmin(session))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, serviceId, isActive = true } = body;

    // Validation
    if (!name || !description || price === undefined || !serviceId) {
      return NextResponse.json({
        error: 'Name, description, price, and serviceId are required'
      }, { status: 400 });
    }

    if (price < 0) {
      return NextResponse.json({
        error: 'Price must be positive'
      }, { status: 400 });
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({
        error: 'Service not found'
      }, { status: 404 });
    }

    // Create new add-on
    const newAddOn = await prisma.serviceAddOn.create({
      data: {
        name,
        description,
        price: Math.round(price * 100), // Convert to cents
        serviceId,
        isActive
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    });

    // Log the action
    await logAdminAction(
      session.user.id,
      'CREATE_ADDON',
      'SERVICE_ADDON',
      newAddOn.id,
      null,
      {
        name,
        price: newAddOn.price,
        serviceId,
        serviceName: newAddOn.service.name
      },
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    );

    return NextResponse.json({
      message: 'Add-on created successfully',
      addOn: {
        id: newAddOn.id,
        name: newAddOn.name,
        description: newAddOn.description,
        price: newAddOn.price,
        serviceId: newAddOn.serviceId,
        isActive: newAddOn.isActive
      }
    });

  } catch (error) {
    console.error('Admin add-on creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create add-on' },
      { status: 500 }
    );
  }
}