import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import ApiError from "../utils/ApiError";

export default function validate(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined;

    const imgObj: {
      image?: Express.Multer.File;
      images?: Express.Multer.File[];
    } = {};

    if (req.file?.fieldname === "image") {
      imgObj.image = req.file;
    }

    if (files?.image && Array.isArray(files.image)) {
      imgObj.image = files.image[0];
    }

    if (files?.images && Array.isArray(files.images)) {
      imgObj.images = files.images;
    }

    const obj: { [key: string]: any; imgObj: typeof imgObj } = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...imgObj,
    };


    const { error } = schema.validate(obj, { abortEarly: false });
    if (error) {
      const message = error.details.map((detail) => detail.message);
      return next(new ApiError(message.join(", "), 400));
    }
    next();
  };
}
