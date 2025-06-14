
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId, ObjectId } from 'mongodb';
import type { ExamDocumentMongo, Exam } from '@/types';

async function getExamsCollection(): Promise<Collection<ExamDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<ExamDocumentMongo>('exams');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json({ message: 'categoryId query parameter is required' }, { status: 400 });
  }

  try {
    const collection = await getExamsCollection();
    
    // Ensure categoryId is queried as ObjectId if stored as such
    let queryCategoryId: string | ObjectId = categoryId;
    try {
        queryCategoryId = new (await import('mongodb')).ObjectId(categoryId);
    } catch (e) {
        // If categoryId is not a valid ObjectId string, assume it's stored as string
        // This part might need adjustment based on how categoryId is actually stored in 'exams' collection
        console.warn("categoryId might not be an ObjectId, querying as string. Error:", e instanceof Error ? e.message : String(e));
    }

    const examsFromDb = await collection.find({ 
      categoryId: queryCategoryId,
      testType: 'Mock' // Filter specifically for Mock tests
    }).sort({ name: 1 }).toArray();

    const exams: Exam[] = examsFromDb.map((doc: WithId<ExamDocumentMongo>) => ({
      id: doc._id.toString(),
      name: doc.name,
      categoryId: doc.categoryId.toString(), // Ensure categoryId is string
      quizIds: doc.quizIds,
      testType: doc.testType,
      iconUrl: doc.iconUrl,
      description: doc.description,
    }));

    return NextResponse.json({ exams }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exams:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
