import { Context } from "hono";
import { subjectSchema } from "../schemas/schemas";
import { createSubject, getTeacherSubjects, joinSubject, getStudentSubjects, deleteSubject, getSubjectById } from "../services/subject.service";
import { wsManager } from "../utils/ws";

export const createSubjectController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.json();

    const validation = subjectSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const subject = await createSubject(user.userId, validation.data);
    
    // Broadcast creation
    wsManager.broadcast({ type: 'subject_created', data: subject });
    
    return c.json(subject, 201);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const getSubjectsController = async (c: Context) => {
  try {
    const user = c.get("user");
    let subjects;
    
    if (user.role === "teacher") {
      subjects = await getTeacherSubjects(user.userId);
    } else {
      subjects = await getStudentSubjects(user.userId);
    }
    
    return c.json(subjects);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const joinSubjectController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { joinCode } = await c.req.json();

    if (!joinCode) {
      return c.json({ error: "Join code is required" }, 400);
    }

    const subject = await joinSubject(user.userId, joinCode);
    
    // Broadcast join
    wsManager.broadcast({ 
      type: 'student_joined', 
      data: { subjectId: subject._id!.toString(), studentId: user.userId } 
    });

    return c.json({ message: "Joined successfully", subject });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const getSubjectDetailController = async (c: Context) => {
  try {
    const id = c.req.param("id");
    const subject = await getSubjectById(id);
    return c.json(subject);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 404);
  }
};

export const deleteSubjectController = async (c: Context) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    
    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can delete subjects" }, 403);
    }

    await deleteSubject(id, user.userId);
    
    // Broadcast deletion
    wsManager.broadcast({ type: 'subject_deleted', data: { id } });

    return c.json({ message: "Subject deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};
