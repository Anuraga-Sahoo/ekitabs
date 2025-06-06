
// src/lib/authUtilsOnServer.ts
'use server';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';

interface JWTPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  name?: string;
}

export async function getUserIdFromAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(AUTH_TOKEN_NAME);

  if (!tokenCookie?.value) {
    console.log("No auth token cookie found on server for getUserIdFromAuthToken.");
    return null;
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set for token verification on server for getUserIdFromAuthToken.');
    return null;
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(tokenCookie.value, secret);
    return (payload as JWTPayload).userId || null;
  } catch (e) {
    console.error('Token verification failed on server for getUserIdFromAuthToken:', e);
    return null;
  }
}
