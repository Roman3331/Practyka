import { Context } from "hono";
import { createTest, deleteTest, getTestForStudent, submitTest, updateTest } from "../services/test.service";
import { testSchema } from "../schemas/schemas";

export const createTestController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const user = c.get("user");
    const body = await c.req.json();
    
    const validated = testSchema.parse(body);
    const test = await createTest(subjectId, user.userId, validated);
    
    return c.json(test, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateTestController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const testId = c.req.param("testId");
    const body = await c.req.json();
    
    const validated = testSchema.parse(body);
    const test = await updateTest(subjectId, testId, validated);
    
    return c.json(test, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const deleteTestController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const testId = c.req.param("testId");
    
    await deleteTest(subjectId, testId);
    return c.json({ success: true });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const getTestForStudentController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const testId = c.req.param("testId");
    const user = c.get("user");
    
    const data = await getTestForStudent(subjectId, testId, user.userId);
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const submitTestController = async (c: Context) => {
  try {
    const subjectId = c.req.param("subjectId");
    const testId = c.req.param("testId");
    const user = c.get("user");
    const body = await c.req.json(); // Array of { questionId, selectedOptionId }
    
    const result = await submitTest(
      subjectId, 
      testId, 
      user.userId, 
      `${user.firstName} ${user.lastName}`, 
      body.answers
    );
    
    return c.json(result);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
