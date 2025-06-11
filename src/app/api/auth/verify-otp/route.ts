
// This file is deprecated as its functionality is now split into
// - /api/auth/complete-signup (for verifying signup OTPs)
// - /api/auth/verify-login-otp (for verifying login OTPs)
// Kept for reference.

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: "This OTP verification endpoint is deprecated. Use specific signup or login OTP verification routes." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
