import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "@prisma/client";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { PaymentService } from "./payment.service.js";

const createPaymentIntent = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalOrderId } = req.body;
    const customerId = req.user?.id as string;

    const result = await PaymentService.createPaymentIntentInDB(
      rentalOrderId,
      customerId,
    );

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "Payment intent created successfully",
      data: result,
    });
  },
);

const confirmPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { transactionId } = req.body;

    if (!transactionId) {
      throw new Error("transactionId is required");
    }

    const result = await PaymentService.confirmPaymentInDB(transactionId);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Payment confirmed successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // req.body here needs to be the raw buffer (raw body string or buffer)
    const result = await PaymentService.handleStripeWebhook(req.body, signature);

    res.status(httpStatus.OK).json(result);
  },
);

const getUserPayments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const role = req.user?.role as Role;

    const { meta, data } = await PaymentService.getUserPaymentsFromDB(userId, role);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Payment history retrieved successfully",
      meta,
      data,
    });
  },
);

const getPaymentById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const role = req.user?.role as Role;

    const result = await PaymentService.getPaymentByIdFromDB(id, userId, role);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Payment details retrieved successfully",
      data: result,
    });
  },
);

export const PaymentController = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  getUserPayments,
  getPaymentById,
};
