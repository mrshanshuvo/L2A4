import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { GearController } from "./gear.controller.js";
import { GearValidation } from "./gear.validation.js";

const router = Router();

// Public routes
router.get("/gear", GearController.getAllGear);
router.get("/gear/:id", GearController.getGearById);

// Provider inventory routes
router.post(
  "/provider/gear",
  auth(Role.Provider),
  validateRequest(GearValidation.createGearValidationSchema),
  GearController.createGear,
);

router.put(
  "/provider/gear/:id",
  auth(Role.Provider),
  validateRequest(GearValidation.updateGearValidationSchema),
  GearController.updateGear,
);

router.delete(
  "/provider/gear/:id",
  auth(Role.Provider),
  GearController.deleteGear,
);

// Admin routes
router.get(
  "/admin/gear",
  auth(Role.Admin),
  GearController.getAllGearAdmin,
);

export const GearRoutes = router;
