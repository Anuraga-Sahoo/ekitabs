
'use server';

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
  try {
    const collection = await getQuizzesCollection();
    await collection.updateOne({ id: quiz.id }, { $set: quiz }, { upsert: true });
    console.log(`Quiz ${quiz.id} saved to MongoDB.`);
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving quiz to MongoDB:", originalErrorMessage); // Check server console for this detailed log
    throw new Error(`Failed to save quiz to database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Retrieves a generated quiz by its ID from MongoDB.
 */
export async function getGeneratedQuiz(id: string): Promise<StoredQuiz | null> {
  try {
    const collection = await getQuizzesCollection();
    const quiz = await collection.findOne({ id: id }, { projection: { _id: 0 } });
    if (quiz) {
        console.log(`Quiz ${id} retrieved from MongoDB.`);
    } else {
        console.log(`Quiz ${id} not found in MongoDB.`);
    }
    return quiz as StoredQuiz | null;
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving quiz from MongoDB:", originalErrorMessage); // Check server console for this detailed log
    throw new Error(`Failed to retrieve quiz from database. Original error: ${originalErrorMessage}`);
  }
}
