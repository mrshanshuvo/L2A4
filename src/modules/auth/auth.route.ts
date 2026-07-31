import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

const router = Router();

router.post(
  "/auth/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser,
);

router.post("/auth/refresh-token", AuthController.refreshToken);
router.post("/auth/logout", AuthController.logoutUser);

export const AuthRoutes = router;
