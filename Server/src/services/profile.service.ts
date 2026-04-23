import { getDb } from "../utils/db";
import { User, UpdateProfileInput } from "../schemas/schemas";
import { ObjectId } from "mongodb";

export const getUserById = async (userId: string) => {
  const db = getDb();
  const usersCollection = db.collection<User>("users");

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserInfo = async (userId: string, updateData: UpdateProfileInput) => {
  const db = getDb();
  const usersCollection = db.collection<User>("users");

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateData },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new Error("User not found or update failed");
  }

  const { password, ...userWithoutPassword } = result as any;
  return userWithoutPassword;
};
