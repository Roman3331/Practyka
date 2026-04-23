import { Hono } from "hono";
import { registerController } from "../controllers/register.controller";
import { loginController } from "../controllers/login.controller";
import { getRolesController } from "../controllers/roles.controller";
import { getProfileController, updateProfileController } from "../controllers/profile.controller";
import { uploadAvatarController } from "../controllers/upload.controller";
import { createSubjectController, getSubjectsController, joinSubjectController, getSubjectDetailController, deleteSubjectController } from "../controllers/subject.controller";
import { createMaterialController, deleteMaterialController, updateMaterialController, uploadMaterialFileController } from "../controllers/material.controller";
import { createAnnouncementController, deleteAnnouncementController, updateAnnouncementController } from "../controllers/announcement.controller";
import { createAssignmentController, deleteAssignmentController, uploadAssignmentFileController, submitWorkController, uploadSubmissionFileController, unsubmitWorkController, updateAssignmentController, gradeSubmissionController, getStudentAssignmentsController } from "../controllers/assignment.controller";
import { sendAssignmentMessageController, updateAssignmentMessageController, deleteAssignmentMessageController, markAssignmentChatAsReadController } from "../controllers/assignmentChat.controller";
import { createTestController, deleteTestController, getTestForStudentController, submitTestController, updateTestController } from "../controllers/test.controller";
import { getUserNotificationsController, markAsReadController, markAllAsReadController } from "../controllers/notification.controller";
import { createScheduleController, getSchedulesController, updateScheduleController, deleteScheduleController, getScheduleByClassController } from "../controllers/schedule.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const apiRoutes = new Hono();

// Auth routes (Public)
apiRoutes.post("/register", registerController);
apiRoutes.post("/login", loginController);
apiRoutes.get("/roles", getRolesController);

// Protected routes (Requires Auth)
apiRoutes.use("/*", (c, next) => {
  if (["/register", "/login", "/roles"].includes(c.req.path.replace("/api/auth", ""))) return next();
  return authMiddleware(c, next);
});

// Profile
apiRoutes.get("/profile", getProfileController);
apiRoutes.patch("/profile", updateProfileController);
apiRoutes.post("/profile/avatar", uploadAvatarController);

// Subjects
apiRoutes.post("/subjects", createSubjectController);
apiRoutes.get("/subjects", getSubjectsController);
apiRoutes.get("/subjects/:id", getSubjectDetailController);
apiRoutes.delete("/subjects/:id", deleteSubjectController);
apiRoutes.post("/subjects/join", joinSubjectController);

// Materials
apiRoutes.post("/subjects/:subjectId/materials", createMaterialController);
apiRoutes.post("/subjects/:subjectId/materials/upload", uploadMaterialFileController);
apiRoutes.patch("/subjects/:subjectId/materials/:materialId", updateMaterialController);
apiRoutes.delete("/subjects/:subjectId/materials/:materialId", deleteMaterialController);

// Announcements
apiRoutes.post("/subjects/:subjectId/announcements", createAnnouncementController);
apiRoutes.patch("/subjects/:subjectId/announcements/:id", updateAnnouncementController);
apiRoutes.delete("/subjects/:subjectId/announcements/:id", deleteAnnouncementController);

// Assignments
apiRoutes.post("/subjects/:subjectId/assignments", createAssignmentController);
apiRoutes.patch("/subjects/:subjectId/assignments/:assignmentId", updateAssignmentController);
apiRoutes.post("/subjects/:subjectId/assignments/:assignmentId/submissions/:submissionId/grade", gradeSubmissionController);
apiRoutes.delete("/subjects/:subjectId/assignments/:assignmentId", deleteAssignmentController);
apiRoutes.post("/subjects/:subjectId/assignments/upload", uploadAssignmentFileController);
apiRoutes.post("/subjects/:subjectId/assignments/:assignmentId/submit", submitWorkController);
apiRoutes.post("/subjects/:subjectId/assignments/:assignmentId/upload-submission", uploadSubmissionFileController);
apiRoutes.delete("/subjects/:subjectId/assignments/:assignmentId/submit", unsubmitWorkController);
apiRoutes.get("/assignments", getStudentAssignmentsController);
apiRoutes.post("/subjects/:subjectId/assignments/:assignmentId/chat", sendAssignmentMessageController);
apiRoutes.put("/subjects/:subjectId/assignments/:assignmentId/chat/:messageId", updateAssignmentMessageController);
apiRoutes.delete("/subjects/:subjectId/assignments/:assignmentId/chat/:messageId", deleteAssignmentMessageController);
apiRoutes.post("/subjects/:subjectId/assignments/:assignmentId/chat/read", markAssignmentChatAsReadController);

// Tests
apiRoutes.post("/subjects/:subjectId/tests", createTestController);
apiRoutes.patch("/subjects/:subjectId/tests/:testId", updateTestController);
apiRoutes.delete("/subjects/:subjectId/tests/:testId", deleteTestController);
apiRoutes.get("/subjects/:subjectId/tests/:testId", getTestForStudentController);
apiRoutes.post("/subjects/:subjectId/tests/:testId/submit", submitTestController);

// Notifications
apiRoutes.get("/notifications", getUserNotificationsController);
apiRoutes.post("/notifications/read-all", markAllAsReadController);
apiRoutes.post("/notifications/:id/read", markAsReadController);

// Schedule
apiRoutes.get("/schedules", getSchedulesController);
apiRoutes.get("/schedules/by-class", getScheduleByClassController);
apiRoutes.post("/schedules", createScheduleController);
apiRoutes.put("/schedules/:id", updateScheduleController);
apiRoutes.delete("/schedules/:id", deleteScheduleController);

export default apiRoutes;
