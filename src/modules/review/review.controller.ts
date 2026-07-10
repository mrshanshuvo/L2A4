import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { ReviewService } from "./review.service.js";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const customerId = req.user?.id as string;

    const result = await ReviewService.createReviewInDB(payload, customerId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  },
);

export const ReviewController = {
  createReview,
};
