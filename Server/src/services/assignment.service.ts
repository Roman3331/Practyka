import { getDb } from "../utils/db";
import { Subject, Assignment, AssignmentInput, Submission, SubmissionInput } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";
import { notifyAllStudents, createNotification } from "./notification.service";

export const createAssignment = async (subjectId: string, teacherId: string, input: AssignmentInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const newAssignment: Assignment = {
    _id: new ObjectId(),
    title: input.title,
    description: input.description,
    files: input.files,
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    maxGrade: input.maxGrade,
    subjectId: new ObjectId(subjectId),
    teacherId: new ObjectId(teacherId),
    submissions: [],
    createdAt: new Date(),
  };

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $push: { assignments: newAssignment as any } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Subject not found");

  // Broadcast update
  wsManager.broadcast({ 
    type: 'assignment_created', 
    data: { subjectId, assignment: newAssignment } 
  });

  await notifyAllStudents(
    subjectId,
    `Нове завдання: ${newAssignment.title}`,
    `У предметі ${result.name} додано нове завдання`,
    'assignment',
    `/student/courses/${subjectId}`
  );

  return newAssignment;
};

export const deleteAssignment = async (subjectId: string, assignmentId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $pull: { assignments: { _id: new ObjectId(assignmentId) } as any } },
    { returnDocument: "after" }
  );

  wsManager.broadcast({ 
    type: 'assignment_deleted', 
    data: { subjectId, assignmentId } 
  });

  return result;
};

export const submitWork = async (subjectId: string, assignmentId: string, studentId: string, studentName: string, studentAvatarUrl: string | undefined, input: SubmissionInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const submission: Submission = {
    _id: new ObjectId(),
    studentId: new ObjectId(studentId),
    studentName,
    studentAvatarUrl,
    files: input.files,
    comment: input.comment,
    submittedAt: new Date(),
  };

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "assignments._id": new ObjectId(assignmentId)
    },
    { $push: { "assignments.$.submissions": submission as any } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Assignment or Subject not found");

  wsManager.broadcast({ 
    type: 'submission_updated', 
    data: { subjectId, assignmentId } 
  });

  return submission;
};

export const unsubmitWork = async (subjectId: string, assignmentId: string, studentId: string, isTeacherAction: boolean = false) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "assignments._id": new ObjectId(assignmentId)
    },
    { 
      $pull: { 
        "assignments.$.submissions": { studentId: new ObjectId(studentId) } 
      } 
    },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Assignment or Subject not found");

  wsManager.broadcast({ 
    type: 'submission_updated', 
    data: { subjectId, assignmentId } 
  });

  if (isTeacherAction) {
    const assignment = result.assignments.find((a: any) => String(a._id) === assignmentId);
    await createNotification(
      studentId,
      `Роботу повернуто: ${assignment?.title}`,
      `Вчитель повернув вашу роботу на доопрацювання`,
      'assignment_returned',
      `/student/courses/${subjectId}`
    );
  }

  return result;
};

export const updateAssignment = async (subjectId: string, assignmentId: string, input: AssignmentInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const updateFields: any = {};
  if (input.title) updateFields["assignments.$.title"] = input.title;
  if (input.description) updateFields["assignments.$.description"] = input.description;
  if (input.files) updateFields["assignments.$.files"] = input.files;
  if (input.deadline) updateFields["assignments.$.deadline"] = new Date(input.deadline);
  if (input.maxGrade !== undefined) updateFields["assignments.$.maxGrade"] = input.maxGrade;

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "assignments._id": new ObjectId(assignmentId)
    },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Assignment not found");

  wsManager.broadcast({ 
    type: 'assignment_updated', 
    data: { subjectId, assignmentId } 
  });

  return result;
};

export const gradeSubmission = async (subjectId: string, assignmentId: string, submissionId: string, grade: number) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "assignments._id": new ObjectId(assignmentId)
    },
    { 
      $set: { 
        "assignments.$.submissions.$[sub].grade": grade 
      } 
    },
    { 
      arrayFilters: [{ "sub._id": new ObjectId(submissionId) }],
      returnDocument: "after" 
    }
  );

  if (!result) throw new Error("Submission not found");

  wsManager.broadcast({ 
    type: 'submission_updated', 
    data: { subjectId, assignmentId } 
  });

  // Notify student about grade
  const assignment = (result.assignments || []).find((a: any) => String(a._id) === assignmentId);
  const submission = assignment?.submissions?.find((s: any) => String(s._id) === submissionId);
  if (submission) {
    await createNotification(
      submission.studentId.toString(),
      `Оцінено: ${assignment.title}`,
      `Ви отримали оцінку ${grade} за завдання`,
      'grade',
      `/student/courses/${subjectId}`
    );
  }

  return result;
};

export const getStudentAssignments = async (studentId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const subjects = await subjectsCollection.find({ 
    studentIds: new ObjectId(studentId) 
  }).toArray();

  const allAssignments: any[] = [];
  subjects.forEach(subject => {
    if (subject.assignments) {
      subject.assignments.forEach(assignment => {
        allAssignments.push({
          ...assignment,
          subjectName: subject.name,
          subjectId: subject._id
        });
      });
    }
  });

  return allAssignments;
};
