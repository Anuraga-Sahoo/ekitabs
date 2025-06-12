
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { comparePassword } from '@/lib/password';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';
import { Collection, Db, MongoClient } from 'mongodb';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

interface UserDocument {
  _id: any;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined.");
      return NextResponse.json({ message: "Internal server configuration error." }, { status: 500 });
    }

    const tokenPayload = { 
      userId: user._id.toString(), 
      email: user.email,
      name: user.name // Add name to JWT payload
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    const cookieStore = cookies();
    const cookieOptionsBase = {
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        sameSite: 'lax' as const,
    };

    cookieStore.set(AUTH_TOKEN_NAME, token, {
        ...cookieOptionsBase,
        httpOnly: true,
    });
    
    cookieStore.set('isLoggedIn', 'true', cookieOptionsBase);
    cookieStore.set('userEmail', user.email, cookieOptionsBase);
    cookieStore.set('userName', user.name, cookieOptionsBase); // Set userName cookie

    return NextResponse.json({ 
        message: "Logged in successfully.", 
        user: { id: user._id.toString(), email: user.email, name: user.name } 
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
