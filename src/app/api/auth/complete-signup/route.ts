
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
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined for OTP verification.");
      return NextResponse.json(
        { message: "Internal server configuration error." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
      decodedPayload = jwt.verify(signupOtpToken, process.env.JWT_SECRET) as SignupOtpPayload;
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: "OTP has expired. Please request a new one." },
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
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

    const { name, email, passwordHash } = decodedPayload; // email is already lowercased

    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({ email: email });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { message: "This email is already registered and verified. Please log in." },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const newUserId = new ObjectId();

    // Upsert user: create if not exists, or update if exists (e.g., an unverified entry)
    const updateResult = await usersCollection.updateOne(
      { email: email },
      {
        $set: {
          name: name,
          passwordHash: passwordHash,
          isVerified: true,
        },
        $setOnInsert: {
          _id: newUserId,
          email: email, // Ensure email is set on insert
          createdAt: new Date(),
        }
      },
      { upsert: true }
    );
    
    const finalUserId = updateResult.upsertedId ? updateResult.upsertedId : (existingUser ? existingUser._id : newUserId);


    // Generate main authentication token
    const authTokenPayload = { userId: finalUserId.toString(), email: email, name: name };
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
    cookieStore.set('userEmail', email, cookieOptionsBase);
    cookieStore.set('userName', name, cookieOptionsBase);

    return NextResponse.json(
      { message: "Account created and verified successfully.", user: { id: finalUserId.toString(), email, name } },
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Complete Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
