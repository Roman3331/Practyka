import { getDb } from "../utils/db";
import { hashSHA256 } from "../utils/hash";
import { User } from "../schemas/schemas";

export const registerUser = async (userData: Omit<User, "createdAt">) => {
  const db = getDb();
  const usersCollection = db.collection<User>("users");

  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password with SHA256
  const hashedPassword = hashSHA256(userData.password);

  // Create user object
  const newUser: User = {
    ...userData,
    password: hashedPassword,
    createdAt: new Date(),
  };

  const result = await usersCollection.insertOne(newUser as any);
  return { id: result.insertedId, ...newUser };
};
