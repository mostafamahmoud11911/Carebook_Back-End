import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import ApiError from "../utils/ApiError";

type Upload = multer.Multer;

function fileUpload(): Upload {
  const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb) {
      cb(null, `uploads/temp/`);
    },
    filename: function (req: Request, file: Express.Multer.File, cb) {
      const ext = file.mimetype.split("/")[1];
      const fileName = file.originalname.split(".")[0];
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${fileName}-${uniqueSuffix}.${ext}`);
    },
  });

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ): void {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only image files are allowed", 400));
    }
  }

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 },
  });

  return upload;
}

export function uploadSingle(
  fileName: string,
): ReturnType<Upload["single"]> {
  return fileUpload().single(fileName);
}

export function uploadMax(
  arrayOfFields: { name: string; maxCount?: number }[]
): ReturnType<Upload["fields"]> {
  return fileUpload().fields(arrayOfFields);
}
