import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { PaymentController } from "./payment.controller.js";
import { PaymentValidation } from "./payment.validation.js";

const router = Router();

// Webhook endpoint (must not run auth middleware, accepts raw body)
router.post(
  "/payment/webhook",
  PaymentController.handleWebhook,
);

// Payment endpoints (Customer)
router.post(
  "/payments/create",
  auth(Role.Customer),
  validateRequest(PaymentValidation.createPaymentIntentValidationSchema),
  PaymentController.createPaymentIntent,
);

router.post(
  "/payments/confirm",
  auth(Role.Customer),
  PaymentController.confirmPayment,
);

// History and Details (Customer and Admin)
router.get(
  "/payments",
  auth(Role.Customer, Role.Admin),
  PaymentController.getUserPayments,
);

router.get(
  "/payments/:id",
  auth(Role.Customer, Role.Admin),
  PaymentController.getPaymentById,
);

export const PaymentRoutes = router;
