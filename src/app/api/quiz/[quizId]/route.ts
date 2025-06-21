
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient, ObjectId } from 'mongodb';
import type { QuizDocumentMongo } from '@/types';

async function getQuizzesCollection(): Promise<Collection<QuizDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<QuizDocumentMongo>('quizzes');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  const { quizId } = params;

  if (!quizId || !ObjectId.isValid(quizId)) {
    return NextResponse.json({ message: 'Invalid or missing quiz ID' }, { status: 400 });
  }

  try {
    const collection = await getQuizzesCollection();
    const quizObjectId = new ObjectId(quizId);
    
    // We only want published mock tests to be accessible via this public endpoint
    const quiz = await collection.findOne({ 
      _id: quizObjectId,
      status: 'Published', // Ensure only published tests can be taken
      testType: 'Mock'
    });

    if (!quiz) {
      return NextResponse.json({ message: 'Published mock test not found' }, { status: 404 });
    }

    // Convert ObjectId to string for client-side consumption
    const quizWithStrId = {
      ...quiz,
      _id: quiz._id.toString(),
    };

    return NextResponse.json(quizWithStrId, { status: 200 });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
