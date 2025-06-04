
'use server';

import type { TestResultItem } from '@/types';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient } from 'mongodb';

const TEST_HISTORY_COLLECTION = 'test_history';

async function getDb(): Promise<Db> {
  const client: MongoClient = await clientPromise;
  return client.db();
}

async function getTestHistoryCollection(): Promise<Collection<TestResultItem>> {
  const db = await getDb();
  return db.collection<TestResultItem>(TEST_HISTORY_COLLECTION);
}

/**
 * Saves a test result to MongoDB.
 */
export async function saveTestResult(result: TestResultItem): Promise<void> {
  try {
    const collection = await getTestHistoryCollection();
    await collection.insertOne(result);
    console.log(`Test result ${result.testAttemptId} saved to MongoDB.`);
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving test result to MongoDB:", originalErrorMessage);
    throw new Error(`Failed to save test result to database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Retrieves all test history from MongoDB, sorted by date completed descending.
 */
export async function getTestHistory(): Promise<TestResultItem[]> {
  try {
    const collection = await getTestHistoryCollection();
    const history = await collection
      .find({}, { projection: { _id: 0 } }) // Exclude MongoDB's _id field
      .sort({ dateCompleted: -1 }) // Sort by dateCompleted descending
      .toArray();
    console.log(`Retrieved ${history.length} test history items from MongoDB.`);
    return history as TestResultItem[];
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving test history from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to retrieve test history from database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Deletes a specific test result by its testAttemptId from MongoDB.
 */
export async function deleteTestResult(testAttemptId: string): Promise<void> {
  try {
    const collection = await getTestHistoryCollection();
    const result = await collection.deleteOne({ testAttemptId: testAttemptId });
    if (result.deletedCount === 1) {
      console.log(`Test result ${testAttemptId} deleted from MongoDB.`);
    } else {
      console.warn(`Test result ${testAttemptId} not found for deletion in MongoDB.`);
    }
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error deleting test result from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to delete test result from database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Clears all test history from MongoDB.
 * USE WITH CAUTION.
 */
export async function clearTestHistory(): Promise<void> {
  try {
    const collection = await getTestHistoryCollection();
    await collection.deleteMany({});
    console.log("All test history cleared from MongoDB.");
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error clearing test history from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to clear test history from database. Original error: ${originalErrorMessage}`);
  }
}
