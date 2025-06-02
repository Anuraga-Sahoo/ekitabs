
import type { StoredQuiz } from '@/types';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient } from 'mongodb';

const QUIZZES_COLLECTION = 'quizzes';

async function getDb(): Promise<Db> {
  const client: MongoClient = await clientPromise;
  return client.db();
}

async function getQuizzesCollection(): Promise<Collection<StoredQuiz>> {
  const db = await getDb();
  return db.collection<StoredQuiz>(QUIZZES_COLLECTION);
}

/**
 * Saves a generated quiz (questions, type, config) to MongoDB.
 */
export async function saveGeneratedQuiz(quiz: StoredQuiz): Promise<void> {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    // This function should primarily be used server-side or in API routes.
    // Allowing client-side for now during transition, but ideally this moves fully server-side.
    console.warn("saveGeneratedQuiz called from client-side. This should ideally be a server operation.");
  }
  try {
    const collection = await getQuizzesCollection();
    // Using upsert to prevent duplicates if the same ID is somehow generated and saved again,
    // or if we decide to update quizzes later.
    await collection.updateOne({ id: quiz.id }, { $set: quiz }, { upsert: true });
    console.log(`Quiz ${quiz.id} saved to MongoDB.`);
  } catch (error) {
    console.error("Error saving quiz to MongoDB:", error);
    // Re-throw the error if you want calling functions to handle it
    throw new Error("Failed to save quiz to database.");
  }
}

/**
 * Retrieves a generated quiz by its ID from MongoDB.
 */
export async function getGeneratedQuiz(id: string): Promise<StoredQuiz | null> {
   if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    console.warn("getGeneratedQuiz called from client-side. This should ideally be a server operation.");
  }
  try {
    const collection = await getQuizzesCollection();
    // MongoDB's _id is an ObjectId. We are querying by our custom 'id' field.
    // Need to exclude _id from the result if StoredQuiz type doesn't include it,
    // or transform _id.toString() if it's part of the type.
    // For now, assuming StoredQuiz does not have _id.
    const quiz = await collection.findOne({ id: id }, { projection: { _id: 0 } });
    if (quiz) {
        console.log(`Quiz ${id} retrieved from MongoDB.`);
    } else {
        console.log(`Quiz ${id} not found in MongoDB.`);
    }
    return quiz as StoredQuiz | null; // Cast because projection might alter type slightly for TS
  } catch (error) {
    console.error("Error retrieving quiz from MongoDB:", error);
    throw new Error("Failed to retrieve quiz from database.");
  }
}

/**
 * Generates a unique ID for a new quiz.
 */
export function generateQuizId(testType: 'mock' | 'practice', subject?: string, chapter?: string): string {
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  if (testType === 'mock') {
    return `mock-${Date.now()}-${randomSuffix}`;
  }
  const safeSubject = subject?.replace(/\s+/g, '-') || 'custom';
  const safeChapter = chapter?.replace(/\s+/g, '-') || 'topic';
  return `practice-${safeSubject}-${safeChapter}-${Date.now()}-${randomSuffix}`;
}
