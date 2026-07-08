import { ActiveStatus, Role } from "@prisma/client";
import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Name is required" })
      .min(1, { error: "Name cannot be empty" }),
    email: z.email({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Email is required"
          : "Invalid email format",
    }),
    password: z
      .string({ error: "Password is required" })
      .min(6, { error: "Password must be at least 6 characters long" }),
    role: z.enum([Role.Customer, Role.Provider], {
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Role is required"
          : "Invalid role selected. Must be Customer or Provider",
    }),
    profile_image: z.url({ error: "Invalid profile image URL" }).optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: "Name cannot be empty" }).optional(),
    email: z.email({ error: "Invalid email format" }).optional(),
    profile_image: z.url({ error: "Invalid profile image URL" }).optional(),
    bio: z.string().optional(),
  }),
});

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    active_status: z.nativeEnum(ActiveStatus, {
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Status is required"
          : "Invalid status selected. Must be Active or Inactive",
    }),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  updateUserStatusValidationSchema,
};
