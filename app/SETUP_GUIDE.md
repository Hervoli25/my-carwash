# 🚗 Ekhaya Car Wash - Setup & Running Guide

## 📋 Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database running
- Git (for version control)

## 🔧 Initial Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Create/update your `.env` file with:
```env
# Database Configuration - PostgreSQL
DATABASE_URL="postgresql://postgres:postgres2@localhost/Ekhaya_car_wash"

# Public site URL used in links and QR codes (set to your domain in production)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# NextAuth.js Configuration
NEXTAUTH_SECRET="ekhaya-car-wash-secret-key-2024"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Stripe (for payments - can be added later)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
# STRIPE_SECRET_KEY=""
# STRIPE_WEBHOOK_SECRET=""
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to PostgreSQL database
npm run db:push

# Seed database with sample data
npm run db:seed
```

## 🚀 Running the Application

### Start Development Server
```bash
npm run dev
```
- **Application URL**: http://localhost:3002 (or next available port)
- **Auto-reload**: Enabled for development
- **Environment**: Development mode with hot reloading

### Start Production Server
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🗄️ Database Management

### Open Database Studio (Visual Interface)
```bash
npm run db:studio
```
- **Studio URL**: http://localhost:5555
- **Features**: Visual database browser, edit data, run queries
- **Access**: Browse all tables, relationships, and data

### Other Database Commands
```bash
# Validate database integrity
npm run db:validate

# Reset database (⚠️ Destructive - removes all data)
npm run db:reset

# Custom migration (for data transitions)
npm run db:migrate-custom
```

## 👤 Test Login Credentials

**Admin User:**
- **Email**: `john@doe.com`
- **Password**: `johndoe123`
- **Role**: Administrator
- **Features**: Full access to all features

## 📊 Sample Data Included

### Services Available:
1. **Express Exterior Wash** - R80.00 (30 min)
2. **Premium Wash & Wax** - R150.00 (60 min)
3. **Deluxe Interior & Exterior** - R200.00 (90 min)
4. **Executive Detail Package** - R300.00 (120 min)

### Add-ons Available:
- Interior vacuum (R20)
- Tire shine (R15)
- Air freshener (R10)
- Leather conditioning (R40)
- Engine cleaning (R50)
- Wheel cleaning (R25)
- Complete waxing (R35)

### Test Vehicle:
- **Make**: Toyota
- **Model**: Corolla
- **Year**: 2020
- **License Plate**: CA 123 GP
- **Type**: Sedan

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database Management
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:pull        # Pull schema from database
npm run db:seed        # Seed with sample data
npm run db:studio      # Open Prisma Studio (Visual DB)
npm run db:reset       # Reset and reseed database
npm run db:validate    # Validate database integrity
npm run db:migrate     # Run Prisma migrations
npm run db:deploy      # Deploy migrations to production
```

## 🌐 Application URLs

### Development
- **Main App**: http://localhost:3002
- **Database Studio**: http://localhost:5555 (when running `npm run db:studio`)

### Production
- **Main App**: Your deployed domain
- **Database Studio**: Not recommended for production

## 🔒 Security Notes

- **Environment Variables**: Never commit `.env` file to version control
- **Database Credentials**: Keep PostgreSQL credentials secure
- **NextAuth Secret**: Use a strong, unique secret key
- **Stripe Keys**: Add when ready, keep secret keys secure

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 is busy, Next.js will automatically try:
- Port 3001
- Port 3002
- And so on...

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check database credentials in `.env`
3. Verify database `Ekhaya_car_wash` exists

### Prisma Issues
```bash
# Regenerate Prisma client
npm run db:generate

# Reset if needed
npm run db:reset
```

## 📱 Features Available

### ✅ Currently Working
- User authentication (NextAuth.js)
- Vehicle management
- Service browsing and booking
- Booking history and management
- Reviews and ratings system
- Notifications
- Admin dashboard
- Database operations

### ⏳ Ready When Stripe Added
- Payment processing
- Saved payment methods
- Subscription management
- Payment history
- Refunds and disputes

## 🎯 Next Steps

1. **Test the application** with provided credentials
2. **Explore Database Studio** to see your data
3. **Add Stripe credentials** when ready for payments
4. **Customize** the application for your specific needs
5. **Deploy** to production when ready

## 📞 Support

- **Database Issues**: Check Prisma Studio for data inspection
- **Application Errors**: Check browser console and terminal logs
- **Environment Issues**: Verify `.env` file configuration

---

**Your Ekhaya Car Wash application is ready to use! 🎉**
