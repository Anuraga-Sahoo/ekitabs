
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    // Perform a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    return NextResponse.json({ status: "success", message: "Successfully connected to MongoDB!" });
  } catch (error) {
    console.error("MongoDB connection error in /api/health:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: "error", message: "Failed to connect to MongoDB.", error: errorMessage }, { status: 500 });
  }
}
