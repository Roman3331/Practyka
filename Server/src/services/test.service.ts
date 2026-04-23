import { getDb } from "../utils/db";
import { Subject, Test, TestInput, TestResult, Question } from "../schemas/schemas";
import { ObjectId } from "mongodb";
import { wsManager } from "../utils/ws";
import { notifyAllStudents } from "./notification.service";

export const createTest = async (subjectId: string, teacherId: string, input: TestInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const newTest: Test = {
    _id: new ObjectId(),
    title: input.title,
    attemptsAllowed: input.attemptsAllowed,
    maxGrade: input.maxGrade,
    questionsToShow: input.questionsToShow,
    timeLimit: input.timeLimit,
    deadline: input.deadline,
    questions: input.questions,
    results: [],
    createdAt: new Date(),
  };

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $push: { tests: newTest as any } },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Subject not found");

  wsManager.broadcast({ 
    type: 'test_created', 
    data: { subjectId, test: newTest } 
  });

  await notifyAllStudents(
    subjectId,
    `Новий тест: ${newTest.title}`,
    `У предметі ${result.name} додано новий тест`,
    'test',
    `/student/courses/${subjectId}`
  );

  return newTest;
};

export const updateTest = async (subjectId: string, testId: string, input: TestInput) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const updateFields: any = {
    "tests.$.title": input.title,
    "tests.$.attemptsAllowed": input.attemptsAllowed,
    "tests.$.maxGrade": input.maxGrade,
    "tests.$.questionsToShow": input.questionsToShow,
    "tests.$.timeLimit": input.timeLimit,
    "tests.$.deadline": input.deadline,
    "tests.$.questions": input.questions,
  };

  const result = await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "tests._id": new ObjectId(testId)
    },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!result) throw new Error("Test or Subject not found");

  const updatedTest = result.tests.find(t => t._id.toString() === testId);

  wsManager.broadcast({ 
    type: 'test_updated', 
    data: { subjectId, test: updatedTest } 
  });

  return updatedTest;
};

export const deleteTest = async (subjectId: string, testId: string) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");

  const result = await subjectsCollection.findOneAndUpdate(
    { _id: new ObjectId(subjectId) },
    { $pull: { tests: { _id: new ObjectId(testId) } as any } },
    { returnDocument: "after" }
  );

  wsManager.broadcast({ 
    type: 'test_deleted', 
    data: { subjectId, testId } 
  });

  return result;
};

export const getTestForStudent = async (subjectId: string, testId: string, studentId: string) => {
  const db = getDb();
  const subject = await db.collection<Subject>("subjects").findOne({ _id: new ObjectId(subjectId) });
  if (!subject) throw new Error("Subject not found");

  const test = subject.tests.find(t => t._id.toString() === testId);
  if (!test) throw new Error("Test not found");

  // Check deadline
  if (test.deadline && new Date(test.deadline) < new Date()) {
    throw new Error("Test deadline has passed");
  }

  // Check attempts
  const studentResults = test.results.filter(r => r.studentId.toString() === studentId);
  if (studentResults.length >= test.attemptsAllowed) {
    throw new Error("Maximum attempts reached");
  }

  // Pick random questions
  const shuffledQuestions = [...test.questions].sort(() => Math.random() - 0.5);
  const selectedQuestions = shuffledQuestions.slice(0, test.questionsToShow);

  // For each selected question, shuffle options and remove correctOptionId
  const questionsForStudent = selectedQuestions.map(q => ({
    id: q.id,
    text: q.text,
    options: [...q.options].sort(() => Math.random() - 0.5)
  }));

  return {
    test: {
      _id: test._id,
      title: test.title,
      attemptsAllowed: test.attemptsAllowed,
      maxGrade: test.maxGrade,
      questionsToShow: test.questionsToShow,
      timeLimit: test.timeLimit,
      deadline: test.deadline,
      questions: questionsForStudent,
      attemptNumber: studentResults.length + 1
    }
  };
};

export const submitTest = async (subjectId: string, testId: string, studentId: string, studentName: string, answers: { questionId: string, selectedOptionId: string }[]) => {
  const db = getDb();
  const subjectsCollection = db.collection<Subject>("subjects");
  const subject = await subjectsCollection.findOne({ _id: new ObjectId(subjectId) });
  if (!subject) throw new Error("Subject not found");

  const test = subject.tests.find(t => t._id.toString() === testId);
  if (!test) throw new Error("Test not found");

  // Check deadline
  if (test.deadline && new Date(test.deadline) < new Date()) {
    throw new Error("Test deadline has passed");
  }

  const studentResults = test.results.filter(r => r.studentId.toString() === studentId);
  if (studentResults.length >= test.attemptsAllowed) {
    throw new Error("Maximum attempts reached");
  }

  // Calculate score
  let correctCount = 0;
  answers.forEach(answer => {
    const question = test.questions.find(q => q.id === answer.questionId);
    if (question && question.correctOptionId === answer.selectedOptionId) {
      correctCount++;
    }
  });

  // Calculate score based on maxGrade
  const score = (correctCount / test.questionsToShow) * test.maxGrade;

  const result: TestResult = {
    _id: new ObjectId(),
    studentId: new ObjectId(studentId),
    studentName,
    score: Number(score.toFixed(2)),
    maxScore: test.maxGrade,
    attemptNumber: studentResults.length + 1,
    submittedAt: new Date(),
  };

  await subjectsCollection.findOneAndUpdate(
    { 
      _id: new ObjectId(subjectId),
      "tests._id": new ObjectId(testId)
    },
    { $push: { "tests.$.results": result as any } },
    { returnDocument: "after" }
  );

  wsManager.broadcast({ 
    type: 'test_submitted', 
    data: { subjectId, testId, studentId } 
  });

  return result;
};
