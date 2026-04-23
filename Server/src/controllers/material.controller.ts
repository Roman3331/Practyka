import { Context } from "hono";
import { addMaterialToSubject, deleteMaterialFromSubject, updateMaterialInSubject } from "../services/material.service";
import { join } from "path";
import { writeFile } from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import { v4 as uuidv4 } from "uuid";

export const uploadMaterialFileController = async (c: Context) => {
  try {
    const user = c.get("user");
    const body = await c.req.parseBody();
    const file = body["file"] as File;

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can upload materials" }, 403);
    }

    if (!file) {
      return c.json({ error: "No file uploaded" }, 400);
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "materials");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const fileUrl = `http://localhost:3100/uploads/materials/${fileName}`;
    
    return c.json({ 
      message: "File uploaded successfully", 
      fileUrl,
      fileName: file.name
    });
  } catch (error: any) {
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
};

export const createMaterialController = async (c: Context) => {
  try {
    const user = c.get("user");
    const subjectId = c.req.param("subjectId");
    const { name, files } = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Only teachers can create materials" }, 403);
    }

    const materialData = {
      _id: uuidv4(),
      name: name,
      files: files || [],
      uploadedAt: new Date()
    };

    await addMaterialToSubject(subjectId, materialData);

    return c.json({ message: "Material created successfully", material: materialData });
  } catch (error: any) {
    console.error("Material creation error:", error);
    return c.json({ error: error.message || "Internal Server Error" }, 500);
  }
};

export const deleteMaterialController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, materialId } = c.req.param();

    if (user.role !== "teacher") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await deleteMaterialFromSubject(subjectId, materialId);
    return c.json({ message: "Material deleted" });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const updateMaterialController = async (c: Context) => {
  try {
    const user = c.get("user");
    const { subjectId, materialId } = c.req.param();
    const { name, files } = await c.req.json();

    if (user.role !== "teacher") {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await updateMaterialInSubject(subjectId, materialId, name, files);
    return c.json({ message: "Material updated successfully" });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};
