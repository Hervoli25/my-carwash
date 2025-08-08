import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the real IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  let ip = 'unknown';
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (cfConnectingIp) {
    ip = cfConnectingIp;
  }
  
  console.log('🔍 IP Detection:', {
    forwarded,
    realIp,
    cfConnectingIp,
    detectedIp: ip
  });

  return NextResponse.json({ 
    ip,
    timestamp: new Date().toISOString() 
  });
}