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
  isVerified?: boolean;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { message: "Request body is empty" },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const validationResult = requestOtpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name, email, password } = validationResult.data;

    const usersCollection = await getUsersCollection();
    const existingVerifiedUser = await usersCollection.findOne({ 
      email: email.toLowerCase(), 
      isVerified: true 
    });

    if (existingVerifiedUser) {
      return NextResponse.json(
        { message: "A verified user with this email already exists." }, 
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordHash = await hashPassword(password);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const userDetailsForToken = {
      name,
      email: email.toLowerCase(),
      passwordHash,
    };

    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { message: "Internal server configuration error for OTP." }, 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const activationToken = jwt.sign(
      { user: userDetailsForToken, otp },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    await sendOtpEmail(email, 'TestPrep AI - Verify Your Email', { name, otp });

    return NextResponse.json({
      message: "OTP sent to your email. Please verify to complete registration.",
      activationToken,
    }, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Request OTP error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage }, 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}