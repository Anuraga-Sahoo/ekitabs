
import { type NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromAuthToken } from '@/lib/authUtilsOnServer';
import type { NotificationDocument } from '@/types';
import type { Collection, Db, MongoClient } from 'mongodb';

async function getNotificationsCollection(): Promise<Collection<NotificationDocument>> {
  const client: MongoClient = await clientPromise;
  const db: Db = client.db();
  return db.collection<NotificationDocument>('notifications');
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromAuthToken();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const collection = await getNotificationsCollection();
    const now = new Date();
    let updatedCount = 0;

    // 1. Update existing unread statuses for the user
    const updateExistingResult = await collection.updateMany(
      { 
        userIds: userId, 
        "readStatus.userId": userId, 
        "readStatus.isRead": false 
      },
      { 
        $set: { 
          "readStatus.$.isRead": true, 
          "readStatus.$.lastStatusUpdate": now,
          "updatedAt": now 
        } 
      }
    );
    updatedCount += updateExistingResult.modifiedCount;

    // 2. Add read status for users who are in userIds but not in readStatus array
    // This marks notifications as read for users encountering them for the first time via "mark all read"
    const addNewStatusResult = await collection.updateMany(
      { 
        userIds: userId, 
        "readStatus.userId": { $ne: userId } 
      },
      { 
        $push: { 
          readStatus: { 
            userId: userId, 
            isRead: true, 
            lastStatusUpdate: now 
          } 
        },
        $set: { "updatedAt": now }
      }
    );
    updatedCount += addNewStatusResult.modifiedCount;


    return NextResponse.json({ message: "Notifications marked as read.", updatedCount: updatedCount }, { status: 200 });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
  }
}
