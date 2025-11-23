import { NextFunction, Request, Response } from "express";
import { createError } from "./createError";
import User from "../db/models/user.model";
import ApiError from "../utils/ApiError";

const checkEmail = createError(
  async (req: Request, res: Response, next: NextFunction) => {
    const email = await User.findOne({ where: { email: req.body.email } });

    if (email) {
      return next(new ApiError("Email already exists", 409));
    }

    next();
  }
);


export default checkEmail;