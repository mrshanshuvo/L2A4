import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import { ZodError } from "zod";

export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let status_code;
  let error_message = error.message || "INTERNAL_SERVER_ERROR";
  let error_name = error.name || "INTERNAL_SERVER_ERROR";

  if (error instanceof ZodError) {
    status_code = httpStatus.BAD_REQUEST;
    error_name = "Validation Error";
    error_message = error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    status_code = httpStatus.BAD_REQUEST;
    error_message = "You have provided incorrect field type or missing fields";
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      status_code = httpStatus.BAD_REQUEST;
      const targetFields = (error.meta?.target as string[])?.join(", ");
      error_message = targetFields
        ? `Duplicate value for field(s): ${targetFields}`
        : "Duplicate Key Error";
    } else if (error.code === "P2003") {
      status_code = httpStatus.BAD_REQUEST;
      error_message = "Foreign key constraint failed";
    } else if (error.code === "P2025") {
      status_code = httpStatus.BAD_REQUEST;
      error_message =
        "An operation failed because it depends on one or more records that were required but not found";
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    if (error.errorCode === "P1000") {
      status_code = httpStatus.INTERNAL_SERVER_ERROR;
      error_message =
        "Authentication failed against database server. Please check your credentials";
    } else if (error.errorCode === "P1001") {
      status_code = httpStatus.INTERNAL_SERVER_ERROR;
      error_message = "Can't reach database server";
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    status_code = httpStatus.INTERNAL_SERVER_ERROR;
    error_message = "Error occurred during query execution";
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    status_code = httpStatus.INTERNAL_SERVER_ERROR;
    error_message = "Prisma engine crashed";
  } else {
    // For general errors that might have custom status codes (e.g. from validation or custom errors)
    status_code =
      error.statusCode || error.status || httpStatus.INTERNAL_SERVER_ERROR;
  }

  res.status(status_code).json({
    success: false,
    status_code: status_code,
    name: error_name,
    message: error_message,
    error: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
