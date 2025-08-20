# 🗃️ Prestige Car Wash - Enhanced Database Schema

## Overview
This document outlines the enhanced database schema for the Prestige Car Wash application with improved type safety, performance optimizations, and data integrity constraints.

## Key Improvements Made

### 1. **Type Safety with Enums**
- Added comprehensive enums for better type safety and data consistency
- Prevents invalid data entry at the database level
- Improves code maintainability and reduces bugs

### 2. **Performance Optimizations**
- Added strategic indexes on frequently queried columns
- Optimized foreign key relationships
- Added composite indexes for complex queries

### 3. **Data Integrity Constraints**
- Unique constraints on critical fields (license plates, user-service reviews)
- Proper cascade deletion rules
- Referential integrity enforcement

## Database Configuration
- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **ID Generation**: CUID (Collision-resistant Unique Identifiers)
- **Price Storage**: All monetary values stored in cents (R80.00 = 8000 cents)
- **Authentication**: NextAuth.js integration
- **Time Management**: UTC timestamps with auto-management

## Enums for Type Safety

### VehicleType
```prisma
enum VehicleType {
  SEDAN
  SUV
  HATCHBACK
  BAKKIE
  COUPE
  CONVERTIBLE
  WAGON
  TRUCK
}
```

### ServiceCategory
```prisma
enum ServiceCategory {
  EXPRESS
  PREMIUM
  DELUXE
  EXECUTIVE
}
```

