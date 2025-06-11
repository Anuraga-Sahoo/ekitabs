
// This file is deprecated and replaced by the two-step OTP-based signup.
// Kept for reference.
// The active signup flow is now handled by:
// - /api/auth/request-signup-otp
// - /api/auth/complete-signup

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { message: "This signup endpoint is deprecated. Use /api/auth/request-signup-otp and /api/auth/complete-signup." },
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}
