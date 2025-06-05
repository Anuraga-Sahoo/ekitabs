
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { hashPassword } from '@/lib/password';
import { z } from 'zod';
import { Collection, Db, MongoClient } from 'mongodb';

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});

interface UserDocument {
  _id?: any;
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
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        message: "Validation failed", 
        errors: validationResult.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;

    const usersCollection = await getUsersCollection();
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser: UserDocument = {
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    return NextResponse.json({ message: "User registered successfully." }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
