import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];

const corsOptions = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Endpoints that do not require authentication
const PUBLIC_API_PATHS = [
  '/api/student/login',
  '/api/teacher/login',
  '/api/admin/login',
  '/api/parent/login',
  '/api/login',
  '/api/logout',
  '/api/auth/me',
  '/api/exams/register-extern',
];

export async function proxy(request: NextRequest) {
  const origin = request.headers.get('origin') ?? '';
  const isAllowedOrigin = allowedOrigins.includes(origin);
  const pathname = request.nextUrl.pathname;

  const isPreflight = request.method === 'OPTIONS';

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { 'Access-Control-Allow-Origin': origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Check if public endpoint
  const isPublic = PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isPublic) {
    let token = request.cookies.get('auth_token')?.value;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Auth token missing. Please log in.' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired auth token. Please log in again.' },
        { status: 401 }
      );
    }

    // Role-based protection rules
    const role = payload.role;

    if (
      (pathname.startsWith('/api/admin') || pathname.startsWith('/api/superadmin')) &&
      role !== 'admin' &&
      role !== 'superadmin' &&
      role !== 'resource_center'
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required.' },
        { status: 403 }
      );
    }

    if (
      pathname.startsWith('/api/teacher') &&
      role !== 'teacher' &&
      role !== 'admin' &&
      role !== 'superadmin' &&
      role !== 'resource_center'
    ) {
      return NextResponse.json(
        { error: 'Forbidden: Teacher or Admin access required.' },
        { status: 403 }
      );
    }
  }

  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
