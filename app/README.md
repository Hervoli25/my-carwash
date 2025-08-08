
# PRESTIGE Car Wash Website

## 🚀 Project Overview

Welcome to the **PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING** website - a modern, professional car wash booking platform built with Next.js, featuring productive customer lounge experience and comprehensive service management.

## ✨ Features Implemented

### 🎨 **Branding Updates**
- ✅ Updated logo to "PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING"
- ✅ Consistent branding throughout all pages
- ✅ Professional red and blue brand colors maintained
- ✅ Responsive logo sizing across all devices

### 🧭 **Smooth Navigation**
- ✅ Smooth scrolling to sections (Services, Membership)
- ✅ Interactive navigation menu
- ✅ Mobile-responsive hamburger menu
- ✅ Anchor-based section navigation

### 🔐 **Authentication System**
- ✅ Complete NextAuth.js implementation
- ✅ User registration and login
- ✅ Dummy test account for testing
- ✅ Protected dashboard routes
- ✅ Session management

### 📱 **Pages & Features**
- ✅ **Homepage**: Hero section, services overview, testimonials
- ✅ **Services**: Express, Premium, Deluxe, Executive packages
- ✅ **Booking System**: Multi-step booking with time selection
- ✅ **User Dashboard**: Bookings management, profile settings
- ✅ **Membership Plans**: Subscription-based services
- ✅ **Authentication**: Sign in/up pages with proper validation

## 🏗️ **Technical Stack**

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **UI Components**: Radix UI + shadcn/ui
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod validation

## 🚀 **Quick Start Guide**

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git (for version control)

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables**:
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

3. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to PostgreSQL database
   npm run db:push

   # Seed database with sample data
   npm run db:seed
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Visit `http://localhost:3002` (or next available port)

6. **Open Database Studio** (optional):
   ```bash
   npm run db:studio
   ```
   Visit `http://localhost:5555` for visual database management

## 🔧 **Available Scripts**

### Development
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

### Database Management
```bash
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

### Application URLs
- **Main App**: http://localhost:3002 (development)
- **Database Studio**: http://localhost:5555 (when running `npm run db:studio`)

## 🧪 **Testing Credentials**

### Dummy Login Account
For testing user authentication and dashboard features:

- **Email**: `john@doe.com`
- **Password**: `johndoe123`

This account has been pre-configured with sample bookings and profile data.

### Admin Features
The system supports admin roles for managing services and bookings (expandable).

## 📁 **Project Structure**

```
app/
├── app/                    # App Router pages
│   ├── auth/              # Authentication pages
│   ├── book/              # Booking system
│   ├── dashboard/         # User dashboard
│   ├── services/          # Service pages
│   └── api/               # API routes
├── components/            # Reusable components
│   ├── ui/               # UI primitives
│   └── sections/         # Page sections
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
└── public/               # Static assets
    ├── logocarwash.jpg   # Main brand logo
    └── service-images/   # Car wash service images
```

## 🎨 **Design System**

### Brand Colors
- **Primary Red**: `#dc2626` (Ekhaya red)
- **Primary Blue**: `#2563eb` (Ekhaya blue)
- **Accent Yellow**: `#fbbf24` (Highlights)
- **Neutral Grays**: Various shades for text and backgrounds

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Headings**: Bold weights (600-800)
- **Body Text**: Regular (400) and medium (500)

### Components
All components follow the shadcn/ui design system with custom Ekhaya Intel styling.

## 🔧 **Customization Guide**

### Updating Branding

1. **Logo Replacement**:
   - Replace `/public/logocarwash.jpg` with your new logo
   - Update alt texts in components
   - Adjust sizing in CSS classes

2. **Color Scheme**:
   - Modify colors in `tailwind.config.js`
   - Update CSS custom properties in `globals.css`
   - Search and replace color classes in components

3. **Content Updates**:
   - Service descriptions: `/components/sections/services-section.tsx`
   - Hero content: `/components/sections/hero-section.tsx`
   - Company information: `/components/footer.tsx`

### Adding New Services

