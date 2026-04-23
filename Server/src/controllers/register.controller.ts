import { Context } from "hono";
import { registerUser } from "../services/register.service";
import { registerSchema } from "../schemas/schemas";

export const registerController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const result = await registerUser(validation.data);

    return c.json({ message: "User registered successfully", userId: result.id }, 201);
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};
