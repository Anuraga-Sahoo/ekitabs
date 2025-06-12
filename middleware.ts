
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import * as jose from 'jose'; // Using jose for JWT verification

interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  name?: string;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables.');
    return null;
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authTokenCookie = request.cookies.get(AUTH_TOKEN_NAME);
  const authToken = authTokenCookie?.value;

  const decodedToken = authToken ? await verifyToken(authToken) : null;
  const isAuthenticated = !!decodedToken;

  // Public paths accessible to everyone
  const publicPaths = [
    '/', // Home page is now public
    '/login',
    '/signup',
    '/api/auth/request-signup-otp',
    '/api/auth/complete-signup',
    '/api/auth/request-login-otp',
    '/api/auth/verify-login-otp',
    // Old auth routes are deprecated but might still be hit if not removed:
    '/api/auth/login', 
    '/api/auth/signup',
    '/api/auth/verify-otp'
  ];
  // Paths that should redirect if authenticated
  const authRedirectPaths = ['/login', '/signup'];

  // Allow access to Next.js internals, static files, favicon, and health API
  if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname === '/favicon.ico' || pathname === '/api/health') {
    return NextResponse.next();
  }

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    // If authenticated and trying to access login/signup, redirect to dashboard
    if (isAuthenticated && authRedirectPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // If not authenticated and trying to access a protected route
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Optional: Add a redirect query param to return to the intended page after login
    // loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated, allow access and add user info to headers
  const response = NextResponse.next();
  if (decodedToken) {
    response.headers.set('X-User-Id', decodedToken.userId);
    response.headers.set('X-User-Email', decodedToken.email);
    if (decodedToken.name) {
      response.headers.set('X-User-Name', decodedToken.name);
    }
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api/health (health check endpoint)
     */
     '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
