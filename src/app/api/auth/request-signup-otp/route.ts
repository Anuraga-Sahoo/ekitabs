
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
  console.log("API: /api/auth/request-signup-otp POST request received");

  if (!process.env.JWT_SECRET) {
    console.error("API Error: JWT_SECRET is not defined for OTP generation.");
    return NextResponse.json(
      { message: "Internal server configuration error: JWT_SECRET missing." },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  if (!process.env.GMAIL || !process.env.GMAIL_PASSWORD) {
    console.error("API Error: Email (GMAIL/GMAIL_PASSWORD) service is not configured in .env.");
    return NextResponse.json(
      { message: "Email service not configured." },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  const jwtSecret = process.env.JWT_SECRET; // Store it after check for type safety

  try {
    console.log("Step 1: Parsing request body");
    const body = await request.json();
    console.log("Step 1a: Request body parsed:", body);

    console.log("Step 2: Validating request body with Zod");
    const validationResult = requestSignupOtpSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn("API Validation Failed:", validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { message: "Validation failed", errors: validationResult.error.flatten().fieldErrors },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log("Step 2a: Validation successful");

    const { name, email, password } = validationResult.data;
    const lowercasedEmail = email.toLowerCase();
    console.log(`Step 3: Processing for email: ${lowercasedEmail}`);

    console.log("Step 4: Getting users collection");
    const usersCollection = await getUsersCollection();
    console.log("Step 4a: Got users collection");

    console.log(`Step 5: Checking for existing verified user: ${lowercasedEmail}`);
    const existingVerifiedUser = await usersCollection.findOne({ email: lowercasedEmail, isVerified: true });
    console.log("Step 5a: Finished checking for existing user");

    if (existingVerifiedUser) {
      console.log(`API Warning: Verified user with email ${lowercasedEmail} already exists.`);
      return NextResponse.json(
        { message: "A verified user with this email already exists. Please log in." },
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log("Step 5b: No existing verified user found, proceeding.");

    console.log("Step 6: Hashing password");
    const passwordHash = await hashPassword(password);
    console.log("Step 6a: Password hashed");

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    console.log(`Step 7: Generated OTP: ${otp}`);

    const signupOtpPayload = {
      name,
      email: lowercasedEmail,
      passwordHash,
      otp,
    };
    console.log("Step 8: Signing JWT for signup OTP");
    const signupOtpToken = jwt.sign(signupOtpPayload, jwtSecret, { expiresIn: '10m' });
    console.log("Step 8a: JWT signed");

    console.log(`Step 9: Sending OTP email to ${lowercasedEmail}`);
    await sendOtpEmail(lowercasedEmail, 'TestPrep AI - Verify Your Email', { name, otp });
    console.log("Step 9a: OTP email presumed sent successfully");

    console.log("Step 10: Sending success response to client");
    return NextResponse.json(
      { message: "OTP sent to your email. Please verify to complete registration.", signupOtpToken },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('API /api/auth/request-signup-otp Unhandled Error:', error);
    let errorMessage = "An unknown error occurred during signup OTP request.";
    let errorStack = null;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    } else {
      errorMessage = String(error);
    }
    
    console.error(`Error Message: ${errorMessage}`);
    if (errorStack) {
      console.error(`Error Stack: ${errorStack}`);
    }
    
    // Try to serialize the error if it's not too complex
    let errorDetails = null;
    try {
        errorDetails = JSON.parse(JSON.stringify(error)); // Basic serialization
    } catch (serializeError) {
        errorDetails = "Error object could not be serialized.";
    }

    return NextResponse.json(
      { 
        message: "Internal server error during OTP request.", 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? errorDetails : undefined,
        stack: process.env.NODE_ENV !== 'production' ? errorStack : undefined 
      },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
    