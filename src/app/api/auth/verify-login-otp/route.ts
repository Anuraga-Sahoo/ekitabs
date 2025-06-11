
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
  passwordHash: string; // Might not be used for OTP login, but present for users who set it
  isVerified: boolean;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined for OTP verification.");
      return NextResponse.json(
        { message: "Internal server configuration error." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      decodedPayload = jwt.verify(loginOtpToken, process.env.JWT_SECRET) as LoginOtpPayload;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
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

    const { email } = decodedPayload; // email is already lowercased

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: email, isVerified: true });

    if (!user) {
      // This case should ideally be caught by request-login-otp, but as a safeguard:
      return NextResponse.json(
        { message: "User not found or not verified. Please sign up or verify your email." },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate main authentication token
    const authTokenPayload = { userId: user._id.toString(), email: user.email, name: user.name };
    const authToken = jwt.sign(authTokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

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

  } catch (error) {
    console.error('Verify Login OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