### BookingStatus
```prisma
enum BookingStatus {
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### PaymentStatus
```prisma
enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
  CANCELLED
}
```

### PaymentMethodType
```prisma
enum PaymentMethodType {
  VISA
  MASTERCARD
  AMERICAN_EXPRESS
  DISCOVERY
  CASH
  EFT
  STRIPE_CARD
  STRIPE_WALLET
}
```

### MembershipPlan
```prisma
enum MembershipPlan {
  BASIC
  PREMIUM
  ELITE
}
```

### NotificationType
```prisma
enum NotificationType {
  BOOKING
  PROMOTION
  REMINDER
  SYSTEM
  PAYMENT
}
```

### Gender
```prisma
enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}
```

## Core Database Models

### Authentication Models (NextAuth.js)

#### Account Model
- Stores OAuth account information
- Links external providers to users
- Supports multiple providers per user

#### Session Model
- Manages user sessions
- JWT-based session storage
- Automatic expiration handling

#### VerificationToken Model
- Email verification tokens
- Password reset tokens
- Secure token-based verification

### Admin Management Models

#### AdminUser Model
- Separate admin authentication system
- Role-based access control (ADMIN, SUPER_ADMIN)
- Two-factor authentication support
- IP whitelisting for security
- Account lockout after failed attempts
- Audit trail integration

#### AdminAuditLog Model
- Comprehensive admin action logging
- Tracks all administrative changes
- IP address and user agent logging
- Resource-specific change tracking
- Old/new value comparison

### Core Application Models

#### User Model
- Customer account management
- Profile information and preferences
- Loyalty points system
- Multi-language support
- Address and contact information
- Gender and demographic data

#### StripeCustomer Model
- Stripe payment integration
- Customer ID mapping
- Default payment method tracking
- Synchronized customer data

#### Vehicle Model
- Customer vehicle registration
- Multiple vehicles per user
- Primary vehicle designation
- Unique license plate constraint
- Vehicle type categorization

#### Service Model
- Car wash service definitions
- Pricing and duration management
- Feature lists and descriptions
- Rating and review aggregation
- Promotional pricing support
- Category-based organization

#### ServiceAddOn Model
- Additional service options
- Upselling opportunities
- Independent pricing
- Promotional support

#### Booking Model
- Appointment scheduling
- Service and vehicle linking
- Status tracking workflow
- Pricing calculation
- Cancellation management
- Add-on integration

#### BookingAddOn Model
- Links bookings to add-ons
- Quantity and pricing tracking
- Historical price preservation

#### PaymentMethod Model
- Customer payment options
- Stripe integration
- Card information storage
- Default method selection
- Security fingerprinting

#### Payment Model
- Transaction processing
- Multiple payment provider support
- Stripe-specific fields
- Refund and failure tracking
- Receipt management

#### Membership Model
- Subscription management
- Plan-based pricing
- Auto-renewal support
- Active status tracking

#### Review Model
- Service feedback system
- Star rating (1-5)
- Comment moderation
- One review per user per service

#### Notification Model
- User communication system
- Type-based categorization
- Read status tracking
- Automated messaging

#### BookingReminder Model
- Automated reminder system
- Multiple reminder types
- Email and SMS tracking
- Scheduling management

#### Waitlist Model
- Booking availability management
- Priority-based queuing
- Alternative time preferences
- Conversion tracking

## Performance Indexes

### User Model Indexes
- `@@index([email])` - Fast user lookup
- `@@index([isAdmin])` - Admin filtering
- `@@index([loyaltyPoints])` - Loyalty program queries
- `@@index([createdAt])` - Chronological sorting

### Vehicle Model Indexes
- `@@index([userId])` - User's vehicles lookup
- `@@index([licensePlate])` - License plate searches
- `@@index([isPrimary])` - Primary vehicle filtering
- `@@unique([licensePlate])` - Prevent duplicate plates

### Service Model Indexes
- `@@index([category])` - Service category filtering
- `@@index([isActive])` - Active services only
- `@@index([price])` - Price-based sorting
- `@@index([rating])` - Rating-based sorting

### Booking Model Indexes
- `@@index([userId])` - User's bookings
- `@@index([serviceId])` - Service bookings
- `@@index([vehicleId])` - Vehicle bookings
- `@@index([bookingDate])` - Date-based queries
- `@@index([status])` - Status filtering
- `@@index([createdAt])` - Chronological sorting

### AdminUser Model Indexes
- `@@index([email])` - Admin email lookup
- `@@index([username])` - Admin username lookup
- `@@index([isActive])` - Active admin filtering

### AdminAuditLog Model Indexes
- `@@index([adminUserId])` - Admin action history
- `@@index([action])` - Action type filtering
- `@@index([createdAt])` - Chronological audit trail

### StripeCustomer Model Indexes
- `@@index([stripeCustomerId])` - Stripe customer lookup
- `@@index([email])` - Email-based customer search

### PaymentMethod Model Indexes
- `@@index([userId])` - User's payment methods
- `@@index([isDefault])` - Default method filtering
- `@@index([isActive])` - Active methods only
- `@@index([stripePaymentMethodId])` - Stripe integration

### Payment Model Indexes
- `@@index([status])` - Payment status filtering
- `@@index([paymentDate])` - Date-based queries
- `@@index([transactionId])` - Transaction lookup
- `@@index([stripePaymentIntentId])` - Stripe integration
- `@@index([stripeChargeId])` - Stripe charge lookup
- `@@index([stripeCustomerId])` - Customer payment history
- `@@index([createdAt])` - Chronological sorting

### Membership Model Indexes
- `@@index([plan])` - Plan-based filtering
- `@@index([isActive])` - Active memberships
- `@@index([startDate])` - Start date queries
- `@@index([endDate])` - Expiration tracking

### Review Model Indexes
- `@@index([userId])` - User's reviews
- `@@index([serviceId])` - Service reviews
- `@@index([rating])` - Rating-based sorting
- `@@index([isVisible])` - Visible reviews only
- `@@index([createdAt])` - Chronological sorting

### Notification Model Indexes
- `@@index([userId])` - User notifications
- `@@index([type])` - Notification type filtering
- `@@index([isRead])` - Read status filtering
- `@@index([createdAt])` - Chronological sorting

### BookingReminder Model Indexes
- `@@index([bookingId])` - Booking reminders
- `@@index([reminderType])` - Reminder type filtering
- `@@index([sentAt])` - Sent reminder tracking

### Waitlist Model Indexes
- `@@index([userId])` - User waitlist entries
- `@@index([preferredDate])` - Date-based queries
- `@@index([serviceId])` - Service waitlist
- `@@index([status])` - Status filtering
- `@@index([priority])` - Priority-based sorting
- `@@index([createdAt])` - Chronological sorting

## Database Management Scripts

### Available Commands
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Pull schema from database
npm run db:pull

# Seed database with sample data
npm run db:seed

# Open Prisma Studio (GUI)
npm run db:studio

# Reset database (⚠️ Destructive)
npm run db:reset

# Run Prisma migrations
npm run db:migrate

# Deploy migrations to production
npm run db:deploy

# Run custom migration script
npm run db:migrate-custom

# Validate database integrity
npm run db:validate
```

### Custom Scripts

#### Migration Script (`scripts/migrate.ts`)
- Handles data migration when changing from strings to enums
- Updates existing data to match new enum values
- Ensures data consistency during schema updates

#### Validation Script (`scripts/validate.ts`)
- Comprehensive database health check
- Validates referential integrity
- Reports data statistics and potential issues
- Identifies orphaned records

## Data Integrity Features

