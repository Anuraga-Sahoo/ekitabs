
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Collection, Db, MongoClient } from 'mongodb';

const verifyOtpSchema = z.object({
  activationToken: z.string().min(1, { message: "Activation token is required." }),
  otp: z.string().length(6, { message: "OTP must be 6 digits." }),
});

interface UserDetailsFromToken {
  name: string;
  email: string;
  passwordHash: string;
}

interface ActivationTokenPayload {
  user: UserDetailsFromToken;
  otp: string;
  iat: number;
  exp: number;
}

interface UserDocument {
  _id?: any;
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
  try {
    if (!process.env.JWT_SECRET) {
      console.error("CRITICAL: JWT_SECRET is not defined in /api/auth/verify-otp.");
      return NextResponse.json(
        { message: "Internal server configuration error: JWT_SECRET missing." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!process.env.MONGODB_URI) {
      console.error("CRITICAL: MONGODB_URI is not defined in /api/auth/verify-otp.");
      return NextResponse.json(
        { message: "Internal server configuration error: MONGODB_URI missing." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!request.body) {
      return NextResponse.json(
        { message: "Request body is empty" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validationResult = verifyOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { activationToken, otp: userSubmittedOtp } = validationResult.data;

    let decodedPayload: ActivationTokenPayload;
    try {
      decodedPayload = jwt.verify(activationToken, process.env.JWT_SECRET) as ActivationTokenPayload;
    } catch (err: any) {
      console.error('JWT Verification Error in verify-otp:', err);
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.json(
        { message: "Invalid or malformed activation token. Please try signing up again." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!decodedPayload || !decodedPayload.user ||
        typeof decodedPayload.user.name !== 'string' ||
        typeof decodedPayload.user.email !== 'string' ||
        typeof decodedPayload.user.passwordHash !== 'string') {
      console.error("Invalid token structure in verify-otp. Decoded payload:", decodedPayload);
      return NextResponse.json(
        { message: "Invalid token data structure." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (userSubmittedOtp !== decodedPayload.otp) {
      return NextResponse.json(
        { message: "Invalid OTP. Please try again." },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { user: userDetails } = decodedPayload;
    const usersCollection = await getUsersCollection();

    const existingVerifiedUser = await usersCollection.findOne({
      email: userDetails.email.toLowerCase(), // Email is already lowercased in token
      isVerified: true
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { message: "User with this email is already verified." },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await usersCollection.updateOne(
      { email: userDetails.email.toLowerCase() },
      {
        $set: {
          name: userDetails.name,
          passwordHash: userDetails.passwordHash,
          isVerified: true,
        },
        $setOnInsert: { // These fields are set only if a new document is inserted
          email: userDetails.email.toLowerCase(),
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );

    if (result.upsertedId || result.modifiedCount > 0 || result.matchedCount > 0) {
      return NextResponse.json(
        { message: "Email verified and account created successfully." },
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // This case should ideally not be reached if upsert is true and there's no error.
      // If it is, it might indicate an unexpected database state or issue.
      console.error("User account creation/verification failed despite upsert. Result:", result);
      return NextResponse.json(
        { message: "Failed to create or verify user account. Please try again." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: any) {
    console.error('--- Verify OTP Top Level Error ---');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    if (error.stack) {
        console.error('Stack Trace:', error.stack);
    }
    // Log the full error object if it's complex
    if (typeof error === 'object' && error !== null) {
        console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }


    let errorMessageForClient = "Internal server error during OTP verification.";
    // Avoid sending potentially sensitive stack traces or detailed db errors to client in prod
    if (process.env.NODE_ENV !== 'production' && error instanceof Error) {
        errorMessageForClient = error.message;
    }


    return NextResponse.json(
      { message: "An unexpected error occurred during OTP verification.", errorDetails: errorMessageForClient },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
