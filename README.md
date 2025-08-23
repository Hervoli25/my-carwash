# 🚗 Ekhaya Car Wash - Premium Car Wash Service Platform

A modern, full-stack car wash service platform built with Next.js 14, featuring real-time booking, membership management, and integrated payment processing.

## ✨ **Key Features**

### 🎯 **Customer Experience**
- **Smart Booking System**: Real-time availability with calendar integration
- **Digital Membership Cards**: QR code-based loyalty program with points
- **Mobile-First Design**: Responsive interface optimized for all devices
- **Secure Payments**: Stripe integration with saved payment methods
- **Real-Time Notifications**: SMS and email updates for bookings

### 🏢 **Business Management**
- **Admin Dashboard**: Comprehensive business analytics and management
- **Service Management**: Dynamic pricing and service configuration
- **Customer Insights**: Detailed analytics and customer behavior tracking
- **Staff Coordination**: Booking assignments and schedule management
- **Revenue Tracking**: Financial reporting and payment analytics

### 🔧 **Technical Excellence**
- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Prisma ORM
- **Database**: PostgreSQL with optimized queries and indexing
- **Authentication**: Secure NextAuth.js with multiple providers
- **API Integration**: RESTful APIs with comprehensive error handling
- **Performance**: Optimized loading, caching, and SEO-friendly

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hervoli25/my-carwash.git
   cd my-carwash/app
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   Create a `.env` file in the app directory:
   ```env
   # Database Configuration
   DATABASE_URL="your-postgresql-connection-string"

   # NextAuth.js Configuration
   NEXTAUTH_SECRET="your-secure-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: Stripe (for payments)
   # NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   # STRIPE_SECRET_KEY="your-stripe-secret-key"
   # STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
   ```

4. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed database with sample data
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - **Main App**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

## 🛠 **Technology Stack**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React icon library
- **Animations**: Framer Motion

### **Backend**
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Validation**: Zod schemas
- **Email**: Nodemailer
- **Payments**: Stripe integration

## 📊 **Core Features**

### **For Customers**
- Browse and book car wash services
- Manage appointments and payment methods
- Digital membership cards with QR codes
- Loyalty points and rewards system
- Real-time booking notifications

### **For Administrators**
- Comprehensive dashboard with analytics
- Booking and customer management
- Service configuration and pricing
- Staff scheduling and assignments
- Financial reporting and insights

## 🔒 **Security Features**

- Secure authentication and session management
- Role-based access control
- Data encryption and validation
- CSRF and SQL injection protection
- Environment variable security

## 🌐 **Deployment**

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Custom Hosting
1. Build the project: `npm run build`
2. Upload build files to your hosting provider
3. Configure environment variables
4. Set up SSL certificates

## 📞 **Support**

For technical support or questions:
- Check the documentation
- Review common troubleshooting steps
- Contact the development team

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

---

**Transform your car wash business with our comprehensive platform!** 🚗✨
