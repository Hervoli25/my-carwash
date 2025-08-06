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
- License plates must be unique across all vehicles
- Users can only review each service once
- Email addresses must be unique

### Cascade Deletion
- User deletion removes all related data (vehicles, bookings, etc.)
- Service deletion removes related bookings and reviews
- Booking deletion removes related add-ons and payments

### Referential Integrity
- All foreign keys properly constrained
- Orphaned records prevented
- Data consistency maintained

## Sample Data
The seed script creates:
- Test admin user (john@doe.com / johndoe123)
- 4 comprehensive car wash services
- Service add-ons for customization
- Sample vehicle and bookings
- Payment methods and reviews
- Notifications for testing

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
- All sensitive data properly hashed (passwords)
- Foreign key constraints prevent data corruption
- Enum constraints prevent invalid data entry
- Proper cascade rules prevent orphaned sensitive data