### Unique Constraints
- License plates must be unique across all vehicles (`@@unique([licensePlate])`)
- Users can only review each service once (`@@unique([userId, serviceId])`)
- Email addresses must be unique for both users and admins
- Admin usernames must be unique (`@unique` on username)
- Session tokens must be unique (`@unique` on sessionToken)
- Verification tokens must be unique (`@@unique([identifier, token])`)
- OAuth provider accounts must be unique (`@@unique([provider, providerAccountId])`)
- One reminder per type per booking (`@@unique([bookingId, reminderType])`)
- Stripe customer IDs must be unique (`@unique` on stripeCustomerId)
- User can have only one membership (`@unique` on userId in Membership)
- Booking can have only one payment (`@unique` on bookingId in Payment)

### Cascade Deletion Rules
- **User deletion**: Removes all related data (vehicles, bookings, payments, reviews, notifications, etc.)
- **Service deletion**: Removes related bookings and reviews
- **Booking deletion**: Removes related add-ons, payments, and reminders
- **AdminUser deletion**: Removes related audit logs
- **Vehicle deletion**: Removes related bookings
- **Account deletion**: Automatic cleanup via NextAuth.js

### Referential Integrity
- All foreign keys properly constrained with `@relation` directives
- Orphaned records prevented through proper cascade rules
- Data consistency maintained across all relationships
- Admin audit trail preserved for compliance
- Payment method relationships maintained for transaction history

## Sample Data
The seed script creates:
- **Test User**: john@doe.com / johndoe123 (regular user)
- **Admin User**: Separate admin authentication system
- **4 Comprehensive Services**: EXPRESS, PREMIUM, DELUXE, EXECUTIVE
- **Service Add-ons**: Interior cleaning, wax protection, tire shine, etc.
- **Sample Vehicles**: Multiple vehicle types with proper license plates
- **Test Bookings**: Various booking statuses and dates
- **Payment Methods**: Multiple payment types including Stripe integration
- **Reviews and Ratings**: Sample customer feedback
- **Notifications**: System, booking, and promotional notifications
- **Membership Plans**: BASIC, PREMIUM, ELITE tiers
- **Waitlist Entries**: Sample waitlist management
- **Booking Reminders**: Automated reminder system testing
- **Admin Audit Logs**: Sample administrative actions

## Best Practices

### When Adding New Fields
1. Consider if an enum would be appropriate
2. Add appropriate indexes for query performance
3. Update the seed script with sample data
4. Run validation script to ensure integrity

### When Modifying Existing Fields
1. Create a custom migration script if needed
2. Update seed data to match new constraints
3. Test with validation script
4. Update related TypeScript types

### Performance Considerations
- Use indexes strategically (not on every field)
- Consider composite indexes for complex queries
- Monitor query performance with Prisma Studio
- Use database-level constraints when possible

## Monitoring and Maintenance

### Regular Tasks
- Run `npm run db:validate` weekly
- Monitor database size and performance
- Review and optimize slow queries
- Update seed data as business requirements change

### Troubleshooting
- Use Prisma Studio for visual database inspection
- Check logs for constraint violations
- Use validation script to identify data issues
- Backup before running destructive operations

## Security Considerations

### Data Protection
- **Password Hashing**: All passwords properly hashed using bcryptjs
- **Two-Factor Authentication**: Admin 2FA support with speakeasy
- **Session Security**: JWT-based sessions with proper expiration
- **Token Security**: Secure verification tokens for email/password reset

### Access Control
- **Role-Based Access**: Admin roles (ADMIN, SUPER_ADMIN)
- **IP Whitelisting**: Admin IP address restrictions
- **Account Lockout**: Failed login attempt protection
- **Session Management**: Automatic session expiration and renewal

### Data Integrity
- **Foreign Key Constraints**: Prevent data corruption and orphaned records
- **Enum Constraints**: Prevent invalid data entry at database level
- **Unique Constraints**: Prevent duplicate critical data
- **Cascade Rules**: Proper cleanup of sensitive data on deletion

### Audit and Compliance
- **Admin Audit Trail**: Complete logging of administrative actions
- **IP Address Tracking**: Security monitoring and forensics
- **User Agent Logging**: Device and browser tracking
- **Change History**: Old/new value tracking for sensitive changes

### Payment Security
- **Stripe Integration**: PCI-compliant payment processing
- **Tokenization**: Secure payment method storage
- **Encryption**: Sensitive payment data protection
- **Fraud Prevention**: Card fingerprinting and duplicate detection

### Privacy Protection
- **Data Minimization**: Only collect necessary user information
- **Consent Management**: Cookie consent and privacy controls
- **Data Retention**: Proper cleanup of expired data
- **GDPR Compliance**: User data rights and deletion capabilities
