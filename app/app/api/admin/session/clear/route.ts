import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Clear all NextAuth cookies to force fresh login
    const cookieStore = cookies();
    
    // List of NextAuth cookie names to clear
    const nextAuthCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url'
    ];

    // Create response with cleared cookies
    const response = NextResponse.json({
      success: true,
      message: 'Admin session cleared successfully',
      action: 'redirect_to_login',
      cleared_cookies: nextAuthCookies.length
    });

    // Clear each cookie
    nextAuthCookies.forEach(cookieName => {
      response.cookies.delete(cookieName);
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
      });
    });

    console.log('🧹 Admin session cookies cleared for fresh login');

    return response;

  } catch (error) {
    console.error('❌ Failed to clear session:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to clear session',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}