
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { comparePassword, hashPassword } from '@/lib/password';
import { z } from 'zod';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb'; // Import ObjectId
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { AUTH_TOKEN_NAME } from '@/lib/authCookies';

interface UserDocument {
  _id: ObjectId; // Use ObjectId type
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface JWTPayload extends jose.JWTPayload {
    userId: string;
    email: string;
    name?: string;
}

async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<UserDocument>('users');
}

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const tokenCookie = request.cookies.get(AUTH_TOKEN_NAME);
  if (!tokenCookie?.value) return null;

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set for token verification.');
    return null;
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(tokenCookie.value, secret);
    return (payload as JWTPayload).userId || null;
  } catch (e) {
    console.log('Token verification failed in profile API:', e);
    return null;
  }
}

// GET handler to fetch user profile
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const usersCollection = await getUsersCollection();
    // Use new ObjectId() to convert the string userId from token to ObjectId for MongoDB query
    if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ name: user.name, email: user.email }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT handler to update user profile (name and password)
const updateProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password.",
  path: ["currentPassword"], 
});


export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromToken(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors
      }, { status: 400 });
    }

    const { name, currentPassword, newPassword } = validationResult.data;
    const usersCollection = await getUsersCollection();
    
    if (!ObjectId.isValid(userId)) {
        return NextResponse.json({ message: "Invalid user ID format" }, { status: 400 });
    }
    const userObjectId = new ObjectId(userId);

    const user = await usersCollection.findOne({ _id: userObjectId });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updates: Partial<UserDocument> = {};
    let nameUpdated = false;

    if (name && name !== user.name) {
      updates.name = name;
      nameUpdated = true;
    }

    if (newPassword && currentPassword) {
      const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid current password." }, { status: 400 });
      }
      updates.passwordHash = await hashPassword(newPassword);
    } else if (newPassword && !currentPassword) {
        return NextResponse.json({ message: "Current password is required to set a new password." }, { status: 400 });
    }


    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No changes provided." }, { status: 200 });
    }

    await usersCollection.updateOne({ _id: userObjectId }, { $set: updates });
    
    const responsePayload: { message: string; updatedName?: string } = { message: "Profile updated successfully." };

    if (nameUpdated && updates.name) {
        responsePayload.updatedName = updates.name;
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined for re-issuing token.");
        } else {
            const cookieStore = cookies();
            const tokenPayload = { 
                userId: user._id.toString(), 
                email: user.email,
                name: updates.name 
            };
            const newToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
            
            const cookieOptionsBase = {
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 60 * 60 * 24 * 7, 
                path: '/',
                sameSite: 'lax' as const,
            };

            cookieStore.set(AUTH_TOKEN_NAME, newToken, { ...cookieOptionsBase, httpOnly: true });
            cookieStore.set('userName', updates.name, cookieOptionsBase);
        }
    }

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
