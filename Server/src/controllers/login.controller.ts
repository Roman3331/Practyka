import { Context } from "hono";
import { loginUser } from "../services/login.service";
import { loginSchema } from "../schemas/schemas";

export const loginController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const { email, password } = validation.data;
    const result = await loginUser(email, password);

    return c.json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 401);
  }
};
