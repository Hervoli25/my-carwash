
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcryptjs from 'bcryptjs';
import speakeasy from 'speakeasy';
import { prisma } from './db';

declare module 'next-auth' {
  interface User {
    isAdmin?: boolean;
    role?: string;
    username?: string;
    image?: string | null;
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      }
    }),
    // Admin credentials provider for admin panel access
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
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

        try {
          // Find admin user
          const adminUser = await prisma.adminUser.findUnique({
            where: { username: credentials.username }
          });

          if (!adminUser || !adminUser.isActive) {
            return null;
          }

          // Check if account is locked
          if (adminUser.lockedUntil && adminUser.lockedUntil > new Date()) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcryptjs.compare(credentials.password, adminUser.password);
          if (!isPasswordValid) {
            // Increment failed attempts
            await prisma.adminUser.update({
              where: { id: adminUser.id },
              data: {
                failedLogins: adminUser.failedLogins + 1,
                lockedUntil: adminUser.failedLogins >= 2 ? new Date(Date.now() + 15 * 60 * 1000) : null
              }
            });
            return null;
          }

          // Verify 2FA if enabled
          if (adminUser.twoFactorEnabled && adminUser.twoFactorSecret) {
            if (!credentials.twoFactorCode) {
              return null;
            }
            
            const is2FAValid = speakeasy.totp.verify({
              secret: adminUser.twoFactorSecret,
              token: credentials.twoFactorCode,
              window: 2,
              encoding: 'base32'
            });
            
            if (!is2FAValid) {
              return null;
            }
          }

          // Success - reset failed attempts
          await prisma.adminUser.update({
            where: { id: adminUser.id },
            data: {
              failedLogins: 0,
              lockedUntil: null,
              lastLoginAt: new Date()
            }
          });

          return {
            id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            username: adminUser.username,
            role: adminUser.role,
            twoFactorEnabled: adminUser.twoFactorEnabled,
          };

        } catch (error) {
          console.error('Admin auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.twoFactorEnabled = (user as any).twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';
        session.user.isAdmin = token.isAdmin;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
};
