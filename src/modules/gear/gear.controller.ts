import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { GearService } from "./gear.service.js";

const createGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const providerId = req.user?.id as string;
    const result = await GearService.createGearInDB(payload, providerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "Gear item listing created successfully",
      data: result,
    });
  },
);

const getAllGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const filters = req.query;
    const { meta, data } = await GearService.getAllGearFromDB(filters);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Gear items retrieved successfully",
      meta,
      data,
    });
  },
);

const getGearById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const result = await GearService.getGearByIdFromDB(id);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Gear item details retrieved successfully",
      data: result,
    });
  },
);

const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const payload = req.body;
    const providerId = req.user?.id as string;
    const result = await GearService.updateGearInDB(id, payload, providerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Gear item listing updated successfully",
      data: result,
    });
  },
);

const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const providerId = req.user?.id as string;
    const result = await GearService.deleteGearFromDB(id, providerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Gear item listing deleted successfully",
      data: result,
    });
  },
);

const getAllGearAdmin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { meta, data } = await GearService.getAllGearForAdminFromDB();

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "All platform gear items retrieved successfully",
      meta,
      data,
    });
  },
);

export const GearController = {
  createGear,
  getAllGear,
  getGearById,
  updateGear,
  deleteGear,
  getAllGearAdmin,
};
