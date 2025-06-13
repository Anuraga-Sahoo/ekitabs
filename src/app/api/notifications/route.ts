
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromAuthToken } from '@/lib/authUtilsOnServer';
import type { Notification } from '@/types';
import type { Collection, Db, MongoClient, WithId } from 'mongodb';

async function getNotificationsCollection(): Promise<Collection<Notification>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<Notification>('notifications');
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const collection = await getNotificationsCollection();
    const notifications = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20) // Limit to most recent 20 notifications
      .toArray();

    const unreadCount = await collection.countDocuments({ userId, isRead: false });

    // Ensure _id is stringified
    const processedNotifications = notifications.map(n => ({
      ...n,
      _id: n._id.toString(),
    }));

    return NextResponse.json({ notifications: processedNotifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
