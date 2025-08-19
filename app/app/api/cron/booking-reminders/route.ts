import { NextRequest, NextResponse } from 'next/server';

// Cron job endpoint for automated booking reminders
// This should be called by a cron service (like Vercel Cron or external service)
// Recommended schedule: */15 * * * * (every 15 minutes)

export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization (optional but recommended)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      reminders: [] as any[]
    };

    // Get pending reminders
    const pendingResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/reminders`, {
      method: 'GET'
    });

    if (!pendingResponse.ok) {
      throw new Error('Failed to fetch pending reminders');
    }

    const pendingData = await pendingResponse.json();
    const pendingReminders = pendingData.pendingReminders || [];

    results.processed = pendingReminders.length;

    // Send each pending reminder
    for (const reminder of pendingReminders) {
      try {
        const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/reminders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: reminder.type,
            bookingId: reminder.bookingId
          })
        });

        if (sendResponse.ok) {
          const sentData = await sendResponse.json();
          results.sent++;
          results.reminders.push({
            bookingId: reminder.bookingId,
            type: reminder.type,
            status: 'sent',
            emailSent: sentData.emailSent,
            smsSent: sentData.smsSent
          });
        } else {
          results.failed++;
          results.reminders.push({
            bookingId: reminder.bookingId,
            type: reminder.type,
            status: 'failed',
            error: await sendResponse.text()
          });
        }
      } catch (error) {
        results.failed++;
        results.reminders.push({
          bookingId: reminder.bookingId,
          type: reminder.type,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log results for monitoring
    console.log('📅 Booking Reminders Cron Job Results:', {
      timestamp: new Date().toISOString(),
      processed: results.processed,
      sent: results.sent,
      failed: results.failed
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} reminders: ${results.sent} sent, ${results.failed} failed`,
      details: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Booking Reminders Cron Job Failed:', error);
    
    return NextResponse.json(
      {
        error: 'Cron job failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST endpoint to manually trigger reminder check (for testing)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { forceAll = false, testMode = false } = body;

    if (testMode) {
      // Test mode - just return what would be sent without actually sending
      const pendingResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/reminders`, {
        method: 'GET'
      });

      const pendingData = await pendingResponse.json();
      
      return NextResponse.json({
        success: true,
        testMode: true,
        message: 'Test run completed - no reminders actually sent',
        pendingReminders: pendingData.pendingReminders || [],
        count: pendingData.count || 0,
        timestamp: new Date().toISOString()
      });
    }

    // Manual trigger - same as GET but can force resend all
    return await GET(request);

  } catch (error) {
    console.error('❌ Manual Booking Reminders Trigger Failed:', error);
    
    return NextResponse.json(
      {
        error: 'Manual trigger failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}