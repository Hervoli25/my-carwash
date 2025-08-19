import { NextRequest, NextResponse } from 'next/server';

// API key authentication for CRM integration
export function authenticateApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  // Get API key from environment variable (fallback to multiple possible keys)
  const validApiKeys = [
    process.env.CRM_API_KEY,
    process.env.NEXTAUTH_SECRET, // Allow NextAuth secret as backup
    'ekhaya-car-wash-secret-key-2024' // Hardcoded fallback for testing
  ].filter(Boolean);
  
  if (validApiKeys.length === 0) {
    console.error('❌ No valid API keys configured');
    return false;
  }
  
  if (!apiKey) {
    console.warn('⚠️ API request missing X-API-Key header');
    return false;
  }
  
  const isValid = validApiKeys.includes(apiKey);
  
  if (!isValid) {
    console.warn('🚫 Invalid API key provided:', apiKey.substring(0, 8) + '...');
    console.log('Valid keys available:', validApiKeys.length);
  } else {
    console.log('✅ Valid API key authenticated for CRM access');
  }
  
  return isValid;
}

// Wrapper function for API routes that require authentication
export function withApiAuth(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    if (!authenticateApiKey(request)) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'Valid API key required. Include X-API-Key header.' 
        },
        { status: 401 }
      );
    }
    
    return handler(request, context);
  };
}

// CORS headers for CRM integration
export function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.CRM_ORIGIN_URL,           // Your CRM domain
    'https://mycarwash-tan.vercel.app',   // Car wash domain
    'http://localhost:3000',              // Local development
    'http://localhost:3001',              // Alternative local port
    'http://localhost:3002',              // CRM local development
  ].filter(Boolean);
  
  // Allow all Vercel preview deployments for development
  if (origin && (
    allowedOrigins.includes(origin) || 
    origin.includes('.vercel.app') ||
    origin.includes('localhost')
  )) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}