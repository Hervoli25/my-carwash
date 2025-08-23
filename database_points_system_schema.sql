-- 🎯 POINTS SYSTEM DATABASE SCHEMA
-- Add these tables to your Prisma schema

-- 1. Points Transactions (Detailed History)
model PointTransaction {
  id              String              @id @default(cuid())
  userId          String
  bookingId       String?             // Link to booking if earned from service
  type            PointTransactionType
  points          Int                 // Can be positive (earned) or negative (redeemed)
  description     String              // "Earned from Premium Wash", "Redeemed for Express Wash"
  
  // Earning details
  serviceAmount   Int?                // Original service amount that earned points
  multiplier      Float?              // Multiplier used (membership bonus)
  
  // Redemption details
  redeemedAgainst String?             // What was purchased with points
  discountAmount  Int?                // Discount value in cents
  
  // Expiration management
  expiresAt       DateTime?           // When these points expire
  isExpired       Boolean             @default(false)
  
  // Admin management
  adminNote       String?             // Admin reason for manual adjustments
  adminUserId     String?             // Which admin made the change
  isManual        Boolean             @default(false) // Admin-created transaction
  
  // Audit trail
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  // Relations
  user            User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  booking         Booking?            @relation(fields: [bookingId], references: [id])
  
  @@index([userId])
  @@index([type])
  @@index([expiresAt])
  @@index([isExpired])
  @@index([createdAt])
  @@index([bookingId])
}

-- 2. Points Configuration (Business Rules)
model PointsConfig {
  id                    String    @id @default(cuid())
  
  -- Earning Rules
  pointsPerRand         Float     @default(1.0)    // 1 point per R1 spent
  minimumSpend          Int       @default(5000)   // Minimum R50 to earn points
  membershipMultipliers Json      // {"BASIC": 1.0, "PREMIUM": 1.5, "ELITE": 2.0}
  
  -- Redemption Rules  
  pointValue            Float     @default(0.01)   // 1 point = R0.01 value
  minimumRedemption     Int       @default(100)    // Minimum 100 points to redeem
  maxRedemptionPercent  Float     @default(50.0)   // Max 50% of transaction can be points
  
  -- Expiration Rules
  pointsValidityDays    Int       @default(365)    // Points expire after 1 year
  expirationWarningDays Int       @default(30)     // Warn 30 days before expiry
  
  -- Extension Rules
  extensionPurchaseMin  Int       @default(2000)   // Min R20 purchase extends validity
  extensionDays         Int       @default(365)    // Extend by 1 year
  
  isActive              Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([isActive])
}

-- 3. Points Expiration Tracking
model PointsExpiration {
  id                String    @id @default(cuid())
  userId            String
  pointsAmount      Int       // Amount of points expiring
  expiryDate        DateTime  // When they expire
  isProcessed       Boolean   @default(false)
  processedAt       DateTime?
  warningsSent      Int       @default(0) // How many warnings sent
  lastWarningSentAt DateTime?
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([expiryDate])
  @@index([isProcessed])
}

-- 4. Points Redemption History
model PointsRedemption {
  id                String    @id @default(cuid())
  userId            String
  bookingId         String    @unique // Booking where points were used
  pointsUsed        Int       // Points redeemed
  discountAmount    Int       // Discount value in cents
  originalAmount    Int       // Original booking amount
  finalAmount       Int       // Final amount after points discount
  
  createdAt         DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  booking           Booking   @relation(fields: [bookingId], references: [id])
  
  @@index([userId])
  @@index([bookingId])
  @@index([createdAt])
}

-- 5. Enums for Points System
enum PointTransactionType {
  EARNED_BOOKING      // Earned from completing a booking
  EARNED_BONUS        // Bonus points (promotions, admin)
  EARNED_REFERRAL     // Referral bonus
  EARNED_BIRTHDAY     // Birthday bonus
  REDEEMED_BOOKING    // Used for booking discount
  EXPIRED             // Points expired
  ADJUSTED_ADMIN      // Admin adjustment (+ or -)
  REVERSED            // Reversed transaction (refund/cancellation)
}

-- 6. Update existing User model to add relations
-- Add to existing User model:
pointTransactions   PointTransaction[]
pointsExpirations   PointsExpiration[]
pointsRedemptions   PointsRedemption[]

-- 7. Update existing Booking model
-- Add to existing Booking model:
pointTransaction    PointTransaction?
pointsRedemption    PointsRedemption?
pointsUsed          Int?              @default(0)
pointsEarned        Int?              @default(0)