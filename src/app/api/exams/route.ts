
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId, ObjectId as MongoObjectIdType } from 'mongodb';
import type { ExamDocumentMongo, QuizDocumentMongo, ClientQuiz } from '@/types'; // Ensure ClientQuiz is imported

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
  const categoryIdString = searchParams.get('categoryId');
  const { ObjectId } = await import('mongodb');


  if (!categoryIdString) {
    return NextResponse.json({ message: 'categoryId query parameter is required' }, { status: 400 });
  }

  if (!ObjectId.isValid(categoryIdString)) {
    return NextResponse.json({ message: 'Invalid categoryId format' }, { status: 400 });
  }
  const categoryObjectId = new ObjectId(categoryIdString);

  try {
    const examsCollection = await getExamsCollection();
    const quizzesCollection = await getQuizzesCollection();
    
    const examDocs = await examsCollection.find({ categoryId: categoryObjectId }).toArray();

    if (!examDocs || examDocs.length === 0) {
      return NextResponse.json({ quizzes: [] }, { status: 200 });
    }

    const allPublishedMockQuizzes: ClientQuiz[] = [];
    
    for (const examDoc of examDocs) {
      if (examDoc.quizIds && examDoc.quizIds.length > 0) {
        const quizObjectIds = examDoc.quizIds
          .filter(id => ObjectId.isValid(id)) // Ensure IDs are valid before converting
          .map(id => new ObjectId(id));

        if (quizObjectIds.length === 0) {
          continue; 
        }

        const relatedQuizzes = await quizzesCollection.find({
          _id: { $in: quizObjectIds },
          testType: 'Mock', // Filter by testType
          status: 'Published', // Filter by status
        }).toArray();

        relatedQuizzes.forEach((quizDoc: WithId<QuizDocumentMongo>) => {
          allPublishedMockQuizzes.push({
            id: quizDoc._id.toString(),
            title: quizDoc.title,
            iconUrl: examDoc.iconUrl || undefined, // Use icon from parent Exam, or undefined
          });
        });
      }
    }
    
    // Optional: Sort quizzes by title or some other criteria if needed
    allPublishedMockQuizzes.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json({ quizzes: allPublishedMockQuizzes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exams or quizzes:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
