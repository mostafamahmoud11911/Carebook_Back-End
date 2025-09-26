import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";




export default function authGuard(...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError("Access denied", 403));
    }
    next();
  };
}
