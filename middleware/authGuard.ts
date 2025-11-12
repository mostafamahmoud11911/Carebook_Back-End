import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { UserJWT } from "../types";




export default function authGuard(...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user || !roles.includes((req.user as UserJWT).role)) {
      return next(new ApiError("Access denied", 403));
    }
    next();
  };
}