1. **Update Service Data**:
   ```typescript
   // In services configuration
   const services = [
     {
       id: 'new-service',
       name: 'New Service Name',
       price: 299,
       duration: '60 minutes',
       description: 'Service description...',
       features: ['Feature 1', 'Feature 2']
     }
   ]
   ```

2. **Create Service Page**:
   - Add route in `app/services/[service]/page.tsx`
   - Include booking integration
   - Add service-specific content

### Database Modifications

1. **Schema Updates**:
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name your-migration-name
   ```

2. **Adding New Models**:
   - Define in `schema.prisma`
   - Generate migration
   - Update API routes accordingly

## 🌐 **Deployment Options**

### Option 1: Vercel (Recommended)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD

### Option 2: Custom Domain Setup
1. Export the project:
   ```bash
   yarn build
   yarn export
   ```
2. Upload build files to your hosting provider
3. Configure database connection strings
4. Set up SSL certificates

### Environment Variables for Production
```bash
# Public site URL used in links and QR codes
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# NextAuth config
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key

# Database
DATABASE_URL=your-production-database-url
```

## 🔍 **Navigation Features**

The website includes smooth scrolling navigation that works as follows:

### Section Navigation
- **Home**: Scrolls to hero section (`#home`)
- **Services**: Scrolls to services section (`#services`)
- **Membership**: Scrolls to membership section (`#membership`)
- **Book Online**: Direct navigation to booking page

### Mobile Experience
- Collapsible hamburger menu
- Touch-friendly navigation
- Responsive design for all screen sizes

## 📊 **Features Overview**

### 🏠 **Homepage**
- Hero section with call-to-action
- Services overview with pricing
- Features and benefits
- Customer testimonials
- Contact information footer

### 🛒 **Booking System**
- Multi-step booking process
- Service selection
- Date and time picker
- Customer information form
- Payment method selection
- Booking confirmation

### 👤 **User Dashboard**
- Upcoming bookings overview
- Booking history
- Profile management
- Payment methods
- Membership status

### 🎫 **Membership System**
- Multiple membership tiers
- Subscription management
- Member-only benefits
- Automatic renewals

## 🐛 **Troubleshooting**

### Common Issues

1. **Database Connection**:
   ```bash
   # Reset database connection
   npx prisma generate
   npx prisma migrate reset
   ```

2. **Authentication Issues**:
   - Verify NEXTAUTH_SECRET is set
   - Check database user table
   - Ensure session strategy is correct

3. **Build Errors**:
   ```bash
   # Clear Next.js cache
   rm -rf .next
   yarn build
   ```

4. **Styling Issues**:
   ```bash
   # Regenerate Tailwind
   npx tailwindcss build -i ./app/globals.css -o ./dist/output.css
   ```

## 📞 **Support & Maintenance**

### Regular Updates
- Monitor dependencies for security updates
- Update Next.js and React regularly
- Review and optimize database queries
- Monitor performance metrics

### Backup Strategy
- Regular database backups
- Source code version control
- Environment variables backup
- Image assets backup

## 🔒 **Security Considerations**

- ✅ CSRF protection via NextAuth.js
- ✅ SQL injection prevention via Prisma
- ✅ Environment variable security
- ✅ Session management
- ✅ Input validation with Zod schemas

## 📈 **Performance Optimization**

- ✅ Next.js Image optimization
- ✅ Static site generation where possible
- ✅ Code splitting and lazy loading
- ✅ Efficient database queries
- ✅ Tailwind CSS purging

## 🎯 **Future Enhancements**

### Potential Additions
- [ ] Online payment integration (Stripe/PayPal)
- [ ] SMS notifications for appointments
- [ ] Loyalty points system
- [ ] Staff management dashboard
- [ ] Real-time booking availability
- [ ] Customer review system
- [ ] Service add-ons and packages
- [ ] Multi-location support

## 📝 **License & Credits**

This project was created for **PRESTIGE Car Wash BY: EKHAYA INTEL. TRADING** and includes:

- Next.js framework
- Tailwind CSS design system
- Radix UI components
- shadcn/ui component library
- Framer Motion animations
- Custom Ekhaya Intel branding

---

**Built By Herve Tshombe with ❤️ for PRESTIGE Ekhaya Car Wash**

For technical support or customization requests, refer to the component documentation and API reference within the codebase.
