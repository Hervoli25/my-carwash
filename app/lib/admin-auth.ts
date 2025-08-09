import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcryptjs from 'bcryptjs';
import { prisma } from './db';
import speakeasy from 'speakeasy';

// Admin session declaration
declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
    role?: string;
    username?: string;
    image?: string | null;
    twoFactorEnabled?: boolean;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      role?: string;
      username?: string;
      twoFactorEnabled?: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isAdmin?: boolean;
    role?: string;
    username?: string;
    twoFactorEnabled?: boolean;
  }
}

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { attempts: number; lastAttempt: number }>();

const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(ip: string, username?: string): string {
  return username ? `${ip}:${username}` : ip;
}

function checkRateLimit(ip: string, username?: string): boolean {
  const key = getRateLimitKey(ip, username);
  const now = Date.now();
  const record = loginAttempts.get(key);
  
  if (!record) return true;
  
  if (now - record.lastAttempt > LOCKOUT_TIME) {
    loginAttempts.delete(key);
    return true;
  }
  
  return record.attempts < MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string, username?: string): void {
  const key = getRateLimitKey(ip, username);
  const now = Date.now();
  const record = loginAttempts.get(key) || { attempts: 0, lastAttempt: 0 };
  
  record.attempts += 1;
  record.lastAttempt = now;
  loginAttempts.set(key, record);
}

function clearFailedAttempts(ip: string, username?: string): void {
  const key = getRateLimitKey(ip, username);
  loginAttempts.delete(key);
}

async function verifyTwoFactor(secret: string, token: string): Promise<boolean> {
  return speakeasy.totp.verify({
    secret,
    token,
    window: 1,
  });
}

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'admin-credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
        ip: { label: 'IP Address', type: 'hidden' }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const xf = (req?.headers as any)?.get?.('x-forwarded-for') as string | undefined;
        const ip = credentials.ip || (xf ? xf.split(',')[0].trim() : 'unknown');
        
        // Check rate limiting
        if (!checkRateLimit(ip as string, credentials.username)) {
          console.warn(`🚫 Admin login rate limited: ${credentials.username} from ${ip}`);
          return null;
        }

        try {
          // Find admin user
          const adminUser = await prisma.adminUser.findUnique({
            where: { username: credentials.username }
          });

          if (!adminUser || !adminUser.isActive) {
            recordFailedAttempt(ip as string, credentials.username);
            return null;
          }

          // Check if account is locked
          if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
            console.warn(`🔒 Admin account locked: ${credentials.username}`);
            return null;
          }

          // Check IP whitelist if configured
          if (adminUser.allowedIPs.length > 0 && !adminUser.allowedIPs.includes(ip as string)) {
            console.warn(`🚫 Admin IP not whitelisted: ${credentials.username} from ${ip}`);
            recordFailedAttempt(ip as string, credentials.username);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(credentials.password, adminUser.password);
          if (!isPasswordValid) {
            recordFailedAttempt(ip as string, credentials.username);
            
            // Lock account after too many failed attempts
            const newFailedCount = adminUser.failedLogins + 1;
            if (newFailedCount >= MAX_ATTEMPTS) {
              await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: {
                  failedLogins: newFailedCount,
                  lockedUntil: new Date(Date.now() + LOCKOUT_TIME)
                }
              });
              console.warn(`🔒 Admin account locked due to failed attempts: ${credentials.username}`);
            } else {
              await prisma.adminUser.update({
                where: { id: adminUser.id },
                data: { failedLogins: newFailedCount }
              });
            }
            
            return null;
          }

          // Verify 2FA if enabled
          if (adminUser.twoFactorEnabled) {
            if (!credentials.twoFactorCode || !adminUser.twoFactorSecret) {
              return null;
            }
            
            const is2FAValid = await verifyTwoFactor(adminUser.twoFactorSecret, credentials.twoFactorCode);
            if (!is2FAValid) {
              recordFailedAttempt(ip as string, credentials.username);
              return null;
            }
          }

          // Success - clear failed attempts and update login info
          clearFailedAttempts(ip as string, credentials.username);
          
          await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: {
              failedLogins: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          });

          // Log successful login
          await prisma.adminAuditLog.create({
            data: {
              adminUserId: adminUser.id,
              action: 'LOGIN',
              resourceType: 'ADMIN',
              resourceId: adminUser.id,
              ipAddress: ip as string,
              userAgent: 'unknown'
            }
          });

          console.log(`✅ Admin login successful: ${credentials.username} from ${ip}`);

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            role: adminUser.role,
            username: adminUser.username,
            twoFactorEnabled: adminUser.twoFactorEnabled,
          };

        } catch (error) {
          console.error('Admin auth error:', error);
          recordFailedAttempt(ip as string, credentials.username);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours (shorter for admin)
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.twoFactorEnabled = (token as any).twoFactorEnabled;
      }
      return session;
    }
  },
  pages: {
    signIn: '/admin/login',
  }
};

// Admin middleware function
export async function requireAdmin(session: any): Promise<boolean> {
  return session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

export async function requireAdminWith2FA(session: any): Promise<boolean> {
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  if (!isAdmin) return false;
  return !!session?.user?.twoFactorEnabled;
}

export async function requireStaff(session: any): Promise<boolean> {
  return session?.user?.role === 'STAFF' || session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
}

export async function requireSuperAdmin(session: any): Promise<boolean> {
  return session?.user?.role === 'SUPER_ADMIN';
}

// Audit logging function
export async function logAdminAction(
  adminUserId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  oldValue?: any,
  newValue?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        resourceType,
        resourceId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown'
      }
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}