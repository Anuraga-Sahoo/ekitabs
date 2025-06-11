
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
    const body = await request.json();
    const validationResult = verifyOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { activationToken, otp: userSubmittedOtp } = validationResult.data;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET for activation token is not defined.");
      return NextResponse.json({ message: "Internal server configuration error." }, { status: 500 });
    }

    let decodedPayload: ActivationTokenPayload;
    try {
      decodedPayload = jwt.verify(activationToken, process.env.JWT_SECRET) as ActivationTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 });
      }
      console.error("JWT verification error:", err);
      return NextResponse.json({ message: "Invalid or malformed activation token." }, { status: 400 });
    }

    // Enhanced payload validation
    if (!decodedPayload || typeof decodedPayload.user !== 'object' || decodedPayload.user === null || typeof decodedPayload.otp !== 'string') {
        console.error("Decoded JWT payload is malformed (missing user object or otp):", decodedPayload);
        return NextResponse.json({ message: "Invalid activation token payload structure." }, { status: 400 });
    }
    if (typeof decodedPayload.user.name !== 'string' ||
        typeof decodedPayload.user.email !== 'string' ||
        typeof decodedPayload.user.passwordHash !== 'string') {
        console.error("Decoded JWT user details are malformed:", decodedPayload.user);
        return NextResponse.json({ message: "Invalid user details in activation token payload." }, { status: 400 });
    }


    if (userSubmittedOtp !== decodedPayload.otp) {
      return NextResponse.json({ message: "Invalid OTP. Please try again." }, { status: 400 });
    }

    const { user: userDetails } = decodedPayload;
    const usersCollection = await getUsersCollection();

    const existingVerifiedUser = await usersCollection.findOne({ email: userDetails.email.toLowerCase(), isVerified: true });
    if (existingVerifiedUser) {
      return NextResponse.json({ message: "User with this email is already verified." }, { status: 409 });
    }

    const result = await usersCollection.updateOne(
      { email: userDetails.email.toLowerCase() }, // Query by lowercase email
      {
        $set: {
          name: userDetails.name,
          passwordHash: userDetails.passwordHash,
          isVerified: true,
          createdAt: new Date(),
        },
        $setOnInsert: {
            // email is already part of the query and will be set correctly.
            // userDetails.email from token is already lowercase.
            email: userDetails.email.toLowerCase(),
        }
      },
      { upsert: true }
    );

    // Check if the upsert operation was successful
    if (result.upsertedId || result.matchedCount > 0) {
      // If upsertedId exists, a new user was created.
      // If matchedCount > 0, an existing user was found and updated (or matched without changes if data was identical).
      // In both cases, isVerified: true is set by the $set operation.
      return NextResponse.json({ message: "Email verified and account created successfully." }, { status: 201 });
    } else {
      // This state (no upsert AND no match) should ideally not happen with upsert:true
      // unless there's a fundamental issue with the DB operation.
      console.error("User creation/update via upsert failed unexpectedly for email:", userDetails.email, "Mongo UpdateResult:", result);
      return NextResponse.json({ message: "Failed to create or update user account after verification due to an unexpected database issue." }, { status: 500 });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error during OTP verification", error: errorMessage }, { status: 500 });
  }
}
