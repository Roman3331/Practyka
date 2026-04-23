import { getDb } from "../utils/db";
import { Subject, ChatMessage, ChatMessageInput } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";
import { createNotification } from "./notification.service";

export const sendAssignmentMessage = async (
  subjectId: string, 
  assignmentId: string, 
  studentId: string, 
  sender: { userId: string, name: string, role: "teacher" | "student" },
  input: ChatMessageInput
) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const newMessage: ChatMessage = {
    _id: new ObjectId(),
    senderId: new ObjectId(sender.userId),
    senderName: sender.name,
    senderRole: sender.role,
    text: input.text,
    createdAt: new Date(),
  };

  const subject = await subjectsCollection.findOne({ _id: new ObjectId(subjectId) });
  if (!subject) throw new Error("Subject not found");

  const assignment = subject.assignments.find(a => String(a._id) === assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  let submission = assignment.submissions.find(s => String(s.studentId) === studentId);

  if (!submission) {
    submission = {
      _id: new ObjectId(),
      studentId: new ObjectId(studentId),
      studentName: sender.role === 'student' ? sender.name : 'Unknown Student',
      files: [],
      submittedAt: new Date(),
      messages: [newMessage]
    };

    if (sender.role === 'teacher') {
       const usersCollection = db.collection("users");
       const student = await usersCollection.findOne({ _id: new ObjectId(studentId) });
       if (student) {
         submission.studentName = `${student.firstName} ${student.lastName}`;
         (submission as any).studentAvatarUrl = student.avatarUrl;
       }
    }

    await subjectsCollection.updateOne(
      { _id: new ObjectId(subjectId), "assignments._id": new ObjectId(assignmentId) },
      { $push: { "assignments.$.submissions": submission as any } }
    );
  } else {
    await subjectsCollection.updateOne(
      { 
        _id: new ObjectId(subjectId), 
        "assignments._id": new ObjectId(assignmentId)
      },
      { 
        $push: { "assignments.$.submissions.$[sub].messages": newMessage as any } 
      },
      {
        arrayFilters: [{ "sub.studentId": new ObjectId(studentId) }]
      }
    );
  }

  wsManager.broadcast({
    type: 'assignment_chat_message',
    data: {
      subjectId,
      assignmentId,
      studentId,
      message: newMessage
    }
  });

  if (sender.role === 'teacher') {
    await createNotification(
      studentId,
      `Нове повідомлення від вчителя`,
      input.text.slice(0, 50) + (input.text.length > 50 ? '...' : ''),
      'chat_message',
      `/student/courses/${subjectId}?assignmentId=${assignmentId}&tab=chat`
    );
  } else if (sender.role === 'student') {
    const db = getDb();
    const subjectsCollection = db.collection<Subject>("subjects");
    const subject = await subjectsCollection.findOne({ 
      _id: new ObjectId(subjectId),
      "assignments._id": new ObjectId(assignmentId)
    });
    const assignment = subject?.assignments.find((a: any) => String(a._id) === assignmentId);
    if (assignment?.teacherId) {
      await createNotification(
        assignment.teacherId.toString(),
        `Нове повідомлення від ${sender.firstName} ${sender.lastName}`,
        input.text.slice(0, 50) + (input.text.length > 50 ? '...' : ''),
        'chat_message',
        `/teacher/courses/${subjectId}?assignmentId=${assignmentId}&studentId=${studentId}&tab=chat`
      );
    }
  }

  return newMessage;
};

export const updateAssignmentMessage = async (
  subjectId: string,
  assignmentId: string,
  studentId: string,
  messageId: string,
  userId: string,
  newText: string
) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.updateOne(
    { 
      _id: new ObjectId(subjectId), 
      "assignments._id": new ObjectId(assignmentId)
    },
    { 
      $set: { "assignments.$.submissions.$[sub].messages.$[msg].text": newText } 
    },
    {
      arrayFilters: [
        { "sub.studentId": new ObjectId(studentId) },
        { "msg._id": new ObjectId(messageId), "msg.senderId": new ObjectId(userId) }
      ]
    }
  );

  if (result.modifiedCount === 0) throw new Error("Message not found or you are not the author");

  wsManager.broadcast({
    type: 'assignment_chat_message_updated',
    data: { subjectId, assignmentId, studentId, messageId, text: newText }
  });
};

export const deleteAssignmentMessage = async (
  subjectId: string,
  assignmentId: string,
  studentId: string,
  messageId: string,
  userId: string
) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.updateOne(
    { 
      _id: new ObjectId(subjectId), 
      "assignments._id": new ObjectId(assignmentId)
    },
    { 
      $pull: { "assignments.$.submissions.$[sub].messages": { _id: new ObjectId(messageId), senderId: new ObjectId(userId) } as any } 
    },
    {
      arrayFilters: [
        { "sub.studentId": new ObjectId(studentId) }
      ]
    }
  );

  if (result.modifiedCount === 0) throw new Error("Message not found or you are not the author");

  wsManager.broadcast({
    type: 'assignment_chat_message_deleted',
    data: { subjectId, assignmentId, studentId, messageId }
  });
};

export const markAssignmentChatAsRead = async (
  subjectId: string,
  assignmentId: string,
  studentId: string
) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  await subjectsCollection.updateOne(
    { 
      _id: new ObjectId(subjectId), 
      "assignments._id": new ObjectId(assignmentId)
    },
    { 
      $set: { "assignments.$.submissions.$[sub].lastViewedByTeacherAt": new Date() } 
    },
    {
      arrayFilters: [
        { "sub.studentId": new ObjectId(studentId) }
      ]
    }
  );
};
