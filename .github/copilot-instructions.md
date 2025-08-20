# Copilot Instructions for PRESTIGE Car Wash System

## Project Overview
PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING is a comprehensive car wash booking platform built with Next.js 14, featuring complex business logic, multi-layer authentication, CRM capabilities, and production-critical systems.

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router (`app/` directory structure)
- **Language**: TypeScript (strict mode enabled)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with custom admin auth layer
- **UI Framework**: Tailwind CSS + shadcn/ui + Radix UI
- **Payment**: Stripe integration
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand + React Query/SWR

### Project Structure
```
app/
├── app/                    # App Router pages and API routes
│   ├── api/               # API endpoints (auth, bookings, admin, CRM)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel (protected routes)
│   └── book/              # Booking workflow
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── sections/         # Page sections
│   └── forms/            # Form components
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
├── hooks/                # Custom React hooks
└── public/               # Static assets
```

## Business Domain & Logic

### Core Entities
1. **Users**: Customers with vehicles and booking history
2. **Vehicles**: Customer vehicles with license plates and types
3. **Services**: Car wash packages (Express, Premium, Deluxe, Executive)
4. **Bookings**: Appointments with status tracking and payments
5. **Admin Users**: Staff with role-based access (ADMIN, MANAGER, STAFF)

### Service Categories & Business Rules
- **EXPRESS** (R250): Basic wash, 30min, exterior only
- **PREMIUM** (R375): Interior + exterior, 45min, includes vacuum
- **DELUXE** (R500): Full service, 60min, includes wax
- **EXECUTIVE** (R625): Premium service, 75min, includes detailing

### Critical Business Logic
- Booking time slots: 30-minute intervals, 7 AM - 5 PM
- Vehicle type affects pricing and duration
- No overbooking: strict capacity management
- Payment required for confirmation
- SMS/Email notifications for status changes

## Authentication & Security Patterns

### Dual Authentication System
```typescript
// Customer Authentication (NextAuth.js)
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

// Admin Authentication (Custom)
import { adminAuthOptions } from '@/lib/admin-auth';
import { requireAdmin } from '@/lib/admin-auth';
```

### Security Features
- **2FA Support**: Speakeasy TOTP for admin accounts
- **Rate Limiting**: Built-in login attempt limiting
- **IP Whitelisting**: Admin accounts can restrict IP access
- **Session Security**: JWT with short expiration (2 hours)
- **API Key Auth**: CRM endpoints use `X-API-Key` header
- **CORS**: Configured for CRM integration

### Access Control Patterns
```typescript
// Protect admin routes
const session = await getServerSession(adminAuthOptions);
if (!session || !(await requireAdmin(session))) {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

// Protect user routes
const session = await getServerSession(authOptions);
if (!session) {
  redirect('/auth/signin');
}
```

## Database Schema Patterns

### Key Relationships
- User → Vehicle (1:many, cascade delete)
- User → Booking (1:many)
- Vehicle → Booking (1:many)
- Service → Booking (1:many)
- Booking → Payment (1:1)

### Critical Fields
```typescript
// Always include these in booking queries
include: {
  user: true,
  vehicle: true,
  service: true,
  payment: true,
  addons: true
}
```

### Database Conventions
- All IDs are auto-incrementing integers
- Timestamps: `createdAt`, `updatedAt` (auto-managed)
- Soft deletes: Use status flags, not physical deletion
- Foreign keys: Always with onDelete cascade where appropriate

## API Patterns & Conventions

### Route Structure
```
/api/auth/         # NextAuth endpoints
/api/bookings/     # Customer booking management
/api/admin/        # Admin panel APIs (protected)
/api/crm/          # CRM integration APIs (API key protected)
/api/stripe/       # Payment webhooks
```

### Error Handling Pattern
```typescript
try {
  // Operation logic
  return NextResponse.json({ data }, { status: 200 });
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json(
    { error: 'Operation failed', details: error.message },
    { status: 500 }
  );
}
```

### API Response Standards
```typescript
// Success responses
{ data: T, message?: string }

// Error responses  
{ error: string, details?: string, code?: string }

// Paginated responses
{ data: T[], pagination: { page, limit, total, totalPages } }
```

## Component Patterns

### UI Component Usage
```typescript
// Always import from internal paths
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

// Use consistent prop patterns
interface ComponentProps {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'destructive' | 'outline';
}
```

### Form Patterns
```typescript
// Standard form setup
const form = useForm<FormData>({
  resolver: zodResolver(validationSchema),
  defaultValues: {...}
});

// Form submission
const onSubmit = async (data: FormData) => {
  try {
    setLoading(true);
    // API call
    toast.success('Operation successful');
  } catch (error) {
    toast.error('Operation failed');
  } finally {
    setLoading(false);
  }
};
```

## Code Conventions & Standards

