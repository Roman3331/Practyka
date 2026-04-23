import { Context } from "hono";
import { getAvailableRoles } from "../services/roles.service";

export const getRolesController = async (c: Context) => {
  const roles = getAvailableRoles();
  return c.json({ roles });
};
