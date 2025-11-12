import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function uploadOnCloudinary(localFilePath: string) {

  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "services",
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export async function destroyFromCloudinary(imageUrl: string) {
  if (!imageUrl) return null;
  const urlParts = imageUrl.split("/upload/");
  if (urlParts.length < 2) return null;

  const pathWithVersion = urlParts[1];
  const pathParts = pathWithVersion.split("/");
  const filename = pathParts[pathParts.length - 1];
  const folder = pathParts.slice(1, pathParts.length - 1).join("/");
  const publicId = `${folder}/${filename.split(".")[0]}`;

  try {
    const response = await cloudinary.uploader.destroy(`${publicId}`);

    return response;
  } catch (error) {
    return null;
  }
}
