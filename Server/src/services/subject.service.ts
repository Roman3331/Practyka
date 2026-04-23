import { getDb } from "../utils/db";
import { Subject, SubjectInput } from "../schemas/schemas";
import { ObjectId } from "mongodb";

// Helper to generate 8-character join code
const generateJoinCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const createSubject = async (teacherId: string, input: SubjectInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const newSubject: Subject = {
    name: input.name,
    description: input.description,
    joinCode: generateJoinCode(),
    teacherId: new ObjectId(teacherId),
    studentIds: [],
    createdAt: new Date(),
  };

  const result = await subjectsCollection.insertOne(newSubject as any);
  return { id: result.insertedId, ...newSubject };
};

export const getTeacherSubjects = async (teacherId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  return await subjectsCollection.find({ teacherId: new ObjectId(teacherId) }).toArray();
};

export const joinSubject = async (studentId: string, joinCode: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const subject = await subjectsCollection.findOne({ joinCode: joinCode.toUpperCase() });
  if (!subject) {
    throw new Error("Invalid join code");
  }

  // Check if student already joined
  const sId = new ObjectId(studentId);
  if (subject.studentIds.some(id => id.equals(sId))) {
    throw new Error("You have already joined this subject");
  }

  await subjectsCollection.updateOne(
    { _id: subject._id },
    { $push: { studentIds: sId } }
  );

  return subject;
};

export const getStudentSubjects = async (studentId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  return await subjectsCollection.find({ studentIds: new ObjectId(studentId) }).toArray();
};

export const getSubjectById = async (subjectId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const results = await subjectsCollection.aggregate([
    { $match: { _id: new ObjectId(subjectId) } },
    {
      $lookup: {
        from: "users",
        localField: "studentIds",
        foreignField: "_id",
        as: "students"
      }
    },
    {
      $project: {
        "students.password": 0,
        "students.email": 0,
        "students.role": 0,
        "students.createdAt": 0
      }
    }
  ]).toArray();

  const subject = results[0];
  if (!subject) throw new Error("Subject not found");
  
  return subject;
};

export const deleteSubject = async (subjectId: string, teacherId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.deleteOne({ 
    _id: new ObjectId(subjectId),
    teacherId: new ObjectId(teacherId) 
  });

  if (result.deletedCount === 0) {
    throw new Error("Subject not found or you don't have permission to delete it");
  }

  return true;
};
