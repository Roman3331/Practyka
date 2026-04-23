import { Context } from "hono";
import { scheduleSchema } from "../schemas/schemas";
import { createSchedule, getSchedules, updateSchedule, deleteSchedule, getScheduleByClass } from "../services/schedule.service";

export const createScheduleController = async (c: Context) => {
  try {
    const user = c.get("user");
    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can create schedules" }, 403);
    }

    const body = await c.req.json();
    const validation = scheduleSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const schedule = await createSchedule(user.userId, validation.data);
    return c.json(schedule, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getSchedulesController = async (c: Context) => {
  try {
    const schedules = await getSchedules();
    return c.json(schedules);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateScheduleController = async (c: Context) => {
  try {
    const user = c.get("user");
    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can update schedules" }, 403);
    }

    const id = c.req.param("id");
    const body = await c.req.json();
    const validation = scheduleSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const schedule = await updateSchedule(id, validation.data);
    return c.json(schedule);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteScheduleController = async (c: Context) => {
  try {
    const user = c.get("user");
    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can delete schedules" }, 403);
    }

    const id = c.req.param("id");
    await deleteSchedule(id);
    return c.json({ message: "Schedule deleted" });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getScheduleByClassController = async (c: Context) => {
  try {
    const className = c.req.query("className");
    if (!className) return c.json({ error: "Class name is required" }, 400);
    const schedule = await getScheduleByClass(className);
    return c.json(schedule);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
