
// This file is deprecated and replaced by OTP-based login.
// Kept for reference or if a password-based login is re-introduced.
// The active login flow is now handled by:
// - /api/auth/request-login-otp
// - /api/auth/verify-login-otp

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: "Password-based login is deprecated. Use OTP login." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

export async function GET() {
  return NextResponse.json(
    { message: "Password-based login is deprecated. Use OTP login." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
