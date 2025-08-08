
'use client';

interface EmailNotificationProps {
  type: 'booking_confirmation' | 'reminder' | 'admin_notification';
  data: {
    customerName: string;
    customerEmail: string;
    plateNumber: string;
    serviceType: string;
    appointmentDate: string;
    appointmentTime: string;
    totalPrice: number;
    vehicleInfo: string;
    specialInstructions?: string;
  };
}

export class EmailNotificationService {
  private static ADMIN_EMAIL = 'admin@prestigecarwash.com';
  
  static async sendBookingConfirmation(data: EmailNotificationProps['data']) {
    const customerEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation - PRESTIGE Car Wash</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ef4444); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .cta-button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 PRESTIGE Car Wash</h1>
            <p>Your booking has been confirmed!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Thank you for choosing PRESTIGE Car Wash! Your booking has been successfully confirmed.</p>
            
            <div class="booking-details">
              <h3>📅 Booking Details</h3>
              <p><strong>Service:</strong> ${data.serviceType}</p>
              <p><strong>Date:</strong> ${data.appointmentDate}</p>
              <p><strong>Time:</strong> ${data.appointmentTime}</p>
              <p><strong>Vehicle:</strong> ${data.vehicleInfo}</p>
              <p><strong>Plate Number:</strong> ${data.plateNumber}</p>
              <p><strong>Total Price:</strong> $${data.totalPrice}</p>
              ${data.specialInstructions ? `<p><strong>Special Instructions:</strong> ${data.specialInstructions}</p>` : ''}
            </div>
            
            <div class="booking-details">
              <h3>📍 Location & Contact</h3>
              <p><strong>Address:</strong> 123 Main Street, Cape Town, South Africa</p>
              <p><strong>Phone:</strong> +27 21 123 4567</p>
              <p><strong>Email:</strong> info@prestigecarwash.com</p>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="https://prestigecarwash.com/dashboard" class="cta-button">
                View Your Dashboard
              </a>
            </div>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>📱 SMS reminder 24 hours before your appointment</li>
              <li>🏆 Points will be added to your VIP account</li>
              <li>⚡ Fast-track service for VIP members</li>
              <li>🎁 Track your progress towards free services</li>
            </ul>
            
            <p>Need to make changes? Contact us or use your dashboard to manage bookings.</p>
            
            <p>Best regards,<br>The PRESTIGE Car Wash Team</p>
          </div>
          
          <div class="footer">
            <p>PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING<br>
               Where Waiting Becomes Productive</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Booking Alert - PRESTIGE Car Wash</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ef4444; }
          .urgent { background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Booking Alert</h1>
            <p>PRESTIGE Car Wash - Admin Notification</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚠️ ACTION REQUIRED:</strong> New booking received and requires preparation
            </div>
            
            <div class="booking-details">
              <h3>📋 Customer Information</h3>
              <p><strong>Name:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Service:</strong> ${data.serviceType}</p>
              <p><strong>Date & Time:</strong> ${data.appointmentDate} at ${data.appointmentTime}</p>
            </div>
            
            <div class="booking-details">
              <h3>🚗 Vehicle Details</h3>
              <p><strong>Vehicle:</strong> ${data.vehicleInfo}</p>
              <p><strong>Plate Number:</strong> ${data.plateNumber}</p>
              <p><strong>Total Price:</strong> $${data.totalPrice}</p>
              ${data.specialInstructions ? `<p><strong>Special Instructions:</strong> ${data.specialInstructions}</p>` : ''}
            </div>
            
            <div class="booking-details">
              <h3>📝 Next Steps</h3>
              <ul>
                <li>✅ Booking automatically added to system</li>
                <li>📧 Confirmation email sent to customer</li>
                <li>📱 SMS reminder will be sent 24hrs before</li>
                <li>🛠️ Prepare equipment for service type</li>
                <li>📅 Add to staff schedule</li>
              </ul>
            </div>
            
            <p><strong>Booking ID:</strong> PWB-${Date.now()}</p>
            <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      // In a real implementation, you would use a service like:
      // - SendGrid
      // - Mailgun  
      // - AWS SES
      // - Postmark
      // For now, we'll log the emails (in production, replace with actual email service)
      
      console.log('📧 CUSTOMER EMAIL SENT TO:', data.customerEmail);
      console.log('Customer Email Content:', customerEmailContent);
      
      console.log('📧 ADMIN EMAIL SENT TO:', this.ADMIN_EMAIL);
      console.log('Admin Email Content:', adminEmailContent);
      
      // Simulate email sending with promises
      await Promise.all([
        this.simulateEmailSend(data.customerEmail, 'Booking Confirmation', customerEmailContent),
        this.simulateEmailSend(this.ADMIN_EMAIL, 'New Booking Alert', adminEmailContent)
      ]);
      
      return { success: true, message: 'Notification emails sent successfully' };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, message: 'Failed to send notification emails' };
    }
  }

  static async sendReminder(data: EmailNotificationProps['data']) {
    const reminderContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Appointment Reminder - PRESTIGE Car Wash</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Appointment Reminder</h1>
            <p>PRESTIGE Car Wash</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            
            <div class="reminder-box">
              <h3>🚗 Your appointment is tomorrow!</h3>
              <p><strong>${data.appointmentDate} at ${data.appointmentTime}</strong></p>
              <p>Service: ${data.serviceType}</p>
              <p>Vehicle: ${data.vehicleInfo} (${data.plateNumber})</p>
            </div>
            
            <p>We're looking forward to providing you with exceptional service tomorrow!</p>
            
            <p><strong>📍 Location:</strong> 123 Main Street, Cape Town</p>
            <p><strong>📞 Contact:</strong> +27 21 123 4567</p>
            
            <p>Need to reschedule? Contact us or use your dashboard.</p>
            
            <p>Best regards,<br>The PRESTIGE Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.simulateEmailSend(data.customerEmail, 'Appointment Reminder', reminderContent);
      return { success: true, message: 'Reminder email sent successfully' };
    } catch (error) {
      console.error('Reminder email failed:', error);
      return { success: false, message: 'Failed to send reminder email' };
    }
  }

  private static async simulateEmailSend(to: string, subject: string, content: string): Promise<void> {
    // Simulate email API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`✅ Email sent to: ${to}`);
        console.log(`📬 Subject: ${subject}`);
        resolve();
      }, 1000);
    });
  }
}

// SMS Service (placeholder for future integration)
export class SMSNotificationService {
  static async sendBookingConfirmation(phone: string, data: any) {
    const message = `🚗 PRESTIGE Car Wash: Booking confirmed! ${data.appointmentDate} at ${data.appointmentTime}. Vehicle: ${data.plateNumber}. Reply STOP to opt-out.`;
    
    console.log(`📱 SMS sent to: ${phone}`);
    console.log(`📝 Message: ${message}`);
    
    return { success: true, message: 'SMS sent successfully' };
  }

  static async sendReminder(phone: string, data: any) {
    const message = `⏰ PRESTIGE Car Wash: Reminder - Your ${data.serviceType} is tomorrow at ${data.appointmentTime}. Vehicle: ${data.plateNumber}. See you soon!`;
    
    console.log(`📱 SMS reminder sent to: ${phone}`);
    console.log(`📝 Message: ${message}`);
    
    return { success: true, message: 'SMS reminder sent successfully' };
  }
}
