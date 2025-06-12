
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import { cookies } from 'next/headers';

const verifyLoginOtpSchema = z.object({
  loginOtpToken: z.string().min(1, { message: "Login OTP token is required." }),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

interface LoginOtpPayload {
  email: string;
  otp: string;
  iat: number;
  exp: number;
}

interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash?: string; // Password might not be set for all OTP users if signup also OTP
  isVerified: boolean;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error("API Error: JWT_SECRET is not defined for verifying login OTP.");
    return NextResponse.json(
      { message: "Internal server configuration error: JWT_SECRET missing." },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const body = await request.json();
    const validationResult = verifyLoginOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { loginOtpToken, otp: userSubmittedOtp } = validationResult.data;

    let decodedPayload: LoginOtpPayload;
    try {
      decodedPayload = jwt.verify(loginOtpToken, jwtSecret) as LoginOtpPayload;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      console.error("Verify Login OTP: Invalid or malformed login token:", err);
      return NextResponse.json(
        { message: "Invalid or malformed login token." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userSubmittedOtp !== decodedPayload.otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = decodedPayload; // email is already lowercased from request-login-otp

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: email, isVerified: true });

    if (!user) {
      return NextResponse.json(
        { message: "User not found or not verified. Please sign up or verify your email." },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const authTokenPayload = { userId: user._id.toString(), email: user.email, name: user.name };
    const authToken = jwt.sign(authTokenPayload, jwtSecret, { expiresIn: '7d' });

    const cookieStore = cookies();
    const cookieOptionsBase = {
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax' as const,
    };

    cookieStore.set(AUTH_TOKEN_NAME, authToken, { ...cookieOptionsBase, httpOnly: true });
    cookieStore.set('isLoggedIn', 'true', cookieOptionsBase);
    cookieStore.set('userEmail', user.email, cookieOptionsBase);
    cookieStore.set('userName', user.name, cookieOptionsBase);

    return NextResponse.json(
      { message: "Logged in successfully.", user: { id: user._id.toString(), email: user.email, name: user.name } },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Verify Login OTP API Unhandled Error:', error);
    let errorMessage = "An unknown error occurred during login OTP verification.";
    let errorDetails = null;
    let errorStack = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    } else {
      errorMessage = String(error);
    }
    
    try {
        errorDetails = JSON.parse(JSON.stringify(error));
    } catch (serializeError) {
        errorDetails = "Error object could not be serialized.";
    }

    return NextResponse.json(
      { 
        message: "Internal server error during login OTP verification.", 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? errorDetails : undefined,
        stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined 
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
