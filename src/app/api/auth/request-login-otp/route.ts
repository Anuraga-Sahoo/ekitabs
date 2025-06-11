
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { sendOtpEmail } from '@/lib/nodemailer';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Collection, Db, MongoClient } from 'mongodb';

const requestLoginOtpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

interface UserDocument {
  _id?: any;
  name: string;
  email: string;
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
    const validationResult = requestLoginOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { email } = validationResult.data;
    const lowercasedEmail = email.toLowerCase();

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: lowercasedEmail });

    if (!user) {
      return NextResponse.json(
        { message: "User with this email not found. Please sign up." },
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Your email is not verified. Please complete the signup process or contact support." },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP

    const loginOtpPayload = {
      email: lowercasedEmail,
      otp,
    };

    const loginOtpToken = jwt.sign(loginOtpPayload, process.env.JWT_SECRET, { expiresIn: '10m' }); // OTP valid for 10 minutes

    await sendOtpEmail(lowercasedEmail, 'TestPrep AI - Login OTP', { name: user.name, otp });

    return NextResponse.json(
      { message: "Login OTP sent to your email.", loginOtpToken },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Request Login OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
