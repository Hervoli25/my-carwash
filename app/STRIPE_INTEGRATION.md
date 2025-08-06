# 💳 Stripe Payment Integration Guide

## Overview
This guide covers the complete Stripe integration for the Ekhaya Car Wash application, including payment processing, webhook handling, and customer management.

## 🔧 Setup Instructions

### 1. Stripe Account Setup
1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Complete your account verification
3. Navigate to the Dashboard → Developers → API keys
4. Copy your **Publishable key** and **Secret key**

### 2. Environment Configuration
Update your `.env` file with your Stripe credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/Ekhaya_car_wash"

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_actual_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_actual_webhook_secret"

# Client-side Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_actual_publishable_key"
```

### 3. Webhook Configuration
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret to your `.env` file

## 🏗️ Database Schema Updates

### Enhanced Models
The database now includes Stripe-specific fields:

#### StripeCustomer Model
```prisma
model StripeCustomer {
  id                     String   @id @default(cuid())
  userId                 String   @unique
  stripeCustomerId       String   @unique
  email                  String?
  name                   String?
  phone                  String?
  defaultPaymentMethodId String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Enhanced PaymentMethod Model
```prisma
model PaymentMethod {
  // ... existing fields
  stripePaymentMethodId String?
  stripeBrand           String?
  stripeFingerprint     String?
}
```

#### Enhanced Payment Model
```prisma
model Payment {
  // ... existing fields
  stripePaymentIntentId String?
  stripeChargeId        String?
  stripeCustomerId      String?
  stripeFee             Int?
  stripeReceiptUrl      String?
  currency              String @default("ZAR")
  description           String?
  failureReason         String?
  refundReason          String?
  refundedAmount        Int?
}
```

## 🔄 API Endpoints

### 1. Create Payment Intent
**POST** `/api/stripe/payment-intent`

Creates a payment intent for a booking.

```typescript
// Request
{
  "bookingId": "booking_id",
  "amount": 15000, // Amount in cents (R150.00)
  "description": "Car wash service payment"
}

// Response
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "customerId": "cus_xxx"
}
```

### 2. Setup Intent for Saving Cards
**POST** `/api/stripe/setup-intent`

Creates a setup intent for saving payment methods.

```typescript
// Response
{
  "clientSecret": "seti_xxx_secret_xxx",
  "setupIntentId": "seti_xxx",
  "customerId": "cus_xxx"
}
```

### 3. List Payment Methods
**GET** `/api/stripe/setup-intent`

Retrieves user's saved payment methods.

```typescript
// Response
{
  "paymentMethods": [
    {
      "id": "pm_xxx",
      "type": "STRIPE_CARD",
      "lastFour": "4242",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "cardholderName": "John Doe",
      "stripeBrand": "VISA",
      "isDefault": true,
      "isActive": true
    }
  ]
}
```

### 4. Webhook Handler
**POST** `/api/stripe/webhook`

Handles Stripe webhook events for payment status updates.

## 💻 Client-Side Integration

### Basic Payment Flow
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Create payment intent
const response = await fetch('/api/stripe/payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bookingId: 'booking_id',
    amount: 15000,
  }),
});

const { clientSecret } = await response.json();

// Confirm payment
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name',
      email: 'customer@email.com',
    },
  },
});
```

## 🔒 Security Features

### 1. Webhook Signature Verification
All webhooks are verified using Stripe's signature verification to ensure authenticity.

### 2. Customer Validation
- Payment intents are only created for authenticated users
- Booking ownership is verified before payment processing
- Customer data is synced between Stripe and local database

### 3. Idempotency
- Duplicate payments are prevented
- Payment status is tracked and updated atomically

## 🌍 South African Configuration

### Currency and Localization
- **Currency**: ZAR (South African Rand)
- **Country**: ZA (South Africa)
- **Payment Methods**: Card payments (Visa, Mastercard, etc.)
- **Amount Format**: Stored in cents (R80.00 = 8000 cents)

### Supported Cards
- Visa
- Mastercard
- American Express
- Discovery (South African cards)

## 🔄 Payment Flow

### 1. Customer Booking Flow
1. Customer selects service and creates booking
2. System creates payment intent via Stripe API
3. Customer enters payment details on secure Stripe form
4. Payment is processed and confirmed
5. Webhook updates payment status in database
6. Customer receives confirmation notification

### 2. Saved Payment Methods Flow
1. Customer chooses to save payment method
2. System creates setup intent via Stripe API
3. Customer enters payment details
4. Payment method is saved to Stripe customer
5. Future payments can use saved methods

## 🛠️ Testing

### Test Cards
Use these test card numbers in development:

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Declined: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

### Webhook Testing
Use Stripe CLI for local webhook testing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📊 Monitoring and Analytics

### Stripe Dashboard
Monitor payments, disputes, and customer activity in the Stripe Dashboard.

### Database Queries
Track payment metrics with database queries:

```sql
-- Payment success rate
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM "Payment"
GROUP BY status;

-- Revenue by month
SELECT 
  DATE_TRUNC('month', "paymentDate") as month,
  SUM(amount) / 100 as revenue_zar
FROM "Payment"
WHERE status = 'COMPLETED'
GROUP BY month
ORDER BY month DESC;
```

## 🚨 Error Handling

### Common Errors
- **Card declined**: Customer needs to contact their bank
- **Insufficient funds**: Customer needs to use different payment method
- **Expired card**: Customer needs to update card details
- **Network error**: Retry payment after a few seconds

### Error Messages
User-friendly error messages are provided for all payment failures.

## 🔄 Migration Commands

After updating the schema, run:

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Run custom migration for existing data
npm run db:migrate-custom

# Seed database with updated data
npm run db:seed
```

## 📞 Support

### Stripe Support
- Documentation: [https://stripe.com/docs](https://stripe.com/docs)
- Support: Available through Stripe Dashboard

### Implementation Support
- Check webhook logs in Stripe Dashboard
- Monitor application logs for payment processing errors
- Use Stripe's test mode for development and testing