### TypeScript Best Practices
- Use strict type checking
- Define interfaces for all API responses
- Use enums for status values and categories
- Avoid `any` - use proper typing or `unknown`
- Use discriminated unions for complex state

### React Patterns
- Functional components only
- Custom hooks for business logic
- Proper dependency arrays in useEffect
- Error boundaries for production code
- Consistent loading and error states

### Styling Guidelines
- Tailwind CSS classes preferred
- Use CSS variables for theme colors
- Mobile-first responsive design
- Consistent spacing with Tailwind scale
- Dark mode support via CSS variables

## Common Business Logic Patterns

### Booking Validation
```typescript
// Always validate booking conflicts
const existingBooking = await prisma.booking.findFirst({
  where: {
    date: bookingDate,
    timeSlot: timeSlot,
    status: { not: 'CANCELLED' }
  }
});
```

### Payment Processing
```typescript
// Always verify payment before booking confirmation
if (booking.payment?.status !== 'COMPLETED') {
  throw new Error('Payment required for booking confirmation');
}
```

### Notification Patterns
```typescript
// Send notifications after status changes
await sendBookingNotification({
  booking,
  type: 'status_update',
  previousStatus,
  newStatus
});
```

## Security Considerations

### Input Validation
- All API inputs must be validated with Zod schemas
- Sanitize user inputs before database operations
- Validate file uploads and limit sizes
- Check authorization on every protected endpoint

### Sensitive Data Handling
- Never log passwords or API keys
- Hash passwords with bcryptjs (salt rounds: 10)
- Store 2FA secrets encrypted
- Mask sensitive data in API responses

### Production Safety
- Use environment variables for all secrets
- Implement proper error logging
- Rate limit API endpoints
- Validate user permissions on every request

## Testing & Development

### Database Testing
- Use `npm run db:validate` for integrity checks
- Seed data available via `npm run db:seed`
- Always test with production-like data volumes

### Common Development Commands
```bash
npm run dev              # Start development server
npm run db:studio        # Visual database management
npm run db:reset         # Reset and reseed database
npm run lint             # ESLint with strict rules
```

### Debugging Tips
- Check browser Network tab for API failures
- Use Prisma Studio to inspect database state
- Monitor console for authentication issues
- Verify environment variables are loaded

## Integration Patterns

### CRM Integration
- All CRM endpoints require API key authentication
- Use consistent response formats for CRM consumers
- Implement real-time updates where needed
- Cache frequently accessed data

### External Services
- Stripe: Webhook validation required
- SMS Provider: Rate limiting considerations
- Email Service: Template-based notifications
- File Storage: Secure upload handling

## Performance Considerations

### Database Optimization
- Use indexes on frequently queried fields
- Implement pagination for large datasets  
- Use select/include judiciously to avoid N+1 queries
- Monitor query performance in production

### Frontend Optimization
- Lazy load heavy components
- Use React.memo for expensive renders
- Implement proper loading states
- Optimize images and static assets

## Handling Complex & Ambiguous Tasks

### Cross-Repository Understanding
When working on complex refactoring or broad-scope changes:
- Review all related API endpoints in `app/api/`
- Check component dependencies in `components/`
- Verify database schema impacts in `prisma/schema.prisma`
- Consider authentication flows in both `lib/auth.ts` and `lib/admin-auth.ts`
- Test integration points with CRM and external services

### Legacy Code & Dependencies
- Existing code may use older patterns - modernize gradually
- Some components have complex interdependencies - map them before changes
- Database migrations must be backward compatible
- Authentication changes affect both customer and admin flows

### Business Logic Complexity
When requirements are unclear:
- Reference existing documentation in the root `app/` directory
- Check similar implementations in existing API routes
- Consider the car wash business domain constraints
- Validate changes against real booking scenarios
- Ensure compliance with payment and security requirements

### Production-Critical Considerations
For sensitive tasks:
- Test thoroughly with realistic data volumes
- Verify security implications of all changes
- Consider rollback procedures for database changes
- Monitor performance impact of new features
- Validate payment flows don't break
- Ensure admin access controls remain intact

### Learning & Understanding Tasks
To gain deeper system knowledge:
- Start with `app/README.md` and setup guides
- Run `npm run db:studio` to explore data relationships
- Use `npm run db:validate` to understand data integrity
- Study the booking workflow in `app/book/` directory
- Examine API authentication patterns in `app/api/auth/`
- Review admin panel functionality in `app/admin/`

### Design Consistency Requirements
When making large-scale changes:
- Follow existing Tailwind CSS patterns
- Use established component patterns from `components/ui/`
- Maintain consistent error handling across API routes
- Keep authentication flows uniform
- Preserve established database naming conventions
- Follow existing file and directory structure

Remember: This is a production-critical system handling real customer bookings and payments. Always prioritize data integrity, security, and user experience in your implementations.