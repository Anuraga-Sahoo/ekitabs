
import { type NextRequest, NextResponse } from 'next/server';

// This route is deprecated as the signup and login flows have been consolidated
// or redesigned.
// The previous functionality involved verifying an OTP sent during the signup request
// and then creating the user account.

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: "This signup completion endpoint (/api/auth/complete-signup) is deprecated and no longer in use. Please refer to the current authentication flow." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
