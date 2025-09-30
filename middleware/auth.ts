import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";

export default function auth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ApiError("Access denied. No token provided.", 402));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      role: "admin" | "user" | "provider";
    };

    (req as any).user = payload;
    next();
  } catch (error) {
    return next(new ApiError("Invalid token", 401));
  }
}

