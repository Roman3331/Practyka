import { ObjectId } from "mongodb";
import { z } from "zod";

export const submissionFileSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, "FirstName is required"),
  lastName: z.string().min(1, "LastName is required"),
  middleName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["teacher", "student"]),
  avatarUrl: z.string().optional(),
});

export const materialSchema = z.object({
  _id: z.string(),
  name: z.string(),
  files: z.array(submissionFileSchema),
  uploadedAt: z.date(),
});

export type Material = z.infer<typeof materialSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  middleName: z.string().optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().optional(),
});

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  description: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SubjectInput = z.infer<typeof subjectSchema>;


export const submissionSchema = z.object({
  files: z.array(submissionFileSchema).min(1, "At least one file is required"),
  comment: z.string().optional(),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export const chatMessageSchema = z.object({
  text: z.string().min(1),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const assignmentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  files: z.array(submissionFileSchema).optional(),
  deadline: z.string().optional(), // ISO string from frontend
  maxGrade: z.number().optional(),
});

export type AssignmentInput = z.infer<typeof assignmentSchema>;

export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
});

export const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  options: z.array(optionSchema).min(2),
  correctOptionId: z.string(),
});

export const testSchema = z.object({
  title: z.string().min(1),
  attemptsAllowed: z.number().min(1),
  maxGrade: z.number().min(1),
  questionsToShow: z.number().min(1),
  timeLimit: z.number().optional(),
  deadline: z.string().optional(),
  questions: z.array(questionSchema).min(1),
});

export const lessonSchema = z.object({
  id: z.string(),
  time: z.string(),
  subjectName: z.string(),
  teacherName: z.string(),
  room: z.string().optional(),
});

export const scheduleDaySchema = z.object({
  day: z.string(),
  lessons: z.array(lessonSchema),
});

export const scheduleSchema = z.object({
  targetClass: z.string().min(1, "Class name is required"),
  semesterName: z.string().min(1, "Semester name is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.array(scheduleDaySchema),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

export type TestInput = z.infer<typeof testSchema>;

export interface User extends RegisterInput {
  _id?: ObjectId;
  createdAt: Date;
}

export interface Subject {
  _id?: ObjectId;
  name: string;
  description?: string;
  joinCode: string;
  teacherId: ObjectId;
  studentIds: ObjectId[];
  materials: Material[];
  announcements: Announcement[];
  assignments: Assignment[];
  tests: Test[];
  createdAt: Date;
}

// Material interface is now handled by materialSchema z.infer

export interface Announcement {
  _id: string;
  content: string;
  authorId: ObjectId;
  createdAt: Date;
}

export interface Assignment {
  _id?: ObjectId;
  title?: string;
  description?: string;
  files?: SubmissionFile[];
  deadline?: Date;
  maxGrade?: number;
  subjectId: ObjectId;
  teacherId: ObjectId;
  submissions: Submission[];
  createdAt: Date;
}

export interface Schedule {
  _id?: ObjectId;
  targetClass: string;
  semesterName: string;
  startDate?: string;
  endDate?: string;
  days: {
    day: string;
    lessons: {
      id: string;
      time: string;
      subjectName: string;
      teacherName: string;
      room?: string;
    }[];
  }[];
  createdBy: ObjectId;
  createdAt: Date;
}

export interface Submission {
  _id: ObjectId;
  studentId: ObjectId;
  studentName: string;
  studentAvatarUrl?: string;
  files: SubmissionFile[];
  submittedAt: Date;
  comment?: string;
  grade?: number;
  messages?: ChatMessage[];
  lastViewedByTeacherAt?: Date;
}

export interface ChatMessage {
  _id: ObjectId;
  senderId: ObjectId;
  senderName: string;
  senderRole: "teacher" | "student";
  text: string;
  createdAt: Date;
}

export interface SubmissionFile {
  url: string;
  name: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

export interface Test {
  _id: ObjectId;
  title: string;
  attemptsAllowed: number;
  maxGrade: number;
  questionsToShow: number;
  timeLimit?: number;
  deadline?: string;
  questions: Question[];
  results: TestResult[];
  createdAt: Date;
}

export interface TestResult {
  _id: ObjectId;
  studentId: ObjectId;
  studentName: string;
  score: number;
  maxScore: number;
  attemptNumber: number;
  submittedAt: Date;
}

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: 'announcement' | 'assignment' | 'test' | 'material' | 'grade' | 'assignment_returned' | 'chat_message';
  link?: string;
  isRead: boolean;
  createdAt: Date;
}
