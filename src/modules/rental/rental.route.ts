import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { RentalValidation } from "./rental.validation.js";

// Note: ESM import suffix must be .js
import { RentalController as controller } from "./rental.controller.js";

const router = Router();

// Customer rental endpoints
router.post(
  "/rentals",
  auth(Role.Customer),
  validateRequest(RentalValidation.createRentalOrderValidationSchema),
  controller.createRentalOrder,
);

router.get(
  "/rentals",
  auth(Role.Customer),
  controller.getCustomerRentals,
);

// Specific order details (Customer, Provider, Admin can view if authorized in service)
router.get(
  "/rentals/:id",
  auth(Role.Customer, Role.Provider, Role.Admin),
  controller.getRentalById,
);

// Provider incoming orders endpoints
router.get(
  "/provider/orders",
  auth(Role.Provider),
  controller.getProviderOrders,
);

router.patch(
  "/provider/orders/:id",
  auth(Role.Provider, Role.Customer), // Customer needs this to cancel their rental
  validateRequest(RentalValidation.updateRentalOrderStatusValidationSchema),
  controller.updateRentalOrderStatus,
);

// Admin-only endpoints
router.get(
  "/admin/rentals",
  auth(Role.Admin),
  controller.getAllRentalsAdmin,
);

export const RentalRoutes = router;
