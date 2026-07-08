import { Response } from "express";

type TMeta = {
  page: number;
  limit: number;
  total: number;
};

type TResponseData<T> = {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  meta?: TMeta;
};

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.status_code).json({
    success: data.success,
    status_code: data.status_code,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};
