import { Context } from "hono";
import { assignmentSchema, submissionSchema } from "../schemas/schemas";
import { createAssignment, deleteAssignment, submitWork, unsubmitWork, updateAssignment, gradeSubmission, getStudentAssignments } from "../services/assignment.service";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export const createAssignmentController = async (c: Context) => {
  try {
    const user = c.get("user");
    const subjectId = c.req.param("subjectId");
    const body = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can create assignments" }, 403);
    }

    const validation = assignmentSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const assignment = await createAssignment(subjectId, user.userId, validation.data);
    
    return c.json(assignment, 201);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const deleteAssignmentController = async (c: Context) => {
  try {
    const user = c.get("user");
    const subjectId = c.req.param("subjectId");
    const assignmentId = c.req.param("assignmentId");
    
    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can delete assignments" }, 403);
    }

    await deleteAssignment(subjectId, assignmentId);
    
    return c.json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const uploadAssignmentFileController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can upload assignment files" }, 403);
    }

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "assignments");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `http://localhost:3100/uploads/assignments/${fileName}`;
    
    return c.json({ 
      message: "File uploaded successfully", 
      fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
};

export const submitWorkController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, assignmentId } = c.req.param();
    const body = await c.req.json();

    if (user.role !== "student") {
      return c.json({ error: "Only students can submit assignments" }, 403);
    }

    const validation = submissionSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const submission = await submitWork(subjectId, assignmentId, user.userId, `${user.firstName} ${user.lastName}`, user.avatarUrl, validation.data);
    
    return c.json(submission, 201);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const uploadSubmissionFileController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (user.role !== "student") {
      return c.json({ error: "Only students can upload submissions" }, 403);
    }

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "submissions");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `http://localhost:3100/uploads/submissions/${fileName}`;
    
    return c.json({ 
      message: "File uploaded successfully", 
      fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
};

export const unsubmitWorkController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, assignmentId } = c.req.param();
    const studentIdToUnsubmit = c.req.query("studentId");

    let targetStudentId = user.userId;

    if (user.role === "teacher") {
      if (!studentIdToUnsubmit) {
        return c.json({ error: "Student ID is required for teachers" }, 400);
      }
      targetStudentId = studentIdToUnsubmit;
    }

    await unsubmitWork(subjectId, assignmentId, targetStudentId, user.role === "teacher");
    
    return c.json({ message: "Assignment unsubmitted successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const updateAssignmentController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, assignmentId } = c.req.param();
    const body = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can edit assignments" }, 403);
    }

    const validation = assignmentSchema.safeParse(body);
    if (!validation.success) {
      return c.json({ error: validation.error.format() }, 400);
    }

    const assignment = await updateAssignment(subjectId, assignmentId, validation.data);
    
    return c.json(assignment, 200);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const gradeSubmissionController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, assignmentId, submissionId } = c.req.param();
    const { grade } = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can grade submissions" }, 403);
    }

    if (grade === undefined) {
      return c.json({ error: "Grade is required" }, 400);
    }

    await gradeSubmission(subjectId, assignmentId, submissionId, Number(grade));
    
    return c.json({ message: "Graded successfully" });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};

export const getStudentAssignmentsController = async (c: Context) => {
  try {
    const user = c.get("user");
    if (user.role !== "student") {
      return c.json({ error: "Only students can view their assignments" }, 403);
    }
    const assignments = await getStudentAssignments(user.userId);
    return c.json(assignments);
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 400);
  }
};
