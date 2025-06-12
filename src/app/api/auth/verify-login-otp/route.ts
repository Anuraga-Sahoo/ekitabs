
import { type NextRequest, NextResponse } from 'next/server';

// This route is deprecated as the signup and login flows have been consolidated
// or redesigned.
// The previous functionality involved verifying an OTP sent during a login request
// and then establishing a session for the user.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "This login OTP verification endpoint (/api/auth/verify-login-otp) is deprecated and no longer in use. Please refer to the current authentication flow." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
