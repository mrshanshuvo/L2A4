import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { CategoryController } from "./category.controller.js";
import { CategoryValidation } from "./category.validation.js";

const router = Router();

// Public route
router.get("/categories", CategoryController.getAllCategories);

// Admin-only routes
router.post(
  "/categories",
  auth(Role.Admin),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory,
);

router.put(
  "/categories/:id",
  auth(Role.Admin),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

router.delete(
  "/categories/:id",
  auth(Role.Admin),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;
