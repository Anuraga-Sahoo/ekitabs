
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import type { Collection, Db, MongoClient, WithId } from 'mongodb';
import type { ExamCategoryDocumentMongo, ExamCategory } from '@/types';

async function getExamCategoriesCollection(): Promise<Collection<ExamCategoryDocumentMongo>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<ExamCategoryDocumentMongo>('exam_categories');
}

export async function GET() {
  try {
    const collection = await getExamCategoriesCollection();
    // Fetch all categories, sort by name ascending for consistent order
    const categoriesFromDb = await collection.find({}).sort({ name: 1 }).toArray();

    const categories: ExamCategory[] = categoriesFromDb.map((doc: WithId<ExamCategoryDocumentMongo>) => ({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
    }));

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error('Error fetching exam categories:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: 'Internal server error', error: errorMessage }, { status: 500 });
  }
}
