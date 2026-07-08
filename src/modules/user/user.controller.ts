import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

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
    const result = await UserService.getAllUsersFromDB();

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Users retrieved successfully",
      data: result,
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

export const UserController = {
  registerUser,
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserStatus,
};
