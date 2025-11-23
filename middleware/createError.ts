import { NextFunction, Request, Response } from "express";

export const createError = (
  callback: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => void | Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      callback(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
