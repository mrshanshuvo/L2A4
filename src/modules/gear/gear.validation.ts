import { z } from "zod";

const createGearValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Gear name is required" })
      .min(1, { error: "Gear name cannot be empty" }),
    description: z
      .string({ error: "Description is required" })
      .min(1, { error: "Description cannot be empty" }),
    brand: z
      .string({ error: "Brand is required" })
      .min(1, { error: "Brand cannot be empty" }),
    pricePerDay: z
      .number({ error: "Price per day must be a number" })
      .positive({ error: "Price per day must be greater than zero" }),
    stock: z
      .number({ error: "Stock must be a number" })
      .int({ error: "Stock must be an integer" })
      .nonnegative({ error: "Stock cannot be negative" }),
    imageUrl: z.url({ error: "Invalid image URL" }).optional(),
    categoryId: z
      .string({ error: "Category ID is required" })
      .uuid({ error: "Invalid Category ID format" }),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: "Gear name cannot be empty" }).optional(),
    description: z
      .string()
      .min(1, { error: "Description cannot be empty" })
      .optional(),
    brand: z.string().min(1, { error: "Brand cannot be empty" }).optional(),
    pricePerDay: z
      .number()
      .positive({ error: "Price per day must be greater than zero" })
      .optional(),
    stock: z
      .number()
      .int({ error: "Stock must be an integer" })
      .nonnegative({ error: "Stock cannot be negative" })
      .optional(),
    imageUrl: z.url({ error: "Invalid image URL" }).optional(),
    categoryId: z.string().uuid({ error: "Invalid Category ID format" }).optional(),
  }),
});

export const GearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
};
