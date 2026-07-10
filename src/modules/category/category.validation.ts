import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Category name is required" })
      .min(1, { error: "Category name cannot be empty" }),
    description: z.string().optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { error: "Category name cannot be empty" })
      .optional(),
    description: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
