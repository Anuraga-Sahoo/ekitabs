
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';
import { Collection, Db, MongoClient } from 'mongodb';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '@/lib/nodemailer';

const requestOtpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

interface UserDocument {
  _id?: any;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  isVerified?: boolean; // Optional: to track if email is verified
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = requestOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { name, email, password } = validationResult.data;

    const usersCollection = await getUsersCollection();
    // Check if a *verified* user already exists.
    // If an unverified user exists, we might allow them to try again with a new OTP.
    const existingVerifiedUser = await usersCollection.findOne({ email: email.toLowerCase(), isVerified: true });

    if (existingVerifiedUser) {
      return NextResponse.json({ message: "A verified user with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const userDetailsForToken = {
      name,
      email: email.toLowerCase(),
      passwordHash,
    };

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET for activation token is not defined.");
        return NextResponse.json({ message: "Internal server configuration error for OTP." }, { status: 500 });
    }

    const activationToken = jwt.sign(
      { user: userDetailsForToken, otp },
      process.env.JWT_SECRET, 
      { expiresIn: '10m' } // OTP valid for 10 minutes
    );

    await sendOtpEmail(email, 'TestPrep AI - Verify Your Email', { name, otp });

    return NextResponse.json({
      message: "OTP sent to your email. Please verify to complete registration.",
      activationToken, // Send token to client to be used in the next step
    }, { status: 200 });

  } catch (error) {
    console.error('Request OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Avoid exposing detailed internal errors like "Email service not configured" directly to client
    if (errorMessage.includes('Email service is not configured') || errorMessage.includes('Failed to send OTP email')) {
        return NextResponse.json({ message: "Could not send OTP. Please try again later or contact support." }, { status: 500 });
    }
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
