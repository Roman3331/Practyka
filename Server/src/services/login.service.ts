import { getDb } from "../utils/db";
import { verifySHA256 } from "../utils/hash";
import { User } from "../schemas/schemas";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const loginUser = async (email: string, password: string) => {
  const db = getDb();
  const usersCollection = db.collection<User>("users");

  // Find user by email
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Verify password using SHA256
  const isPasswordValid = verifySHA256(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  const token = jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  };
};
