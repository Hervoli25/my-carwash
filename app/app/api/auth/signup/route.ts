import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone } = await request.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Get the default (Basic) membership plan
    const defaultMembershipPlan = await prisma.membershipPlanConfig.findFirst({
      where: { 
        isDefault: true,
        isActive: true 
      }
    });

    if (!defaultMembershipPlan) {
      return NextResponse.json(
        { error: 'Default membership plan not found' },
        { status: 500 }
      );
    }

    // Generate unique QR code for membership card
    const qrCode = `EKHAYA-${randomBytes(12).toString('hex').toUpperCase()}`;

    // Create user with Basic membership
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        phone,
        loyaltyPoints: 0,
        membership: {
          create: {
            membershipPlanId: defaultMembershipPlan.id,
            qrCode: qrCode,
            startDate: new Date(),
            endDate: new Date(Date.now() + defaultMembershipPlan.duration * 24 * 60 * 60 * 1000),
            isActive: true,
            autoRenew: false, // No renewal needed for free membership
            paymentMethod: 'free_tier'
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: 'User created successfully with Basic membership',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          membershipQrCode: qrCode
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}