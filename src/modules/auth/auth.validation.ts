import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email({
      error: (issue) =>
        issue.input === undefined || issue.input === ""
          ? "Email is required"
          : "Invalid email format",
    }),
    password: z
      .string({ error: "Password is required" })
      .min(6, { error: "Password must be at least 6 characters long" }),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
};
