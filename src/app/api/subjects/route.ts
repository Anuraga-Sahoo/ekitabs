
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId } from 'mongodb';
import type { SubjectDocumentMongo, Subject } from '@/types'; // Ensure Subject types are imported

async function getSubjectsCollection(): Promise<Collection<SubjectDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db(); // Use your actual DB name if it's not the default in MONGODB_URI
  return db.collection<SubjectDocumentMongo>('subjects');
}

export async function GET() {
  try {
    const collection = await getSubjectsCollection();
    // Fetch all subjects, sort by name ascending for consistent order
    const subjectsFromDb = await collection.find({}).sort({ name: 1 }).toArray();

    const subjects: Subject[] = subjectsFromDb.map((doc: WithId<SubjectDocumentMongo>) => ({
      id: doc._id.toString(),
      name: doc.name,
      imgUrl: doc.imgUrl,
    }));

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
