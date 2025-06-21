
'use server';

import type { TestResultItem } from '@/types';
import clientPromise from '@/lib/mongodb';
import { Collection, Db, MongoClient } from 'mongodb';
import { getUserIdFromAuthToken } from './authUtilsOnServer';

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
 * Saves a new test result to MongoDB, associated with the current user.
 */
export async function saveTestResult(result: Omit<TestResultItem, 'userId'>): Promise<void> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot save test result.");
    throw new Error("User not authenticated. Failed to save test result.");
  }
  
  const resultWithUser: TestResultItem = { ...result, userId };

  try {
    const collection = await getTestHistoryCollection();
    await collection.insertOne(resultWithUser);
    console.log(`Test result ${resultWithUser.testAttemptId} for user ${userId} saved to MongoDB.`);
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error saving test result to MongoDB:", originalErrorMessage);
    throw new Error(`Failed to save test result to database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Updates an existing test result in MongoDB for the current user.
 */
export async function updateTestResult(testAttemptId: string, updatedData: Omit<TestResultItem, 'userId' | 'testAttemptId'>): Promise<void> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot update test result.");
    throw new Error("User not authenticated. Failed to update test result.");
  }

  const payloadToSet: Partial<TestResultItem> = { ...updatedData, userId };
  // @ts-ignore
  delete payloadToSet._id; // Prevent trying to set MongoDB's _id
  // @ts-ignore
  delete payloadToSet.testAttemptId; // testAttemptId is used in query, not $set

  try {
    const collection = await getTestHistoryCollection();
    const result = await collection.updateOne(
      { testAttemptId: testAttemptId, userId: userId }, // Ensure update is for the correct user
      { $set: payloadToSet }
    );

    if (result.matchedCount === 0) {
      console.warn(`Test result ${testAttemptId} for user ${userId} not found for update in MongoDB.`);
      throw new Error(`Test history entry with ID ${testAttemptId} not found for your account. Could not update.`);
    }
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      console.log(`Test result ${testAttemptId} for user ${userId} was matched but no fields were different, so no update was performed.`);
    } else {
      console.log(`Test result ${testAttemptId} for user ${userId} updated in MongoDB.`);
    }
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error updating test result ${testAttemptId} in MongoDB:`, originalErrorMessage);
    if (error instanceof Error && error.message.startsWith("Test history entry with ID")) {
        throw error; 
    }
    throw new Error(`Failed to update test result in database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Retrieves a single test result by its attempt ID for the current user.
 */
export async function getTestResult(testAttemptId: string): Promise<TestResultItem | null> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.log("User not authenticated. Cannot get test result.");
    return null;
  }

  try {
    const collection = await getTestHistoryCollection();
    // Ensure we only return the test if it belongs to the authenticated user
    const result = await collection.findOne(
      { userId, testAttemptId },
      { projection: { _id: 0 } }
    );
    
    if (result) {
      console.log(`Retrieved test result ${testAttemptId} for user ${userId} from MongoDB.`);
    } else {
      console.log(`Test result ${testAttemptId} for user ${userId} not found in MongoDB.`);
    }
    
    return result as TestResultItem | null;
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error retrieving test result ${testAttemptId} from MongoDB:`, originalErrorMessage);
    throw new Error(`Failed to retrieve test result from database. Original error: ${originalErrorMessage}`);
  }
}


/**
 * Retrieves test history for the current user from MongoDB, sorted by date completed descending.
 */
export async function getTestHistory(): Promise<TestResultItem[]> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.log("User not authenticated. Returning empty test history.");
    return []; // Or throw error, depending on desired behavior for unauthenticated access
  }

  try {
    const collection = await getTestHistoryCollection();
    const history = await collection
      .find({ userId: userId }, { projection: { _id: 0 } }) 
      .sort({ dateCompleted: -1 }) 
      .toArray();
    console.log(`Retrieved ${history.length} test history items for user ${userId} from MongoDB.`);
    return history as TestResultItem[];
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error retrieving test history from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to retrieve test history from database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Deletes a specific test result by its testAttemptId from MongoDB for the current user.
 */
export async function deleteTestResult(testAttemptId: string): Promise<void> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot delete test result.");
    throw new Error("User not authenticated. Failed to delete test result.");
  }

  try {
    const collection = await getTestHistoryCollection();
    const result = await collection.deleteOne({ testAttemptId: testAttemptId, userId: userId });
    if (result.deletedCount === 1) {
      console.log(`Test result ${testAttemptId} for user ${userId} deleted from MongoDB.`);
    } else {
      console.warn(`Test result ${testAttemptId} for user ${userId} not found for deletion in MongoDB.`);
    }
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error deleting test result from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to delete test result from database. Original error: ${originalErrorMessage}`);
  }
}

/**
 * Clears all test history from MongoDB for the current user.
 */
export async function clearTestHistory(): Promise<void> {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    console.error("User not authenticated. Cannot clear test history.");
    throw new Error("User not authenticated. Failed to clear test history.");
  }

  try {
    const collection = await getTestHistoryCollection();
    await collection.deleteMany({ userId: userId });
    console.log(`All test history cleared for user ${userId} from MongoDB.`);
  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error clearing test history from MongoDB:", originalErrorMessage);
    throw new Error(`Failed to clear test history from database. Original error: ${originalErrorMessage}`);
  }
}
