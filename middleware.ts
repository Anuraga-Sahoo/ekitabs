
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import * as jose from 'jose'; // Using jose for JWT verification

async function verifyToken(token: string): Promise<any | null> {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables.');
    return null;
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.log('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authTokenCookie = request.cookies.get(AUTH_TOKEN_NAME);
  const authToken = authTokenCookie?.value;

  const isAuthenticated = authToken ? await verifyToken(authToken) : null;

  // Public paths accessible to everyone
  const publicPaths = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];
  // Paths that should redirect if authenticated
  const authRedirectPaths = ['/login', '/signup'];

  if (publicPaths.includes(pathname) || pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname === '/favicon.ico' || pathname === '/api/health') {
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

  // If authenticated, allow access
  const response = NextResponse.next();
  if (isAuthenticated && isAuthenticated.userId && isAuthenticated.email) {
    response.headers.set('X-User-Id', isAuthenticated.userId as string);
    response.headers.set('X-User-Email', isAuthenticated.email as string);
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
     '/((?!api/health|_next/static|_next/image|favicon.ico).*)', 
  ],
};
