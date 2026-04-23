import { getDb } from "../utils/db";
import { Subject, Material } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";
import { notifyAllStudents } from "./notification.service";

export const addMaterialToSubject = async (subjectId: string, material: Material) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $push: { materials: material } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Subject not found");

  // Broadcast update
  wsManager.broadcast({ 
    type: 'material_updated',
    data: { subjectId } 
  });

  await notifyAllStudents(
    subjectId,
    `Новий матеріал: ${material.name}`,
    `У предметі ${result.name} додано нові матеріали`,
    'material',
    `/student/courses/${subjectId}`
  );

  return result;
};

export const deleteMaterialFromSubject = async (subjectId: string, materialId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $pull: { materials: { _id: materialId } } },
    { returnDocument: "after" }
  );

  return result;
};

export const updateMaterialInSubject = async (subjectId: string, materialId: string, name: string, files: any[]) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "materials._id": materialId 
    },
    { $set: { "materials.$.name": name, "materials.$.files": files } },
    { returnDocument: "after" }
  );

  return result;
};
