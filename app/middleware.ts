import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Hide admin/staff routes from public crawlers
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') || pathname.startsWith('/staff')) {
    const headers = new Headers(request.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*','/staff/:path*'],
};

