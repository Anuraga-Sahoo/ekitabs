
'use server';

import type { StoredQuiz } from '@/types';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient } from 'mongodb';
import { getUserIdFromAuthToken } from './authUtilsOnServer';

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
 * Associates the quiz with the currently logged-in user.
 */
export async function saveGeneratedQuiz(quiz: Omit<StoredQuiz, 'userId'>): Promise<void> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot save quiz.");
    throw new Error("User not authenticated. Failed to save quiz.");
  }

  const quizWithUser: StoredQuiz = { ...quiz, userId };

  try {
    const collection = await getQuizzesCollection();
    await collection.updateOne({ id: quizWithUser.id }, { $set: quizWithUser }, { upsert: true });
    console.log(`Quiz ${quizWithUser.id} for user ${userId} saved to MongoDB.`);
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving quiz to MongoDB:", originalErrorMessage);
    throw new Error(`Failed to save quiz to database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Retrieves a generated quiz by its ID from MongoDB.
 * Ensures the quiz belongs to the currently logged-in user.
 */
export async function getGeneratedQuiz(id: string): Promise<StoredQuiz | null> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot retrieve quiz.");
    // Optionally, you might allow retrieval if no user context is absolutely needed,
    // but for retakes tied to a user, this check is important.
    // For now, let's assume quizzes are user-specific for retrieval for retake purposes.
    return null; 
  }

  try {
    const collection = await getQuizzesCollection();
    // Find quiz by ID AND userId
    const quiz = await collection.findOne({ id: id, userId: userId }, { projection: { _id: 0 } });
    if (quiz) {
        console.log(`Quiz ${id} for user ${userId} retrieved from MongoDB.`);
    } else {
        console.log(`Quiz ${id} for user ${userId} not found or not authorized in MongoDB.`);
    }
    return quiz as StoredQuiz | null;
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving quiz from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to retrieve quiz from database. Original error: ${originalErrorMessage}`);
  }
}
