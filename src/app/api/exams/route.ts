
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId, ObjectId as MongoObjectIdType } from 'mongodb';
import type { ExamDocumentMongo, QuizDocumentMongo, ClientQuiz } from '@/types';

async function getExamsCollection(): Promise<Collection<ExamDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<ExamDocumentMongo>('exams');
}

async function getQuizzesCollection(): Promise<Collection<QuizDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<QuizDocumentMongo>('quizzes');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const examIdString = searchParams.get('examId'); // Changed from categoryId to examId
  const { ObjectId } = await import('mongodb');

  if (!examIdString) {
    return NextResponse.json({ message: 'examId query parameter is required' }, { status: 400 });
  }

  if (!ObjectId.isValid(examIdString)) {
    return NextResponse.json({ message: 'Invalid examId format' }, { status: 400 });
  }
  const examObjectId = new ObjectId(examIdString);

  try {
    const examsCollection = await getExamsCollection();
    const quizzesCollection = await getQuizzesCollection();
    
    // Fetch the specific exam document using examObjectId
    const examDoc = await examsCollection.findOne({ _id: examObjectId });

    if (!examDoc) {
      // If no exam document found for the given examId
      return NextResponse.json({ message: 'Exam not found for the provided examId' }, { status: 404 });
    }

    const publishedMockQuizzes: ClientQuiz[] = [];
    
    if (examDoc.quizIds && examDoc.quizIds.length > 0) {
      const quizObjectIds = examDoc.quizIds
        .filter(id => ObjectId.isValid(id))
        .map(id => new ObjectId(id));

      if (quizObjectIds.length > 0) {
        const relatedQuizzes = await quizzesCollection.find({
          _id: { $in: quizObjectIds },
          testType: 'Mock', 
          status: 'Published',
        }).toArray();

        relatedQuizzes.forEach((quizDoc: WithId<QuizDocumentMongo>) => {
          publishedMockQuizzes.push({
            id: quizDoc._id.toString(),
            title: quizDoc.title,
            iconUrl: examDoc.iconUrl || undefined, 
          });
        });
      }
    }
    
    publishedMockQuizzes.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({ quizzes: publishedMockQuizzes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quizzes for exam:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
