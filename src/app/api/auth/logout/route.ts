
import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const cookieOptionsBase = {
        secure: process.env.NODE_ENV !== 'development',
        expires: new Date(0),
        path: '/',
        sameSite: 'lax' as const,
    };

    cookieStore.set(AUTH_TOKEN_NAME, '', {
        ...cookieOptionsBase,
        httpOnly: true,
    });
    
    cookieStore.set('isLoggedIn', '', cookieOptionsBase); 
    cookieStore.set('userEmail', '', cookieOptionsBase);
    cookieStore.set('userName', '', cookieOptionsBase); // Clear userName cookie

    return NextResponse.json({ message: "Logged out successfully." }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
