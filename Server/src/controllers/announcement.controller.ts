import { Context } from "hono";
import { addAnnouncement, deleteAnnouncement, updateAnnouncement } from "../services/announcement.service";

export const createAnnouncementController = async (c: Context) => {
  try {
    const user = c.get("user");
    const subjectId = c.req.param("subjectId");
    const { content } = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can post announcements" }, 403);
    }

    if (!content) {
      return c.json({ error: "Content is required" }, 400);
    }

    const announcement = await addAnnouncement(subjectId, user.userId, content);
    return c.json(announcement, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteAnnouncementController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, id } = c.req.param();

    if (user.role !== "teacher") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await deleteAnnouncement(subjectId, id);
    return c.json({ message: "Deleted" });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateAnnouncementController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, id } = c.req.param();
    const { content } = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await updateAnnouncement(subjectId, id, content);
    return c.json({ message: "Updated" });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
