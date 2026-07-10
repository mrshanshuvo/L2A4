import { prisma } from "../../lib/prisma.js";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./category.interface.js";

const createCategoryInDB = async (payload: CreateCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (isExist) {
    throw new Error("Category already exists");
  }

  const result = await prisma.category.create({
    data: payload,
  });
  return result;
};

const getAllCategoriesFromDB = async () => {
  const result = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return result;
};

const updateCategoryInDB = async (id: string, payload: UpdateCategoryPayload) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });
  if (!isExist) {
    throw new Error("Category not found");
  }

  if (payload.name) {
    const duplicate = await prisma.category.findFirst({
      where: {
        name: payload.name,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new Error("Another category with this name already exists");
    }
  }

  const result = await prisma.category.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCategoryFromDB = async (id: string) => {
  const isExist = await prisma.category.findUnique({
    where: { id },
  });
  if (!isExist) {
    throw new Error("Category not found");
  }

  const result = await prisma.category.delete({
    where: { id },
  });
  return result;
};

export const CategoryService = {
  createCategoryInDB,
  getAllCategoriesFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
};
