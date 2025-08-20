# PRESTIGE Car Wash - GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to additional search and context gathering only when the information here is incomplete or found to be in error.**

## Project Overview

PRESTIGE Car Wash is a Next.js 14 car wash booking platform with TypeScript, PostgreSQL, Prisma ORM, NextAuth.js authentication, Stripe payments, and Tailwind CSS. The main application code is located in the `/app` subdirectory, not the repository root.

## Working Effectively

### Essential Prerequisites
- Node.js 18+ (verified working with v20.19.4)
- PostgreSQL database server running locally
- Git for version control

### Bootstrap and Build Process
Navigate to the app directory for all operations:
```bash
cd app
```

1. **Install dependencies**: 
   ```bash
   npm install --legacy-peer-deps
   ```
   - Takes ~60 seconds to complete. NEVER CANCEL - wait for completion.
   - The `--legacy-peer-deps` flag is REQUIRED due to dependency conflicts.

2. **Environment setup**:
   Create `.env` file with these exact values:
   ```env
   # Database Configuration - PostgreSQL
   DATABASE_URL="postgresql://postgres:postgres2@localhost/Ekhaya_car_wash"
   
   # Public site URL used in links and QR codes
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   
   # NextAuth.js Configuration
   NEXTAUTH_SECRET="ekhaya-car-wash-secret-key-2024"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Database setup** (requires PostgreSQL running):
   ```bash
   # Start PostgreSQL service (Linux/Mac)
   sudo service postgresql start
   
   # Create database and user
   sudo -u postgres createdb Ekhaya_car_wash
   sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres2';"
   
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```
   - Database operations take 30-120 seconds each. NEVER CANCEL - set timeout to 5+ minutes.
   - If network restrictions prevent Prisma engine downloads, document the limitation and continue with available commands.

4. **Build for production**:
   ```bash
   npm run build
   ```
   - Takes 2-5 minutes to complete. NEVER CANCEL - set timeout to 10+ minutes.
   - Build includes Prisma client generation and Next.js optimization.

### Development Workflow

1. **Start development server**:
   ```bash
   npm run dev
   ```
   - Takes ~15 seconds to start. Runs on http://localhost:3000
   - Auto-reload enabled for development changes.

2. **Run linting**:
   ```bash
   npm run lint
   ```
   - Takes ~5 seconds. May show TypeScript errors but runs successfully.
   - ALWAYS run before committing changes.

3. **Database management**:
   ```bash
   # Open visual database browser
   npm run db:studio
   # Runs on http://localhost:5555
   
   # Reset database (destructive)
   npm run db:reset
   
   # Validate database integrity
   npm run db:validate
   ```

## Validation Scenarios

**ALWAYS manually validate changes using these specific scenarios:**

### 1. Authentication Testing
- Navigate to http://localhost:3000/auth/sign-in
- Use test credentials: `john@doe.com` / `johndoe123`
- Verify successful login and redirect to dashboard
- Test logout functionality

### 2. Navigation Testing
- Test smooth scrolling navigation from homepage:
  - Click "Services" → should scroll to services section
  - Click "Membership" → should scroll to membership section
  - Click "Home" → should scroll to hero section
- Test mobile responsive menu (hamburger menu)

### 3. Booking Flow Testing
- Navigate to booking system from "Book Online" button
- Select a service (Express, Premium, Deluxe, or Executive)
- Choose date and time slot
- Fill customer information form
- Verify booking confirmation process

### 4. Database Operations Testing
- Verify database connection: `npm run db:validate`
- Open Prisma Studio: `npm run db:studio` → http://localhost:5555
- Check that sample data is populated correctly
- Verify user account exists with test credentials

### 5. Admin Dashboard Testing (if applicable)
- Access admin routes with proper authentication
- Test service management functionality
- Verify booking management features

## Common Issues and Solutions

### Database Connection Issues
```bash
# Reset Prisma client
npm run db:generate
npm run db:push --force-reset
npm run db:seed
```

### Build Failures
- Ensure PostgreSQL is running and accessible
- Verify `.env` file exists with correct DATABASE_URL
- Run `npm run db:generate` before building

### Lint Errors
- The codebase has existing TypeScript strict mode errors
- Focus on fixing NEW errors introduced by your changes
- Run `npm run lint` before each commit

### Port Conflicts
- Development server uses port 3000 by default
- Database studio uses port 5555
- Check for port conflicts if servers won't start

## Key Project Locations

### Important Directories
- `/app/app/` - Next.js App Router pages and API routes
- `/app/components/` - Reusable React components
- `/app/lib/` - Utility functions and configurations
- `/app/prisma/` - Database schema and migrations
- `/app/public/` - Static assets including brand logo

### Configuration Files
- `/app/package.json` - Dependencies and npm scripts
- `/app/next.config.js` - Next.js configuration
- `/app/tailwind.config.ts` - Tailwind CSS configuration
- `/app/tsconfig.json` - TypeScript configuration
- `/app/prisma/schema.prisma` - Database schema definition

### Key Components to Modify
- Hero Section: `/app/components/sections/hero-section.tsx`
- Services: `/app/components/sections/services-section.tsx`
- Navigation: `/app/components/navbar.tsx`
- Authentication: `/app/lib/auth.ts`
- Database Models: `/app/prisma/schema.prisma`

## Test Data and Credentials

### User Accounts (pre-seeded)
- **Test User**: `john@doe.com` / `johndoe123`
  - Role: Regular user with sample bookings
  - Use for testing authentication and booking features

### Sample Services Available
- Express Wash (R120, 30 minutes)
- Premium Wash (R180, 45 minutes) 
- Deluxe Wash (R250, 60 minutes)
- Executive Wash (R350, 90 minutes)

### Application URLs
- **Main App**: http://localhost:3000
- **Database Studio**: http://localhost:5555 (when running)
- **API Routes**: http://localhost:3000/api/*

## Performance and Timeout Guidelines

### Command Timeouts (NEVER CANCEL before these timeouts)
- `npm install --legacy-peer-deps`: 5 minutes
- `npm run build`: 10 minutes  
- `npm run db:generate`: 3 minutes
- `npm run db:push`: 5 minutes
- `npm run db:seed`: 2 minutes
- `npm run dev`: 1 minute (to fully start)

### Expected Performance
- Development server startup: ~15 seconds
- Build process: 2-5 minutes (depends on system)
- Database operations: 30-120 seconds each
- Lint checking: ~5 seconds

## Troubleshooting Network Issues

### Prisma Engine Download Failures
If you encounter "getaddrinfo ENOTFOUND binaries.prisma.sh" errors:
1. Document the network limitation
2. Use pre-built binaries if available
3. Consider alternative database setup methods
4. Skip database-dependent operations and focus on frontend testing

### Alternative Testing Without Database
If database setup fails:
1. Focus on UI component testing
2. Test static pages and navigation
3. Validate TypeScript compilation
4. Test responsive design and accessibility

## Security Notes

- Never commit `.env` files with real credentials
- Keep NEXTAUTH_SECRET secure and unique
- PostgreSQL credentials should be changed for production
- Stripe keys (when added) must be kept secure

## Modification Guidelines

When making changes:
1. ALWAYS run `npm run lint` first
2. Test authentication flow with provided credentials
3. Validate responsive design on mobile and desktop  
4. Test navigation and smooth scrolling functionality
5. Verify database operations if modifying data models
6. Take screenshots of UI changes for documentation

This is a complex full-stack application. Take time to understand the component relationships and database schema before making significant changes.