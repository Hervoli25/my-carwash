import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SMSNotificationService } from '@/components/email/notification-system';

const prisma = new PrismaClient();

// Automated booking reminder system
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, bookingId, force = false } = body;

    if (!type || !bookingId) {
      return NextResponse.json(
        { error: 'Type and bookingId are required' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        service: true,
        vehicle: true
      }
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot send reminders for cancelled bookings' },
        { status: 400 }
      );
    }

    // Check if reminder was already sent (unless forced)
    if (!force) {
      const existingReminder = await prisma.bookingReminder.findFirst({
        where: {
          bookingId: bookingId,
          reminderType: type,
          sentAt: { not: null }
        }
      });

      if (existingReminder) {
        return NextResponse.json(
          { message: 'Reminder already sent', reminder: existingReminder },
          { status: 200 }
        );
      }
    }

    // Prepare notification data
    const notificationData = {
      customerName: `${booking.user.firstName} ${booking.user.lastName}`,
      customerEmail: booking.user.email,
      phoneNumber: booking.user.phone || '',
      plateNumber: booking.vehicle?.licensePlate || 'N/A',
      serviceType: booking.service?.name || 'Selected Service',
      appointmentDate: booking.bookingDate.toLocaleDateString(),
      appointmentTime: booking.timeSlot,
      totalPrice: booking.totalAmount,
      bookingId: booking.id.slice(-8).toUpperCase(),
      specialInstructions: booking.specialInstructions
    };

    // Send appropriate reminder based on type
    let emailSent = false;
    let smsSent = false;
    let reminderMessage = '';

    switch (type) {
      case '24_hour':
        reminderMessage = `Reminder: Your car wash appointment is tomorrow at ${booking.timeSlot}. Booking: ${notificationData.bookingId}`;
        break;
      case '2_hour':
        reminderMessage = `Your car wash appointment is in 2 hours at ${booking.timeSlot}. Address: [Your Address]. Booking: ${notificationData.bookingId}`;
        break;
      case '30_min':
        reminderMessage = `Your car wash appointment starts in 30 minutes! Please arrive on time. Booking: ${notificationData.bookingId}`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid reminder type' },
          { status: 400 }
        );
    }

    // Send email reminder
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'booking_reminder',
          data: {
            ...notificationData,
            reminderType: type,
            reminderMessage
          }
        }),
      });

      emailSent = emailResponse.ok;
    } catch (error) {
      console.error('Email reminder failed:', error);
    }

    // Send SMS reminder if user opted in
    if (booking.smsNotifications && notificationData.phoneNumber) {
      try {
        await SMSNotificationService.sendBookingReminder(
          notificationData.phoneNumber,
          {
            ...notificationData,
            reminderType: type,
            reminderMessage
          }
        );
        smsSent = true;
      } catch (error) {
        console.error('SMS reminder failed:', error);
      }
    }

    // Record reminder in database
    const reminder = await prisma.bookingReminder.create({
      data: {
        bookingId: bookingId,
        reminderType: type,
        emailSent,
        smsSent,
        sentAt: new Date(),
        message: reminderMessage
      }
    });

    return NextResponse.json({
      success: true,
      reminder,
      emailSent,
      smsSent,
      message: `${type.replace('_', ' ')} reminder sent successfully`
    });

  } catch (error) {
    console.error('Error sending booking reminder:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send reminder',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Get pending reminders that need to be sent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkType = searchParams.get('check') || 'all';
    
    const now = new Date();
    const pendingReminders = [];

    // Get all confirmed bookings that haven't been cancelled
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        bookingDate: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // From 24 hours ago
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Up to 7 days ahead
        }
      },
      include: {
        user: true,
        service: true,
        vehicle: true,
        reminders: true
      }
    });

    for (const booking of upcomingBookings) {
      const bookingDateTime = new Date(booking.bookingDate);
      const [hours, minutes] = booking.timeSlot.split(':').map(Number);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const timeDifference = bookingDateTime.getTime() - now.getTime();
      const hoursUntil = timeDifference / (1000 * 60 * 60);
      const minutesUntil = timeDifference / (1000 * 60);

      // Check for 24-hour reminder
      if ((checkType === 'all' || checkType === '24_hour') && 
          hoursUntil <= 24 && hoursUntil > 22 && 
          !booking.reminders.some(r => r.reminderType === '24_hour' && r.sentAt)) {
        pendingReminders.push({
          bookingId: booking.id,
          type: '24_hour',
          scheduledFor: new Date(bookingDateTime.getTime() - 24 * 60 * 60 * 1000),
          hoursUntil: Math.round(hoursUntil),
          booking: {
            id: booking.id,
            customerName: `${booking.user.firstName} ${booking.user.lastName}`,
            service: booking.service?.name,
            date: booking.bookingDate,
            time: booking.timeSlot
          }
        });
      }

      // Check for 2-hour reminder
      if ((checkType === 'all' || checkType === '2_hour') && 
          hoursUntil <= 2 && hoursUntil > 1.5 && 
          !booking.reminders.some(r => r.reminderType === '2_hour' && r.sentAt)) {
        pendingReminders.push({
          bookingId: booking.id,
          type: '2_hour',
          scheduledFor: new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000),
          hoursUntil: Math.round(hoursUntil * 10) / 10,
          booking: {
            id: booking.id,
            customerName: `${booking.user.firstName} ${booking.user.lastName}`,
            service: booking.service?.name,
            date: booking.bookingDate,
            time: booking.timeSlot
          }
        });
      }

      // Check for 30-minute reminder
      if ((checkType === 'all' || checkType === '30_min') && 
          minutesUntil <= 30 && minutesUntil > 25 && 
          !booking.reminders.some(r => r.reminderType === '30_min' && r.sentAt)) {
        pendingReminders.push({
          bookingId: booking.id,
          type: '30_min',
          scheduledFor: new Date(bookingDateTime.getTime() - 30 * 60 * 1000),
          minutesUntil: Math.round(minutesUntil),
          booking: {
            id: booking.id,
            customerName: `${booking.user.firstName} ${booking.user.lastName}`,
            service: booking.service?.name,
            date: booking.bookingDate,
            time: booking.timeSlot
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      pendingReminders,
      count: pendingReminders.length,
      checkedAt: now.toISOString()
    });

  } catch (error) {
    console.error('Error checking pending reminders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check pending reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}