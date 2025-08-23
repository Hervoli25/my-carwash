# 🎯 Points System Business Rules & Configuration

## 💎 **Earning Points**

### Base Earning Rate
- **1 Point = R1 Spent** (1:1 ratio)
- **Minimum Spend**: R50 to earn points
- **Services Eligible**: All completed bookings

### Membership Multipliers
```typescript
const MEMBERSHIP_MULTIPLIERS = {
  BASIC: 1.0,    // 100 points for R100 spent
  PREMIUM: 1.5,  // 150 points for R100 spent  
  ELITE: 2.0     // 200 points for R100 spent
}
```

### Example Earning Scenarios
- **Express Wash (R80)**: 80 points (Basic), 120 points (Premium), 160 points (Elite)
- **Premium Wash (R150)**: 150 points (Basic), 225 points (Premium), 300 points (Elite)
- **Executive Detail (R300)**: 300 points (Basic), 450 points (Premium), 600 points (Elite)

## 💸 **Redeeming Points**

### Redemption Value
- **100 Points = R1 Discount** (100:1 ratio)
- **Minimum Redemption**: 100 points (R1)
- **Maximum Usage**: 50% of booking total

### Redemption Examples
- **Express Wash (R80)**: Can use max 4000 points (R40 discount) → Pay R40
- **Premium Wash (R150)**: Can use max 7500 points (R75 discount) → Pay R75
- **Executive Detail (R300)**: Can use max 15000 points (R150 discount) → Pay R150

### Service-Based Point Values
```typescript
const SERVICE_POINT_EQUIVALENTS = {
  EXPRESS: 8000,      // 8000 points = Free Express Wash
  PREMIUM: 15000,     // 15000 points = Free Premium Wash
  DELUXE: 20000,      // 20000 points = Free Deluxe Wash
  EXECUTIVE: 30000    // 30000 points = Free Executive Detail
}
```

## ⏰ **Expiration System**

### Validity Period
- **Standard**: 365 days from earn date
- **Warning**: 30 days before expiration
- **Grace Period**: 7 days after expiration (for manual admin recovery)

### Extension Methods
1. **Make Purchase**: Minimum R20 purchase extends ALL points by 1 year
2. **Buy Points**: Direct point purchase (R50 = 5000 points + 1 year extension)
3. **Book Service**: Any completed service extends points

### Expiration Workflow
```typescript
// Example expiration timeline
const EXPIRATION_TIMELINE = {
  pointsEarned: "2024-01-15",     // Points earned
  firstWarning: "2024-12-15",    // 335 days later (30 days warning)
  secondWarning: "2024-12-22",   // 7 days later
  finalWarning: "2025-01-10",    // 5 days before
  expirationDate: "2025-01-15",  // 365 days after earned
  gracePeriod: "2025-01-22",     // 7 days grace
  hardExpiry: "2025-01-22"       // Points lost forever
}
```

## 🛠️ **Admin Controls**

### Manual Point Management
- **Add Points**: Admin can award bonus points with reason
- **Remove Points**: Admin can deduct points with reason
- **Extend Expiry**: Admin can extend specific point batches
- **Recover Expired**: Admin can recover recently expired points

### Audit Trail
- Every point transaction logged
- Admin actions require reason/note
- Full history available for customer service

## 🎁 **Bonus Point Opportunities**

### Special Occasions
- **Birthday**: 500 bonus points
- **Anniversary**: 1000 points on signup anniversary
- **Referral**: 2000 points for successful referral

### Promotional Campaigns
- **Double Points**: 2x multiplier on specific services
- **Bonus Weekends**: Extra 500 points per booking
- **Loyalty Milestones**: Bonus at 5, 10, 20 bookings

## 🚀 **Implementation Phases**

### Phase 1: Basic System (Week 1-2)
- Points earning on completed bookings
- Simple redemption at checkout
- Basic expiration (no warnings yet)
- Admin manual adjustment

### Phase 2: Enhanced Features (Week 3-4)
- Expiration warnings (email/SMS)
- Membership multipliers
- Point purchase option
- CRM integration

### Phase 3: Advanced Features (Week 5-6)
- Automated expiration processing
- Bonus point campaigns
- Referral system
- Advanced analytics

## 💳 **Payment Integration**

### Checkout Process
```typescript
const CHECKOUT_WITH_POINTS = {
  originalAmount: 15000,      // R150 service
  availablePoints: 8000,      // User has 8000 points
  maxPointsUsable: 7500,      // 50% of R150 = R75 = 7500 points
  pointsToUse: 7500,          // User chooses to use max
  pointDiscount: 7500,        // 7500 points = R75 discount
  finalAmount: 7500,          // Pay R75 instead of R150
  pointsRemaining: 500        // 500 points left in account
}
```

### Service Point Requirements
- **Express (R80)**: 8000 points for free service
- **Premium (R150)**: 15000 points for free service  
- **Deluxe (R200)**: 20000 points for free service
- **Executive (R300)**: 30000 points for free service

## 📊 **Reporting & Analytics**

### Customer Metrics
- Points earned lifetime
- Points redeemed lifetime  
- Points expired/lost
- Average redemption rate
- Expiration rescue rate

### Business Metrics
- Total points liability
- Redemption cost impact
- Customer retention impact
- Most effective earning services
- Popular redemption patterns