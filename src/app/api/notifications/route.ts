
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
    return NextResponse.json({ message: "Unauthorized - No user ID found in token" }, { status: 401 });
  }

  try {
    const collection = await getNotificationsCollection();
    // Find notifications for the current user
    // Ensure createdAt and updatedAt are stored as ISODate in MongoDB for correct sorting and parsing
    const notificationsFromDb = await collection
      .find({ userId }) 
      .sort({ createdAt: -1 }) 
      .limit(20) 
      .toArray();

    const unreadCount = await collection.countDocuments({ userId, isRead: false });

    // Ensure _id is stringified and all fields match the Notification type
    // MongoDB Date objects will be serialized to ISO strings by NextResponse.json
    const processedNotifications = notificationsFromDb.map(n => ({
      _id: n._id.toString(),
      userId: n.userId,
      title: n.title,
      contentHTML: n.contentHTML,
      link: n.link, // Will be undefined if not present
      createdAt: n.createdAt, // Expecting ISODate string or Date object
      updatedAt: n.updatedAt, // Expecting ISODate string or Date object
      isRead: n.isRead,
    }));

    return NextResponse.json({ notifications: processedNotifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications from MongoDB:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error while fetching notifications", error: errorMessage }, { status: 500 });
  }
}
