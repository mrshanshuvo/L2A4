import { z } from "zod";

const createPaymentIntentValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z
      .string({ error: "Rental order ID is required" })
      .uuid({ error: "Invalid rental order ID format" }),
  }),
});

export const PaymentValidation = {
  createPaymentIntentValidationSchema,
};
