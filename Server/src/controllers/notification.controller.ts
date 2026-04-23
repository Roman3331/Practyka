import { Context } from "hono";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../services/notification.service";

export const getUserNotificationsController = async (c: Context) => {
  try {
    const user = c.get("user");
    const notifications = await getUserNotifications(user.userId);
    return c.json(notifications);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const markAsReadController = async (c: Context) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    await markNotificationAsRead(id, user.userId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const markAllAsReadController = async (c: Context) => {
  try {
    const user = c.get("user");
    await markAllNotificationsAsRead(user.userId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
