import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    gearItemId: z
      .string({ error: "Gear item ID is required" })
      .uuid({ error: "Invalid gear item ID format" }),
    rating: z
      .number({ error: "Rating must be a number" })
      .int({ error: "Rating must be an integer" })
      .min(1, { error: "Rating must be at least 1" })
      .max(5, { error: "Rating cannot exceed 5" }),
    comment: z
      .string({ error: "Comment is required" })
      .min(1, { error: "Comment cannot be empty" }),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
};
