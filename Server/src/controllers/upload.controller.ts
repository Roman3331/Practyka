import { Context } from "hono";
import { updateUserInfo } from "../services/profile.service";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";

export const uploadAvatarController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${user.userId}-${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const avatarUrl = `http://localhost:3100/uploads/${fileName}`;
    
    // Update user in DB
    const updatedUser = await updateUserInfo(user.userId, { avatarUrl });

    return c.json({ 
      message: "Avatar uploaded successfully", 
      avatarUrl,
      user: updatedUser 
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
};
