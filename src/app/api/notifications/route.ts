
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromAuthToken } from '@/lib/authUtilsOnServer';
import type { NotificationDocument, ClientNotification } from '@/types';
import type { Collection, Db, MongoClient, WithId } from 'mongodb';

async function getNotificationsCollection(): Promise<Collection<NotificationDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<NotificationDocument>('notifications');
}

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized - No user ID found in token" }, { status: 401 });
  }

  try {
    const collection = await getNotificationsCollection();
    
    // Find notifications where the current user's ID is in the userIds array
    const notificationsFromDb = await collection
      .find({ userIds: userId }) 
      .sort({ createdAt: -1 }) 
      .limit(20) 
      .toArray();

    let unreadCount = 0;
    const processedNotifications: ClientNotification[] = notificationsFromDb.map(doc => {
      const userReadEntry = doc.readStatus?.find(rs => rs.userId === userId);
      const isReadForCurrentUser = userReadEntry ? userReadEntry.isRead : false;

      if (!isReadForCurrentUser) {
        unreadCount++;
      }

      return {
        _id: doc._id.toString(),
        title: doc.title,
        contentHTML: doc.contentHTML,
        link: doc.link,
        createdAt: doc.createdAt.toISOString(), // Use main notification's createdAt
        isRead: isReadForCurrentUser,
      };
    });

    return NextResponse.json({ notifications: processedNotifications, unreadCount }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications from MongoDB:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error while fetching notifications", error: errorMessage }, { status: 500 });
  }
}
