import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync.js";
import { sendResponse } from "../../utils/sendResponse.js";
import { CategoryService } from "./category.service.js";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await CategoryService.createCategoryInDB(payload);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.CREATED,
      message: "Category created successfully",
      data: result,
    });
  },
);

const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CategoryService.getAllCategoriesFromDB();

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const payload = req.body;
    const result = await CategoryService.updateCategoryInDB(id, payload);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Category updated successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const result = await CategoryService.deleteCategoryFromDB(id);

    sendResponse(res, {
      success: true,
      status_code: httpStatus.OK,
      message: "Category deleted successfully",
      data: result,
    });
  },
);

export const CategoryController = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
