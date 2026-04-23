import { Context } from "hono";
import { getUserById, updateUserInfo } from "../services/profile.service";
import { updateProfileSchema } from "../schemas/schemas";

export const getProfileController = async (c: Context) => {
  try {
    const user = c.get("user");
    const profile = await getUserById(user.userId);
    return c.json(profile);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 404);
  }
};

export const updateProfileController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();
    
    const validation = updateProfileSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const updatedProfile = await updateUserInfo(user.userId, validation.data);
    return c.json({ message: "Profile updated successfully", user: updatedProfile });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};
