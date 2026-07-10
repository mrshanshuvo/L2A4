import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "@prisma/client";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { RentalService } from "./rental.service.js";

const createRentalOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const customerId = req.user?.id as string;
    const result = await RentalService.createRentalOrderInDB(payload, customerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "Rental order placed successfully",
      data: result,
    });
  },
);

const getCustomerRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await RentalService.getCustomerRentalsFromDB(customerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Customer rentals retrieved successfully",
      data: result,
    });
  },
);

const getRentalById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as Role;
    const result = await RentalService.getRentalByIdFromDB(id, userId, userRole);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Rental order retrieved successfully",
      data: result,
    });
  },
);

const getProviderOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const result = await RentalService.getProviderOrdersFromDB(providerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Provider incoming orders retrieved successfully",
      data: result,
    });
  },
);

const updateRentalOrderStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as Role;
    const result = await RentalService.updateRentalOrderStatusInDB(
      id,
      status,
      userId,
      userRole,
    );

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: `Rental order status updated to ${status} successfully`,
      data: result,
    });
  },
);

const getAllRentalsAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await RentalService.getAllRentalsForAdminFromDB();

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "All platform rental orders retrieved successfully",
      data: result,
    });
  },
);

export const RentalController = {
  createRentalOrder,
  getCustomerRentals,
  getRentalById,
  getProviderOrders,
  updateRentalOrderStatus,
  getAllRentalsAdmin,
};
