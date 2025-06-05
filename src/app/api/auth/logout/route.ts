
import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    cookieStore.set(AUTH_TOKEN_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
    });
    cookieStore.set('isLoggedIn', '', { // Clear client-readable cookie too
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
    });

    return NextResponse.json({ message: "Logged out successfully." }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
