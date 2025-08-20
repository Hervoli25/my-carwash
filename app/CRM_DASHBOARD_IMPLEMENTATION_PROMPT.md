# CRM Dashboard Implementation Prompt

## Project Context
You are working on Ekhaya Car Wash, a Next.js application with:
- **Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS
- **Authentication**: NextAuth.js with admin role system
- **Payment**: Stripe integration
- **Notifications**: Email & SMS systems
- **Database**: Comprehensive booking, user, and service management

## Existing CRM API Endpoints (Already Built)
```
GET /api/crm/dashboard/stats - Dashboard statistics
GET /api/crm/bookings/search - Search bookings by reference/customer
GET /api/crm/bookings/[id] - Get specific booking details
```

**Authentication**: All CRM endpoints require `X-API-Key: ekhaya-car-wash-secret-key-2024` header

## Core CRM Dashboard Requirements

### 1. **Dashboard Overview Widget**
Create a sidebar widget/component that displays:
- **Real-time Statistics**:
  - Today's bookings count
  - This week's revenue (R format)
  - Pending/confirmed/completed booking counts
  - Average service rating
  - Active waitlist count

### 2. **Quick Search Functionality**
Implement search interface with:
- **Search by**: License plate, booking reference, customer name, email, phone
- **Results display**: Booking cards with key info
- **Quick actions**: View details, modify status, send notifications

### 3. **Booking Management Panel**
Create management interface for:
- **Status Updates**: Change booking status (pending → confirmed → completed)
- **Modification Handling**: Approve/deny customer modification requests
- **Communication**: Send SMS/email notifications to customers
- **Notes System**: Add internal staff notes to bookings

### 4. **Real-time Capacity Monitor**
Build capacity tracking display:
- **Time Slot Visualization**: Grid showing available/booked slots
- **Service Distribution**: Chart showing service types per time slot
- **Capacity Alerts**: Highlight overbooked or low-capacity periods
- **Dynamic Updates**: Auto-refresh every 30 seconds

### 5. **Customer Relationship Tools**
Implement customer management:
- **Customer Profiles**: View booking history, preferences, loyalty points
- **Communication History**: Track all sent emails/SMS
- **Loyalty Management**: Award points, apply discounts
- **VIP Flagging**: Mark premium customers

### 6. **Revenue Analytics**
Create financial dashboard:
- **Daily/Weekly/Monthly revenue charts**
- **Service performance metrics**
- **Payment method breakdown**
- **Outstanding payments tracking**

## Technical Implementation Guidelines

### File Structure to Create:
```
app/
├── components/
│   └── crm/
│       ├── dashboard-widget.tsx
│       ├── quick-search.tsx
│       ├── booking-manager.tsx
│       ├── capacity-monitor.tsx
│       ├── customer-tools.tsx
│       └── revenue-analytics.tsx
├── crm/
│   └── dashboard/
│       └── page.tsx (main CRM interface)
└── hooks/
    └── use-crm-data.ts (data fetching hooks)
```

### Integration Points:
1. **Sidebar Integration**: Add CRM widget to existing dashboard sidebar
2. **Real-time Updates**: Use React Query or SWR for auto-refreshing data
3. **Notification System**: Integrate with existing SMS/email services
4. **Permission System**: Ensure admin-only access using existing auth

### Data Models to Utilize:
- `Booking` - Core booking data with status, service, customer info
- `User` - Customer profiles with loyalty points, preferences
- `Service` - Service types, pricing, duration
- `Vehicle` - Customer vehicle information
- `BookingAddOn` - Additional services

### UI/UX Requirements:
- **Responsive Design**: Works on desktop and tablet
- **Real-time Indicators**: Loading states, success/error feedback
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Performance**: Efficient data fetching, pagination for large datasets

## Implementation Priority:
1. **Phase 1**: Dashboard widget with basic stats
2. **Phase 2**: Quick search and booking management
3. **Phase 3**: Capacity monitoring and real-time updates
4. **Phase 4**: Advanced analytics and customer tools

## Testing Requirements:
- Test with existing booking data
- Verify API authentication works
- Ensure responsive design on multiple screen sizes
- Test real-time updates and auto-refresh functionality

## Success Criteria:
- CRM dashboard reduces booking management time by 50%
- Staff can quickly find and update any booking within 30 seconds
- Real-time capacity monitoring prevents overbooking
- Customer communication tracking improves service quality

## Notes for Implementation:
- Use existing design system (Tailwind classes from booking workflow)
- Follow TypeScript strict mode requirements
- Implement proper error handling and loading states
- Ensure all CRM functions work with live production data
- Maintain consistency with existing admin interface patterns

## Sample API Usage:
```typescript
// Get dashboard stats
const stats = await fetch('/api/crm/dashboard/stats', {
  headers: { 'X-API-Key': 'ekhaya-car-wash-secret-key-2024' }
}).then(res => res.json());

// Search bookings
const bookings = await fetch('/api/crm/bookings/search?q=CA123', {
  headers: { 'X-API-Key': 'ekhaya-car-wash-secret-key-2024' }
}).then(res => res.json());
```

Start with the dashboard widget component and gradually build out the full CRM interface following the existing code patterns in the application.