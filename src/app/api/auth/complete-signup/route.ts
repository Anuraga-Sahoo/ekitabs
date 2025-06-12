
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import { cookies } from 'next/headers';

const completeSignupSchema = z.object({
  signupOtpToken: z.string().min(1, { message: "Signup token is required." }),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

interface SignupOtpPayload {
  name: string;
  email: string;
  passwordHash: string;
  otp: string;
  iat: number;
  exp: number;
}

interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  isVerified: boolean;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error("API Error: JWT_SECRET is not defined for completing signup.");
    return NextResponse.json(
      { message: "Internal server configuration error: JWT_SECRET missing." },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const jwtSecret = process.env.JWT_SECRET;

  try {
    const body = await request.json();
    const validationResult = completeSignupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { signupOtpToken, otp: userSubmittedOtp } = validationResult.data;

    let decodedPayload: SignupOtpPayload;
    try {
      decodedPayload = jwt.verify(signupOtpToken, jwtSecret) as SignupOtpPayload;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      console.error("Complete Signup: Invalid or malformed signup token:", err);
      return NextResponse.json(
        { message: "Invalid or malformed signup token. Please try signing up again." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userSubmittedOtp !== decodedPayload.otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, passwordHash } = decodedPayload; // email is already lowercased from request-signup-otp

    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({ email: email });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { message: "This email is already registered and verified. Please log in." },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const newUserIdOnInsert = new ObjectId();

    const updateResult = await usersCollection.updateOne(
      { email: email }, // Match by email
      {
        $set: { // Fields to set regardless of insert or update
          name: name,
          passwordHash: passwordHash,
          isVerified: true,
        },
        $setOnInsert: { // Fields to set only if a new document is inserted
          _id: newUserIdOnInsert,
          email: email, // Ensure email is set on insert, should be already lowercased
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );
    
    const finalUserId = updateResult.upsertedId ? updateResult.upsertedId : (existingUser ? existingUser._id : newUserIdOnInsert);

    const authTokenPayload = { userId: finalUserId.toString(), email: email, name: name };
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
    cookieStore.set('userEmail', email, cookieOptionsBase);
    cookieStore.set('userName', name, cookieOptionsBase);

    return NextResponse.json(
      { message: "Account created and verified successfully.", user: { id: finalUserId.toString(), email, name } },
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Complete Signup API Unhandled Error:', error);
    let errorMessage = "An unknown error occurred during account completion.";
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
        message: "Internal server error during account completion.", 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? errorDetails : undefined,
        stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined 
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
