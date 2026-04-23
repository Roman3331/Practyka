import { Context } from "hono";
import { chatMessageSchema } from "../schemas/schemas";
import { sendAssignmentMessage, updateAssignmentMessage, deleteAssignmentMessage, markAssignmentChatAsRead } from "../services/assignmentChat.service";

export const sendAssignmentMessageController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const assignmentId = c.req.param("assignmentId");
    const studentId = c.req.query("studentId");
    const user = c.get("user");
    
    const body = await c.req.json();
    const input = chatMessageSchema.parse(body);

    const targetStudentId = user.role === 'student' ? user.userId : studentId;
    if (!targetStudentId) return c.json({ error: "studentId is required for teachers" }, 400);

    const message = await sendAssignmentMessage(
      subjectId,
      assignmentId,
      targetStudentId,
      { userId: user.userId, name: `${user.firstName} ${user.lastName}`, role: user.role },
      input
    );

    return c.json(message);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const updateAssignmentMessageController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const assignmentId = c.req.param("assignmentId");
    const messageId = c.req.param("messageId");
    const studentId = c.req.query("studentId");
    const user = c.get("user");

    const body = await c.req.json();
    const { text } = chatMessageSchema.parse(body);

    const targetStudentId = user.role === 'student' ? user.userId : studentId;
    if (!targetStudentId) return c.json({ error: "studentId is required" }, 400);

    await updateAssignmentMessage(subjectId, assignmentId, targetStudentId, messageId, user.userId, text);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const deleteAssignmentMessageController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const assignmentId = c.req.param("assignmentId");
    const messageId = c.req.param("messageId");
    const studentId = c.req.query("studentId");
    const user = c.get("user");

    const targetStudentId = user.role === 'student' ? user.userId : studentId;
    if (!targetStudentId) return c.json({ error: "studentId is required" }, 400);

    await deleteAssignmentMessage(subjectId, assignmentId, targetStudentId, messageId, user.userId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const markAssignmentChatAsReadController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const assignmentId = c.req.param("assignmentId");
    const studentId = c.req.query("studentId");
    const user = c.get("user");

    if (user.role !== 'teacher') return c.json({ error: "Only teachers can mark as read" }, 403);
    if (!studentId) return c.json({ error: "studentId is required" }, 400);

    await markAssignmentChatAsRead(subjectId, assignmentId, studentId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};
