import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { ReviewController } from "./review.controller.js";
import { ReviewValidation } from "./review.validation.js";

const router = Router();

router.post(
  "/reviews",
  auth(Role.Customer),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview,
);

export const ReviewRoutes = router;
