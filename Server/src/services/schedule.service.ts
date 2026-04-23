import { getDb } from "../utils/db";
import { Schedule, ScheduleInput } from "../schemas/schemas";
import { ObjectId } from "mongodb";

export const createSchedule = async (teacherId: string, input: ScheduleInput) => {
  const db = getDb();
  const schedulesCollection = db.collection<Schedule>("schedules");

  const newSchedule: Schedule = {
    ...input,
    createdBy: new ObjectId(teacherId),
    createdAt: new Date(),
  };

  const result = await schedulesCollection.insertOne(newSchedule);
  return { ...newSchedule, _id: result.insertedId };
};

export const getSchedules = async () => {
  const db = getDb();
  const schedulesCollection = db.collection<Schedule>("schedules");
  return await schedulesCollection.find().sort({ createdAt: -1 }).toArray();
};

export const getScheduleByClass = async (className: string) => {
  const db = getDb();
  const schedulesCollection = db.collection<Schedule>("schedules");
  return await schedulesCollection.findOne({ targetClass: className });
};

export const updateSchedule = async (id: string, input: ScheduleInput) => {
  const db = getDb();
  const schedulesCollection = db.collection<Schedule>("schedules");

  const result = await schedulesCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...input } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Schedule not found");
  return result;
};

export const deleteSchedule = async (id: string) => {
  const db = getDb();
  const schedulesCollection = db.collection<Schedule>("schedules");
  const result = await schedulesCollection.deleteOne({ _id: new ObjectId(id) });
  if (result.deletedCount === 0) throw new Error("Schedule not found");
  return true;
};
