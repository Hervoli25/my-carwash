import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail app password
  },
});

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    let emailContent = '';
    let subject = '';
    let recipients = [];

    switch (type) {
      case 'booking_confirmation':
        subject = `🚗 Booking Confirmed - PRESTIGE Car Wash`;
        recipients = [data.customerEmail];
        emailContent = generateBookingConfirmationEmail(data);
        break;
      
      case 'admin_notification':
        subject = `📋 New Booking - ${data.customerName}`;
        recipients = [process.env.ADMIN_EMAIL || 'admin@ekhayaintel.co.za'];
        emailContent = generateAdminNotificationEmail(data);
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Send email to customer
    const customerEmailResult = await transporter.sendMail({
      from: `"PRESTIGE Car Wash" <${process.env.EMAIL_USER}>`,
      to: recipients[0],
      subject: subject,
      html: emailContent,
    });

    // Send admin notification
    if (type === 'booking_confirmation') {
      const adminEmailResult = await transporter.sendMail({
        from: `"PRESTIGE Car Wash" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || 'admin@ekhayaintel.co.za',
        subject: `📋 New Booking - ${data.customerName}`,
        html: generateAdminNotificationEmail(data),
      });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: customerEmailResult.messageId 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateBookingConfirmationEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - PRESTIGE Car Wash</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 10px 10px; }
        .booking-details { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border-left: 4px solid #3b82f6;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #eee; 
        }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .cta-button { 
          background: #3b82f6; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          display: inline-block; 
          margin: 15px 0; 
        }
        .price { font-size: 24px; font-weight: bold; color: #059669; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 PRESTIGE Car Wash</h1>
          <p style="margin: 0; font-size: 18px;">Your booking has been confirmed!</p>
        </div>
        
        <div class="content">
          <h2>Hello ${data.customerName},</h2>
          <p>Thank you for choosing PRESTIGE Car Wash! Your booking has been successfully confirmed and saved to our system.</p>
          
          <div class="booking-details">
            <h3 style="margin-top: 0; color: #3b82f6;">📋 Booking Details</h3>
            
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">${data.serviceType}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Date & Time:</span>
              <span class="value">${data.appointmentDate} at ${data.appointmentTime}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">Vehicle:</span>
              <span class="value">${data.vehicleInfo}</span>
            </div>
            
            <div class="detail-row">
              <span class="label">License Plate:</span>
              <span class="value"><strong>${data.plateNumber}</strong></span>
            </div>
            
            <div class="detail-row">
              <span class="label">Total Price:</span>
              <span class="value price">R${data.totalPrice}</span>
            </div>
            
            ${data.specialInstructions ? `
            <div class="detail-row">
              <span class="label">Special Instructions:</span>
              <span class="value">${data.specialInstructions}</span>
            </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ekhayaintel.co.za/dashboard" class="cta-button">View My Bookings</a>
          </div>
          
          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0277bd;">📍 Location & Contact</h4>
            <p style="margin: 5px 0;"><strong>Address:</strong> Cape Town, Western Cape</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +27 123 456 789</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@ekhayaintel.co.za</p>
            <p style="margin: 5px 0;"><strong>Hours:</strong> Mon-Sat: 8AM-6PM, Sun: 9AM-4PM</p>
          </div>
          
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Arrive 5 minutes before your appointment</li>
            <li>Enjoy our productive customer lounge while you wait</li>
            <li>Receive real-time updates on your service progress</li>
            <li>Get before/after photos of your vehicle</li>
          </ul>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} PRESTIGE Car Wash by Ekhaya Intel Trading. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateAdminNotificationEmail(data: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Booking - Admin Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Booking Alert</h1>
          <p>PRESTIGE Car Wash Admin Dashboard</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            <strong>⚠️ Action Required:</strong> New booking received and confirmed
          </div>
          
          <div class="booking-details">
            <h3>Customer Information</h3>
            <div class="detail-row">
              <span><strong>Name:</strong></span>
              <span>${data.customerName}</span>
            </div>
            <div class="detail-row">
              <span><strong>Email:</strong></span>
              <span>${data.customerEmail}</span>
            </div>
            <div class="detail-row">
              <span><strong>Service:</strong></span>
              <span>${data.serviceType}</span>
            </div>
            <div class="detail-row">
              <span><strong>Date & Time:</strong></span>
              <span>${data.appointmentDate} at ${data.appointmentTime}</span>
            </div>
            <div class="detail-row">
              <span><strong>Vehicle:</strong></span>
              <span>${data.vehicleInfo}</span>
            </div>
            <div class="detail-row">
              <span><strong>License Plate:</strong></span>
              <span><strong>${data.plateNumber}</strong></span>
            </div>
            <div class="detail-row">
              <span><strong>Total:</strong></span>
              <span><strong>R${data.totalPrice}</strong></span>
            </div>
            ${data.specialInstructions ? `
            <div class="detail-row">
              <span><strong>Special Instructions:</strong></span>
              <span>${data.specialInstructions}</span>
            </div>
            ` : ''}
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Confirm booking in admin dashboard</li>
            <li>Prepare service bay for ${data.appointmentTime}</li>
            <li>Review any special instructions</li>
            <li>Send reminder to customer 1 hour before appointment</li>
          </ul>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="https://ekhayaintel.co.za/admin/bookings" style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              View in Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
