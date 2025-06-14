
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId } from 'mongodb';
import type { ExamDocumentMongo } from '@/types'; // Using ExamDocumentMongo to get name and _id

// This interface will represent what we send to the client for the dropdown
interface ExamListing {
  id: string;
  name: string;
}

async function getExamsCollection(): Promise<Collection<ExamDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<ExamDocumentMongo>('exams'); // Fetching from 'exams' collection
}

export async function GET() {
  try {
    const collection = await getExamsCollection();
    // Fetch all exams, but only project _id and name for the dropdown
    // Sort by name ascending for consistent order in the dropdown
    const examsFromDb = await collection.find({}, { projection: { _id: 1, name: 1 } }).sort({ name: 1 }).toArray();

    const examListings: ExamListing[] = examsFromDb.map((doc: WithId<ExamDocumentMongo>) => ({
      id: doc._id.toString(),
      name: doc.name,
    }));

    return NextResponse.json({ categories: examListings }, { status: 200 }); // Keep 'categories' key for now to minimize frontend changes immediately
  } catch (error) {
    console.error('Error fetching exam listings:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
