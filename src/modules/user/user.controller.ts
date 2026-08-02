import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { UserService } from "./user.service.js";
import { uploadToCloudinary } from "../../lib/cloudinary.js";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const user = await UserService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "User registered successfully",
      data: user,
    });
  },
);

const getMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile = await UserService.getMyProfileFromDB(
      req.user?.id as string,
    );

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "User profile fetched successfully",
      data: profile,
    });
  },
);

const updateMyProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id as string;
    const payload = req.body;
    const updatedUser = await UserService.updateMyProfileIntoDB({
      id,
      payload,
    });

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "User profile updated successfully",
      data: updatedUser,
    });
  },
);

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { meta, data } = await UserService.getAllUsersFromDB();

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Users retrieved successfully",
      meta,
      data,
    });
  },
);

const updateUserStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { active_status } = req.body;

    const result = await UserService.updateUserStatusInDB(id, active_status);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "User status updated successfully",
      data: result,
    });
  },
);

const uploadImage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      throw new Error("No image file provided");
    }

    const result = await uploadToCloudinary(req.file.buffer, "gearup");

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Image uploaded to Cloudinary successfully",
      data: {
        url: result.url,
        public_id: result.public_id,
      },
    });
  },
);

export const UserController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserStatus,
  uploadImage,
};
