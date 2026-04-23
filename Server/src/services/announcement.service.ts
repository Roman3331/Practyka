import { getDb } from "../utils/db";
import { Subject, Announcement } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";
import { v4 as uuidv4 } from "uuid";
import { notifyAllStudents } from "./notification.service";

export const addAnnouncement = async (subjectId: string, authorId: string, content: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const announcement: Announcement = {
    _id: uuidv4(),
    content,
    authorId: new ObjectId(authorId),
    createdAt: new Date()
  };

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $push: { announcements: announcement } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Subject not found");

  // Broadcast
  wsManager.broadcast({ 
    type: 'announcement_created',
    data: { subjectId } 
  });

  await notifyAllStudents(
    subjectId,
    `Нове оголошення у ${result.name}`,
    content.slice(0, 50) + (content.length > 50 ? '...' : ''),
    'announcement'
  );

  return announcement;
};

export const deleteAnnouncement = async (subjectId: string, announcementId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  await subjectsCollection.updateOne(
    { _id: new ObjectId(subjectId) },
    { $pull: { announcements: { _id: announcementId } } }
  );
};

export const updateAnnouncement = async (subjectId: string, announcementId: string, content: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  await subjectsCollection.updateOne(
    { 
      _id: new ObjectId(subjectId),
      "announcements._id": announcementId 
    },
    { $set: { "announcements.$.content": content } }
  );
};
