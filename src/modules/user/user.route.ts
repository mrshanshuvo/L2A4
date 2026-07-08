import { Router } from "express";
import rateLimit from "express-rate-limit";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 register requests per hour
  message: {
    success: false,
    status_code: 429,
    message:
      "Too many accounts created from this IP, please try again after an hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Authentication / Profile Paths
router.post(
  "/auth/register",
  registerLimiter,
  validateRequest(UserValidation.createUserValidationSchema),
  UserController.registerUser,
);

router.get(
  "/auth/me",
  auth(Role.Admin, Role.Provider, Role.Customer),
  UserController.getMyProfile,
);

router.put(
  "/auth/me",
  auth(Role.Admin, Role.Provider, Role.Customer),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserController.updateMyProfile,
);

// Admin User Management Paths
router.get("/admin/users", auth(Role.Admin), UserController.getAllUsers);

router.patch(
  "/admin/users/:id",
  auth(Role.Admin),
  validateRequest(UserValidation.updateUserStatusValidationSchema),
  UserController.updateUserStatus,
);

export const UserRoutes = router;
