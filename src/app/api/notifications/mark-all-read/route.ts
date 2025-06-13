
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromAuthToken } from '@/lib/authUtilsOnServer';
import type { Notification } from '@/types';
import type { Collection, Db, MongoClient } from 'mongodb';

async function getNotificationsCollection(): Promise<Collection<Notification>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<Notification>('notifications');
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const collection = await getNotificationsCollection();
    const result = await collection.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "Notifications marked as read.", updatedCount: result.modifiedCount }, { status: 200 });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
