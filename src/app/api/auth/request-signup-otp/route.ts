
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/password';
import { sendOtpEmail } from '@/lib/nodemailer';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Collection, Db, MongoClient } from 'mongodb';

const requestSignupOtpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

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
      console.error("JWT_SECRET is not defined for OTP generation.");
      return NextResponse.json(
        { message: "Internal server configuration error." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!process.env.GMAIL || !process.env.GMAIL_PASSWORD) {
      console.error("Email (GMAIL/GMAIL_PASSWORD) service is not configured in .env.");
      return NextResponse.json(
        { message: "Email service not configured." },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }


    const body = await request.json();
    const validationResult = requestSignupOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, password } = validationResult.data;
    const lowercasedEmail = email.toLowerCase();

    const usersCollection = await getUsersCollection();
    const existingVerifiedUser = await usersCollection.findOne({ email: lowercasedEmail, isVerified: true });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { message: "A verified user with this email already exists. Please log in." },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If an unverified user exists, we can allow them to try verifying again with new details.
    // The complete-signup step will handle upserting/updating.

    const passwordHash = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const signupOtpPayload = {
      name,
      email: lowercasedEmail,
      passwordHash,
      otp,
    };

    const signupOtpToken = jwt.sign(signupOtpPayload, process.env.JWT_SECRET, { expiresIn: '10m' }); // OTP valid for 10 minutes

    await sendOtpEmail(lowercasedEmail, 'TestPrep AI - Verify Your Email', { name, otp });

    return NextResponse.json(
      { message: "OTP sent to your email. Please verify to complete registration.", signupOtpToken },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Request Signup OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
