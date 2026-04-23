import { getDb } from "../utils/db";
import { Notification, Subject } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";

export const createNotification = async (
  userId: string | ObjectId,
  title: string,
  message: string,
  type: Notification['type'],
  link?: string
) => {
  const db = getDb();
  const notificationsCollection = db.collection<Notification>("notifications");

  const newNotification: Notification = {
    userId: new ObjectId(userId),
    title,
    message,
    type,
    link,
    isRead: false,
    createdAt: new Date(),
  };

  const result = await notificationsCollection.insertOne(newNotification as any);
  newNotification._id = result.insertedId;

  // Broadcast to specific user via WebSocket
  wsManager.sendToUser(userId.toString(), {
    type: 'notification',
    data: newNotification
  });

  return newNotification;
};

export const notifyAllStudents = async (
  subjectId: string,
  title: string,
  message: string,
  type: Notification['type'],
  link?: string
) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");
  
  const subject = await subjectsCollection.findOne({ _id: new ObjectId(subjectId) });
  if (!subject) return;

  for (const studentId of subject.studentIds) {
    await createNotification(studentId.toString(), title, message, type, link);
  }
};

export const getUserNotifications = async (userId: string) => {
  const db = getDb();
  const notificationsCollection = db.collection<Notification>("notifications");

  return await notificationsCollection
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
};

export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  const db = getDb();
  const notificationsCollection = db.collection<Notification>("notifications");

  await notificationsCollection.updateOne(
    { _id: new ObjectId(notificationId), userId: new ObjectId(userId) },
    { $set: { isRead: true } }
  );
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const db = getDb();
  const notificationsCollection = db.collection<Notification>("notifications");

  await notificationsCollection.updateMany(
    { userId: new ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
};
