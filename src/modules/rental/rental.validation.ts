import { RentalOrderStatus } from "@prisma/client";
import { z } from "zod";

const createRentalOrderValidationSchema = z.object({
  body: z.object({
    gearItemId: z
      .string({ error: "Gear item ID is required" })
      .uuid({ error: "Invalid gear item ID format" }),
    startDate: z
      .string({ error: "Start date is required" })
      .min(1, { error: "Start date cannot be empty" }),
    endDate: z
      .string({ error: "End date is required" })
      .min(1, { error: "End date cannot be empty" }),
  }),
});

const updateRentalOrderStatusValidationSchema = z.object({
  body: z.object({
    status: z.nativeEnum(RentalOrderStatus, {
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Status is required"
          : `Invalid status. Must be one of: ${Object.values(RentalOrderStatus).join(", ")}`,
    }),
  }),
});

export const RentalValidation = {
  createRentalOrderValidationSchema,
  updateRentalOrderStatusValidationSchema,
};
